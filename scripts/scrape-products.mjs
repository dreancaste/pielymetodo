import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Attempt to load .env.local or .env for local development
const envFiles = [".env.local", ".env"];
for (const envFile of envFiles) {
  const envPath = path.join(__dirname, "..", envFile);
  if (fs.existsSync(envPath)) {
    try {
      if (typeof process.loadEnvFile === "function") {
        process.loadEnvFile(envPath);
      }
    } catch (_) { }
  }
}

const EMAIL = process.env.SITE_EMAIL;
const PASSWORD = process.env.SITE_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error("Missing SITE_EMAIL / SITE_PASSWORD environment variables.");
  process.exit(1);
}

const MARKUP = 1.2;
const MIN_EXPECTED_PRODUCTS = 80; // sanity floor so a broken scrape can't wipe the catalog

// Load catalog config
const configPath = path.join(__dirname, "catalog-urls.json");
if (!fs.existsSync(configPath)) {
  console.error(`Missing catalog configuration file: ${configPath}`);
  process.exit(1);
}

const catalogData = JSON.parse(fs.readFileSync(configPath, "utf8"));
const CATEGORIES = catalogData.categories || [];
const URLS = catalogData.urls || {};

const KNOWN_BRANDS = [
  "Green Line Exel",
  "Dherma Sun",
  "Idraet Amiin",
  "Idraet",
  "Lidherma",
  "Icono",
  "Dermassy",
  "Libra",
  "Exel",
  "Biobellus",
  "Carthage",
  "Prodermic",
  "Collage",
];

function inferBrand(name, url) {
  const hay = `${name} ${url}`;
  for (const brand of KNOWN_BRANDS) {
    const re = new RegExp(brand.replace(/\s+/g, "[\\s-]+"), "i");
    if (re.test(hay)) return brand;
  }
  return "Otras marcas";
}

function parseArsPrice(text) {
  if (!text) return null;
  // Match the first valid price token (avoid concatenating current + discount prices)
  const match = text.match(/\$?\s*(\d{1,3}(?:\.\d{3})+(?:,\d+)?|\d+(?:[.,]\d+)?)/);
  if (!match) return null;

  let cleaned = match[1];
  if (cleaned.includes(".") && cleaned.includes(",")) {
    cleaned = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(".")) {
    const parts = cleaned.split(".");
    if (parts.length > 1 && parts.every((p, i) => i === 0 || p.length === 3)) {
      cleaned = cleaned.replace(/\./g, "");
    }
  } else if (cleaned.includes(",")) {
    cleaned = cleaned.replace(",", ".");
  }

  const value = parseFloat(cleaned);
  // Cap at 10,000,000 ARS to protect against any corrupted string concatenations
  return Number.isFinite(value) && value > 0 && value < 10000000 ? Math.round(value) : null;
}

function markup(price) {
  if (price === null || price === undefined) return null;
  return Math.round(price * MARKUP);
}

function slugify(url) {
  const last = url.split("/").filter(Boolean).pop() || "";
  return last.replace(/\.html?$/i, "");
}

// Loads previous products from products.ts to use as resilient fallback
function loadExistingProducts(targetPath) {
  if (!fs.existsSync(targetPath)) return new Map();
  try {
    const content = fs.readFileSync(targetPath, "utf8");
    const map = new Map();
    const regex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"((?:\\.|[^"\\])*)",\s*brand:\s*"((?:\\.|[^"\\])*)",\s*category:\s*"([^"]+)",\s*price:\s*([0-9.]+),\s*compareAtPrice:\s*([^,]+),\s*image:\s*"([^"]+)"\s*\}/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const [, id, name, brand, category, priceStr, compareAtPriceStr, image] = match;
      const price = parseFloat(priceStr);
      const compareAt = compareAtPriceStr.trim() === "null" ? null : parseFloat(compareAtPriceStr.trim());
      // Discard previously corrupted prices (> 10 million)
      if (price > 10000000) continue;
      map.set(id, {
        id,
        name: name.replace(/\\"/g, '"'),
        brand: brand.replace(/\\"/g, '"'),
        category,
        price,
        compareAtPrice: compareAt && compareAt < 10000000 ? compareAt : null,
        image,
      });
    }
    return map;
  } catch (err) {
    console.warn("Could not read previous products for fallback:", err.message);
    return new Map();
  }
}

async function scrapeOne(page, url, category) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 25000 });
  } catch (error) {
    throw new Error(`Timeout o error de carga: ${error.message}`);
  }

  await page.waitForSelector("h1", { timeout: 8000 }).catch(() => { });

  const name = await page.locator("h1").first().textContent().catch(() => null);

  // Extract current price cleanly (checking content attribute and targeted child selectors first)
  const priceSelectors = [
    ".current-price [itemprop='price']",
    ".current-price-value",
    ".current-price",
    ".product-price [itemprop='price']",
    "[itemprop='price']",
    ".product-price",
    ".price",
  ];

  let currentPrice = null;
  for (const sel of priceSelectors) {
    const el = page.locator(sel).first();
    const count = await el.count().catch(() => 0);
    if (count > 0) {
      const contentAttr = await el.getAttribute("content").catch(() => null);
      if (contentAttr && !isNaN(parseFloat(contentAttr))) {
        const val = parseFloat(contentAttr);
        if (val > 0 && val < 10000000) {
          currentPrice = Math.round(val);
          break;
        }
      }
      const text = await el.textContent().catch(() => null);
      const parsed = parseArsPrice(text);
      if (parsed !== null) {
        currentPrice = parsed;
        break;
      }
    }
  }

  const regularText = await page
    .locator(".regular-price")
    .first()
    .textContent({ timeout: 4000 })
    .catch(() => null);
  const regularPrice = parseArsPrice(regularText);

  const imgEl = page.locator("#product-images img, .product-cover img, img[itemprop='image']").first();
  const image =
    (await imgEl.getAttribute("src", { timeout: 4000 }).catch(() => null)) ||
    (await imgEl.getAttribute("data-src", { timeout: 1000 }).catch(() => null));

  if (!name || !image) {
    throw new Error(`Falta nombre o imagen en ${url}`);
  }

  const cleanName = name.replace(/\s+/g, " ").trim();
  const price = markup(currentPrice);
  if (price === null) {
    throw new Error(`No se pudo obtener precio en ${url}`);
  }

  const onSale = regularPrice !== null && currentPrice !== null && currentPrice < regularPrice;
  const compareAtPrice = onSale ? markup(regularPrice) : null;

  return {
    id: slugify(url),
    name: cleanName,
    brand: inferBrand(cleanName, url),
    category,
    price,
    compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : null,
    image,
  };
}

async function scrapeWithRetries(page, url, category, maxRetries = 2, logPrefix = "") {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const product = await scrapeOne(page, url, category);
      if (product) return product;
    } catch (err) {
      if (attempt < maxRetries) {
        console.warn(`${logPrefix} Reintentando (${attempt}/${maxRetries}): ${err.message}`);
        await new Promise((r) => setTimeout(r, 2000));
      } else {
        console.warn(`${logPrefix} Falló tras ${maxRetries} intentos: ${err.message}`);
      }
    }
  }
  return null;
}

async function main() {
  const startTime = Date.now();

  // CLI Arguments parsing
  const args = process.argv.slice(2);
  const categoryFilter = args.find((a) => a.startsWith("--category="))?.split("=")[1];
  const limitArg = args.find((a) => a.startsWith("--limit="))?.split("=")[1];
  const urlArg = args.find((a) => a.startsWith("--url="))?.split("=")[1];
  const concurrencyArg = args.find((a) => a.startsWith("--concurrency="))?.split("=")[1];

  const CONCURRENCY = Math.max(1, parseInt(concurrencyArg || process.env.SCRAPE_CONCURRENCY || "4", 10));

  const outPath = path.join(__dirname, "..", "src", "data", "products.ts");
  const previousProductsMap = loadExistingProducts(outPath);

  // Build target queue
  let targets = [];
  if (urlArg) {
    targets.push({ url: urlArg, category: categoryFilter || "otros" });
  } else {
    const selectedCategories = categoryFilter ? [categoryFilter] : Object.keys(URLS);
    for (const cat of selectedCategories) {
      const list = URLS[cat] || [];
      for (const url of list) {
        targets.push({ url, category: cat });
      }
    }
  }

  if (limitArg) {
    const limit = parseInt(limitArg, 10);
    if (!isNaN(limit) && limit > 0) {
      targets = targets.slice(0, limit);
    }
  }

  if (targets.length === 0) {
    console.error("No URLs to scrape. Check category filter or catalog-urls.json.");
    process.exit(1);
  }

  console.log(`🚀 Iniciando importación: ${targets.length} productos con concurrencia de ${CONCURRENCY} workers...`);

  const browser = await chromium.launch({
    args: ["--disable-gpu", "--disable-dev-shm-usage", "--no-sandbox"],
  });

  const context = await browser.newContext();

  // Step 1: Login once with a dedicated page
  console.log("Iniciando sesión en cosmetologasargentinas.com...");
  const loginPage = await context.newPage();
  loginPage.setDefaultTimeout(25000);

  await loginPage.goto("https://www.cosmetologasargentinas.com/iniciar-sesion", { waitUntil: "domcontentloaded" });
  await loginPage.locator('input[type="email"], input[name*="mail" i]').first().fill(EMAIL);
  await loginPage.locator('input[type="password"]').first().fill(PASSWORD);
  await Promise.all([
    loginPage.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => { }),
    loginPage.locator('button[type="submit"], input[type="submit"]').first().click(),
  ]);

  const loggedIn = await loginPage
    .locator('a[href*="cerrar-sesion"], a[href*="logout"], a[href*="mi-cuenta"]')
    .count();

  if (!loggedIn) {
    await browser.close();
    console.error("Login failed — aborting without touching products.ts.");
    process.exit(1);
  }
  console.log("✅ Sesión iniciada correctamente.");
  await loginPage.close();

  // Step 2: Block heavy assets (images, stylesheets, fonts, trackers) across all subsequent requests
  await context.route("**/*", (route) => {
    const type = route.request().resourceType();
    if (["image", "media", "font", "stylesheet"].includes(type)) {
      return route.abort();
    }
    const reqUrl = route.request().url().toLowerCase();
    if (
      reqUrl.includes("google-analytics") ||
      reqUrl.includes("googletagmanager") ||
      reqUrl.includes("facebook.net") ||
      reqUrl.includes("clarity.ms") ||
      reqUrl.includes("hotjar") ||
      reqUrl.includes("connect.facebook")
    ) {
      return route.abort();
    }
    return route.continue();
  });

  // Step 3: Run worker pool
  const results = new Array(targets.length);
  let cursor = 0;
  let fallbackCount = 0;
  let successCount = 0;

  const numWorkers = Math.min(CONCURRENCY, targets.length);

  async function worker(workerId) {
    const page = await context.newPage();
    page.setDefaultTimeout(25000);

    while (true) {
      const index = cursor++;
      if (index >= targets.length) break;

      const target = targets[index];
      const prefix = `[W${workerId}][${index + 1}/${targets.length}]`;

      let product = await scrapeWithRetries(page, target.url, target.category, 2, prefix);

      // Resilient fallback to previous data if scrape failed
      if (!product) {
        const slug = slugify(target.url);
        const prev = previousProductsMap.get(slug);
        if (prev) {
          console.warn(`${prefix} ⚠️ Usando datos previos para: ${slug}`);
          product = prev;
          fallbackCount++;
        }
      }

      results[index] = product;

      if (product) {
        successCount++;
        console.log(`${prefix} ✅ [${product.category}] ${product.name.slice(0, 45)} -> $${product.price}`);
      } else {
        console.error(`${prefix} ❌ No se pudo obtener: ${target.url}`);
      }
    }

    await page.close();
  }

  const workers = Array.from({ length: numWorkers }, (_, i) => worker(i + 1));
  await Promise.all(workers);
  await browser.close();

  const validScraped = results.filter(Boolean);
  const seenIds = new Set();
  const finalProducts = [];

  // Deduplicate products
  for (const p of validScraped) {
    if (seenIds.has(p.id)) continue;
    seenIds.add(p.id);
    finalProducts.push(p);
  }

  // If running a partial update (--category or --url), preserve the rest of previous products
  if (categoryFilter || urlArg || limitArg) {
    console.log("Modo selectivo activo: fusionando resultados con el catálogo existente...");
    for (const [id, prev] of previousProductsMap.entries()) {
      if (!seenIds.has(id)) {
        seenIds.add(id);
        finalProducts.push(prev);
      }
    }
  } else {
    // Full run check
    if (finalProducts.length < MIN_EXPECTED_PRODUCTS) {
      console.error(
        `Only got ${finalProducts.length} products (expected >= ${MIN_EXPECTED_PRODUCTS}). Aborting without touching products.ts.`
      );
      process.exit(1);
    }
  }

  // Write products.ts
  const categoryList = CATEGORIES.filter((c) => finalProducts.some((p) => p.category === c.slug));

  const ts = (v) => JSON.stringify(v);
  const lines = [];
  lines.push("export type Category = {");
  lines.push("  slug: string;");
  lines.push("  name: string;");
  lines.push("};");
  lines.push("");
  lines.push("export type Product = {");
  lines.push("  id: string;");
  lines.push("  name: string;");
  lines.push("  brand: string;");
  lines.push("  category: string;");
  lines.push("  price: number;");
  lines.push("  compareAtPrice: number | null;");
  lines.push("  image: string;");
  lines.push("};");
  lines.push("");
  lines.push(`export const categories: Category[] = ${JSON.stringify(categoryList, null, 2)};`);
  lines.push("");
  lines.push("export const products: Product[] = [");
  for (const p of finalProducts) {
    lines.push(
      `  { id: ${ts(p.id)}, name: ${ts(p.name)}, brand: ${ts(p.brand)}, category: ${ts(p.category)}, price: ${p.price}, compareAtPrice: ${p.compareAtPrice === null ? "null" : p.compareAtPrice
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

  fs.writeFileSync(outPath, lines.join("\n"), "utf8");

  const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Finalizado en ${elapsedSeconds}s:`);
  console.log(`   - Total productos guardados: ${finalProducts.length}`);
  console.log(`   - Obtenidos en vivo: ${successCount - fallbackCount}`);
  console.log(`   - Preservados de catálogo previo (fallback): ${fallbackCount}`);
  console.log(`   - Archivo escrito: ${outPath}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
