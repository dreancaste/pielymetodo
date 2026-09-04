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

const MARKUP = 1.2;
const MIN_EXPECTED_PRODUCTS = 80; // sanity floor so a broken scrape can't wipe the catalog

const CATEGORIES = [
  { slug: "limpieza", name: "Limpieza" },
  { slug: "proteccion-solar", name: "Protección Solar" },
  { slug: "serums", name: "Sérums" },
  { slug: "tonicos", name: "Tónicos" },
  { slug: "cremas-geles-emulsiones", name: "Cremas, Geles y Emulsiones" },
  { slug: "contorno-de-ojos", name: "Contorno de Ojos" },
  { slug: "otros", name: "Otros" },
];

const URLS = {
  limpieza: [
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-limpiadores/leche-limpiadora-suavizante-185-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-limpiadores/gel-limpiador-puricante-200-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-limpiadores/emulsion-de-limpieza-alpine-roses-100-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/gel-de-limpieza-sebo-200-ml-libra.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/gel-de-limpieza-pieles-mixtas-x-200-ml-libra.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-limpiadores/espuma-micelar-de-limpieza-con-vitamina-c-60-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/3-en-1-micellar-water-agua-micelar-3-en-1-200-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/gel-de-limpieza-pieles-sensibles-x-200-ml-libra.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/lidherma/lidherma-facial/lidherma-limpiadores/desmaquillante-de-ojos-125-ml-lidherma.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/espuma-limpiadora-mousse-cleanser-200-gr-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/icono-espuma-de-limpieza-facial-fix-c-60-gr.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/aceite-de-limpieza-y-desmaquillante-100-ml-green-line-exel.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/leche-limpieza-purif-220-grs-icono.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/aceite-de-limpieza-facial-biobellus-100ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/icono-espuma-coral-60-ml.html",
    "https://www.cosmetologasargentinas.com/promociones-mensuales/idraet-amiin-gel-de-limpieza-centella-asiatica.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/prodermic/prodermic-facial/pdm-limpiadores/biphase-clean-prodermic-desmaquillante-micelar-en-2-fases-130-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/prodermic/prodermic-facial/pdm-limpiadores/agua-micelar-soft-clean-130-ml-prodermic.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/gel-espuma-200-grs-vinoterapia-icono.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/exel/exel-facial/exel-limpiadores/higiene-emulsion-limpieza-c-vitamina-e-250-ml-c-valvula-exel.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/prodermic/prodermic-facial/pdm-limpiadores/lumi-clean-prodermic-gel-de-higiene-con-mandelico-150-ml.html",
  ],
  "proteccion-solar": [
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-protectores-solares/crema-protector-solar-spf-30-sin-color-75-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/protector-solar-crema-gel-spf-40-toque-seco-50-gr-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/protector-solar-spf50-sin-color-facial-amplio-espectro-100-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/protector-solar-antiage-sin-color-50-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-protectores-solares/spray-pantalla-solar-spf-50-corporal-145-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/icono-facial/icono-emulsiones-y-cremas/fotoprot-emulsion-fps-40-invisible-icono.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/exel/exel-facial/exel-protectores-solares/solar-xl-sun-shield-spf-31-150-ml-exel.html",
  ],
  serums: [
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/serum-vitamina-b12-anti-rojeces-30-gr-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-serums/serum-vitamina-b5-reparador-idraet-30-gr.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-serum-hialuronico-1-hidratacion-intensiva-30-g.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/booster-hyaluron-libra.html",
    "https://www.cosmetologasargentinas.com/promociones-mensuales/idraet-amiin-step-3-serum-tratamiento-con-niacinamida-30-ml.html",
    "https://www.cosmetologasargentinas.com/promociones-mensuales/serum-vitamina-c-acido-hialuronico-idraet-amiin-step-3-30-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/booster-niacinamide-zinc-libra.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/booster-c-vitamin-libra.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/booster-collagen-libra.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/biobellus/suero-facial-nano-hialuronico-30-ml-biobellus.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/booster-instant-lift-libra.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/booster-calming-libra.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/booster-retinol-libra.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/biobellus/suero-facial-niacinamida-30-ml-biobellus.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-niacinamide-zinc-serum-pore-refiner-30-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/exel-serum-niacinamida-vit-b3-30-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/serum-therapy-n10-cicaboost-50-ml-libra.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/biobellus/suero-facial-iluminador-30-ml-biobellus.html",
    "https://www.cosmetologasargentinas.com/lanzamientos/-vitamin-a-serum-serum-redensificante.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/serum-vitamina-c-retinol-30-cc-collage.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/prodermic/prodermic-facial/pdm-serums/pro-bio-eclair-50-ml-prodermic.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/lidherma/lidherma-facial/lidherma-serums/serum-hyaluronic-4d-20-gr-lidherma.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/prodermic/prodermic-facial/pdm-serums/pro-sos-balsam-200-ml-prodermic.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/carthage/solucion-facial-regeneracion-o2-carthage.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/icono-fix-c-booster-20-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/icono-serum-esencial-regenerante-retinol-vitamina-e-30-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/carthage/serum-dermo-calmante-x-60-cc-carthage.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/serum-pro-colageno-30-ml-biobellus.html",
    "https://www.cosmetologasargentinas.com/facial/serums/pro-hyalu7-bioserum-30-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/icono-acido-hialuronico-30-cc.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/exel/exel-facial/exel-serums/producto-lujo-age-defy-30-ml-exel.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/prodermic/prodermic-facial/pdm-limpiadores/leche-de-limpieza-daily-clean-210-ml-prodermic.html",
  ],
  tonicos: [
    "https://www.cosmetologasargentinas.com/nuestras-marcas/agua-de-rosas-alpine-roses-brume-antiage-100-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-lociones/zenskin-sos-rescue-brume-bruma-calmante-de-rescate-100-ml.html",
    "https://www.cosmetologasargentinas.com/promociones-mensuales/tonico-hidratante-con-centella-asiatica-acido-hialuronico-idraet-amiin-step-2-125-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/biobellus/bruma-facial-relax-avena-y-calendula-biobellus-200-ml.html",
    "https://www.cosmetologasargentinas.com/promociones-mensuales/idraet-amiin-step-1-tonico-equilibrante-con-acido-salicilico-2-x125ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-lociones/idraet-vitamin-c-all-day-radiance-lotion-locion-revitalizante-100-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/splash-antioxidante-120-grs-vinoterapia-icono.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/prodermic/prodermic-facial/pdm-lociones/pro-hyaluronic-lotion-130-ml.html",
  ],
  "cremas-geles-emulsiones": [
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/pro-reti-c-crema-con-retinol-vitamina-c-50-gr-idraet.html",
    "https://www.cosmetologasargentinas.com/idraet-cica-b5-light-emulsion-emulsion-fluida-60-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-cica-b5-barrier-booster-cream-50-g-reparacion-calma-e-hidratacion-intensiva.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-emulsiones-y-cremas/thermal-new-crema-hidratante-ligera-50-gr-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-emulsiones-y-cremas/emulsion-niacinamide-zinc-hidratante-60-gr-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/exel/exel-gel-hidratante-reparador-vit-c-30-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-emulsiones-y-cremas/crema-gel-vitamina-c-reparador-75-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-emulsiones-y-cremas/crema-hidratante-pro-hyaluron-relleno-de-arrugas-50-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-emulsiones-y-cremas/crema-lifting-sublime-dmae-tensora-50-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/maquillaje/anti-age-hydrating-cream-crema-antiage-hidratante-30-g-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/lidherma/lidherma-facial/lidherma-emulsiones-y-cremas/solucion-dherma-science-10-amp-x-2-ml-c-u-lidherma.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/crema-hidratante-plus-100-grs-icono.html",
  ],
  "contorno-de-ojos": [
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/vitamin-c-eyes-contorno-de-ojos-15-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/contorno-de-ojos-thermal-new-15-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-contorno-de-ojos/contorno-de-ojos-pro-reti-c-eye-contour-reparador-15-gr-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/serum-sublime-eyes-pepetides-3-contorno-de-ojos-bolsas-y-ojeras-15-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/parche-niacinamida-y-cafeina-eyes-descongestivo-16-ml-24-parches-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-contorno-de-ojos/contorno-de-ojos-alpine-roses-10-gr-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/collage-contorno-peptidos-tensor-eyes-argireline-achialuronico-liposomas-de-cafeina-y-calendula-30-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/lidherma/contorno-de-ojos-b12-refuerza-la-barrera-cutanea-15g-lidherma-.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/prodermic-lissage-bio-serum-new-30gr.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/contorno-de-ojos-con-acido-hialuronico-30-cc-collage.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/exel/exel-facial/exel-contorno-de-ojos/concentrado-facial-gel-p-cont-ojo-c-uniesf-y-aloe-pomo-30-ml-exel.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/lidherma/lidherma-facial/lidherma-contorno-de-ojos/contorno-de-ojos-hydrapore-15-gr-lidherma.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/idraet-facial/idraet-contorno-de-ojos/idraet-pro-hyaluron-eyes-crema-gel-contorno-de-ojos-15-grs-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/eyes-complex-crema-30-grs-icono.html",
  ],
  otros: [
    "https://www.cosmetologasargentinas.com/maquillaje/ojos/serum-fortalecedor-de-pestaas-xxlash-pro-15-ml-idraet.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/hydrating-lipstick-con-hialuronico-3-gr.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/exel/balsamo-reparador-de-labios-con-cbd-9-ml-exel.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/idraet/lash-brow-filler-fortalecedor-de-cejas-y-pestanas-25-ml.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/dherma-sun-fotoprotector-labial-fps-30-x-4g.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/carthage/voluminizador-labial-x-15cc-carthage.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/prodermic/prodermic-facial/pdm-mascaras/pro-hialu-collagen-11-gr-prodermic.html",
    "https://www.cosmetologasargentinas.com/nuestras-marcas/icono/icono-megalip-scrub-tutti-frutti-nuevo-8-grs.html",
  ],
};

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
  const cleaned = text.replace(/[^\d.,]/g, "").trim();
  if (!cleaned) return null;
  const normalized = cleaned.replace(/\./g, "").replace(/,/g, ".");
  const value = parseFloat(normalized);
  return Number.isFinite(value) ? Math.round(value) : null;
}

function markup(price) {
  if (price === null || price === undefined) return null;
  return Math.round(price * MARKUP);
}

function slugify(url) {
  const last = url.split("/").filter(Boolean).pop() || "";
  return last.replace(/\.html?$/i, "");
}

async function scrapeOne(page, url, category) {
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  } catch (error) {
    console.warn(`SKIP (Timeout o error de carga): ${url}`);
    return null;
  }

  await page.waitForSelector("h1", { timeout: 15000 }).catch(() => {});

  const name = await page.locator("h1").first().textContent().catch(() => null);
  const priceText = await page
    .locator(".current-price, .product-price, [itemprop='price'], .price")
    .first()
    .textContent()
    .catch(() => null);
  const regularText = await page
    .locator(".regular-price")
    .first()
    .textContent()
    .catch(() => null);
  const image = await page
    .locator("#product-images img, .product-cover img, img[itemprop='image']")
    .first()
    .getAttribute("src")
    .catch(() => null);

  if (!name || !image) {
    console.warn(`SKIP (missing name/image): ${url}`);
    return null;
  }

  const cleanName = name.replace(/\s+/g, " ").trim();
  const currentPrice = parseArsPrice(priceText);
  const regularPrice = parseArsPrice(regularText);
  const price = markup(currentPrice);
  if (price === null) {
    console.warn(`SKIP (no price): ${url}`);
    return null;
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
  const loggedIn = await page.locator('a[href*="cerrar-sesion"], a[href*="logout"], a[href*="mi-cuenta"]').count();
  if (!loggedIn) {
    await browser.close();
    console.error("Login failed — aborting without touching products.ts.");
    process.exit(1);
  }

  const products = [];
  const seenIds = new Set();
  for (const category of Object.keys(URLS)) {
    for (const url of URLS[category]) {
      const p = await scrapeOne(page, url, category);
      if (!p) continue;
      if (seenIds.has(p.id)) continue;
      seenIds.add(p.id);
      products.push(p);
    }
    console.log(`${category}: ${products.filter((p) => p.category === category).length} products`);
  }

  await browser.close();

  if (products.length < MIN_EXPECTED_PRODUCTS) {
    console.error(
      `Only got ${products.length} products (expected ~${Object.values(URLS).flat().length}). Aborting without touching products.ts.`
    );
    process.exit(1);
  }

  const categoryList = CATEGORIES.filter((c) => products.some((p) => p.category === c.slug));

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
  for (const p of products) {
    lines.push(
      `  { id: ${ts(p.id)}, name: ${ts(p.name)}, brand: ${ts(p.brand)}, category: ${ts(p.category)}, price: ${p.price}, compareAtPrice: ${
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
  console.log(`Wrote ${products.length} products across ${categoryList.length} categories to ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});