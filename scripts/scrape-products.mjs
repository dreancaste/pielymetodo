// Refreshes src/data/products.ts with current prices from the supplier site.
// Requires SITE_EMAIL and SITE_PASSWORD env vars (never hardcode credentials here).
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EMAIL = process.env.SITE_EMAIL;
const PASSWORD = process.env.SITE_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Missing SITE_EMAIL / SITE_PASSWORD environment variables.");
  process.exit(1);
}

const BRANDS = ["IDRAET", "LIDHERMA", "ICONO", "DERMASSY"];
const MAX_PRICE = 50000;
const MARKUP = 1.2;
const MIN_EXPECTED_PRODUCTS = 300; // sanity floor so a broken scrape can't wipe the catalog

const brandMeta = {
  IDRAET: { slug: "idraet", name: "Idraet" },
  LIDHERMA: { slug: "lidherma", name: "Lidherma" },
  ICONO: { slug: "icono", name: "Icono" },
  DERMASSY: { slug: "dermassy", name: "Dermassy" },
};

function parseArsPrice(text) {
  if (!text) return null;
  const cleaned = text.replace(/[^\d.,]/g, "").trim();
  if (!cleaned) return null;
  const normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? Math.round(value) : null;
}

function slugify(url) {
  const last = url.split("/").filter(Boolean).pop() || "";
  return last.replace(/\.html?$/i, "");
}

function cleanName(name, alt) {
  const base = name.replace(/\s+/g, " ").trim();
  if (!base.endsWith("...")) return base;
  if (!alt) return base;
  let cleaned = alt.replace(/\s+/g, " ").trim();
  cleaned = cleaned.replace(/\s+de\s+(IDRAET|LIDHERMA|ICONO|DERMASSY)\b.*$/i, "");
  return cleaned || base;
}

function markup(price) {
  if (price === null || price === undefined) return null;
  return Math.round(price * MARKUP);
}

async function scrapeBrand(page, brand, results) {
  let pageNum = 1;
  let total = null;
  while (true) {
    const url = `https://www.cosmetologasargentinas.com/facial/?q=Marca-${brand}&page=${pageNum}`;
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page
      .waitForSelector("article.product-miniature, .js-product-miniature", { timeout: 15000 })
      .catch(() => {});

    if (total === null) {
      const bodyText = await page.locator("body").innerText();
      const m = bodyText.match(/Todos los productos \((\d+)\)/i);
      total = m ? parseInt(m[1], 10) : 0;
    }

    const cards = await page.$$eval("article.product-miniature, .js-product-miniature", (nodes) =>
      nodes.map((node) => {
        const link = node.querySelector("a.product-thumbnail, a.thumbnail");
        const titleEl = node.querySelector(".product-title a, h2 a, h3 a");
        const img = node.querySelector("img");
        const priceEl = node.querySelector(".price:not(.regular-price)");
        const regularEl = node.querySelector(".regular-price");
        return {
          url: link ? link.getAttribute("href") : null,
          name: titleEl ? titleEl.textContent.trim() : null,
          imgAlt: img ? img.getAttribute("alt") : null,
          image: img ? img.getAttribute("src") : null,
          priceText: priceEl ? priceEl.textContent.trim() : null,
          regularPriceText: regularEl ? regularEl.textContent.trim() : null,
        };
      })
    );

    for (const c of cards) {
      if (!c.url || !c.name) continue;
      results.push({
        brand,
        name: c.name,
        imgAlt: c.imgAlt,
        url: c.url,
        image: c.image,
        currentPrice: parseArsPrice(c.priceText),
        regularPrice: parseArsPrice(c.regularPriceText),
      });
    }

    const collected = results.filter((p) => p.brand === brand).length;
    if (cards.length === 0 || collected >= total) break;
    pageNum += 1;
    if (pageNum > 40) break;
  }
}

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(25000);

  await page.goto("https://www.cosmetologasargentinas.com/iniciar-sesion", { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"], input[name*="mail" i]').first().fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {}),
    page.locator('button[type="submit"], input[type="submit"]').first().click(),
  ]);

  const loggedIn = await page
    .locator('a[href*="cerrar-sesion"], a[href*="logout"], a[href*="mi-cuenta"]')
    .count();
  if (!loggedIn) {
    await browser.close();
    console.error("Login failed — aborting without touching products.ts.");
    process.exit(1);
  }

  const raw = [];
  for (const brand of BRANDS) {
    await scrapeBrand(page, brand, raw);
    console.log(`${brand}: ${raw.filter((p) => p.brand === brand).length} products`);
  }

  await browser.close();

  if (raw.length < MIN_EXPECTED_PRODUCTS) {
    console.error(
      `Only found ${raw.length} products (expected at least ${MIN_EXPECTED_PRODUCTS}). The site layout may have changed — aborting without touching products.ts.`
    );
    process.exit(1);
  }

  const seenIds = new Set();
  const products = [];
  for (const p of raw) {
    const brand = brandMeta[p.brand];
    if (!brand) continue;
    let id = slugify(p.url);
    if (seenIds.has(id)) id = `${id}-${brand.slug}`;
    seenIds.add(id);

    const price = markup(p.currentPrice);
    if (price === null || price > MAX_PRICE) continue;
    const onSale = p.regularPrice !== null && p.currentPrice !== null && p.currentPrice < p.regularPrice;
    const compareAtPrice = onSale ? markup(p.regularPrice) : null;

    products.push({
      id,
      name: cleanName(p.name, p.imgAlt),
      brand: brand.slug,
      price,
      compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : null,
      image: p.image,
    });
  }

  products.sort((a, b) => a.brand.localeCompare(b.brand) || a.name.localeCompare(b.name));

  const categories = Object.values(brandMeta).map((b) => ({
    slug: b.slug,
    name: b.name,
    description: `Productos ${b.name} para cuidado facial profesional`,
  }));

  const ts = (v) => JSON.stringify(v);
  const lines = [];
  lines.push("export type Category = {");
  lines.push("  slug: string;");
  lines.push("  name: string;");
  lines.push("  description: string;");
  lines.push("};");
  lines.push("");
  lines.push("export type Product = {");
  lines.push("  id: string;");
  lines.push("  name: string;");
  lines.push("  brand: string;");
  lines.push("  price: number;");
  lines.push("  compareAtPrice: number | null;");
  lines.push("  image: string;");
  lines.push("};");
  lines.push("");
  lines.push(`export const categories: Category[] = ${JSON.stringify(categories, null, 2)};`);
  lines.push("");
  lines.push("export const products: Product[] = [");
  for (const p of products) {
    lines.push(
      `  { id: ${ts(p.id)}, name: ${ts(p.name)}, brand: ${ts(p.brand)}, price: ${p.price}, compareAtPrice: ${
        p.compareAtPrice === null ? "null" : p.compareAtPrice
      }, image: ${ts(p.image)} },`
    );
  }
  lines.push("];");
  lines.push("");
  lines.push(`export function formatPrice(price: number) {
  return price.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}
`);

  const outPath = path.join(__dirname, "..", "src", "data", "products.ts");
  fs.writeFileSync(outPath, lines.join("\n"), "utf8");
  console.log(`Wrote ${products.length} products to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
