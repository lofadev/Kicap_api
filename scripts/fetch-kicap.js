// Downloads the kicap.vn catalogue into scripts/kicap-catalog.json so `npm run
// seed` stays offline and reproducible. Re-run with `npm run fetch:kicap` when
// the snapshot needs refreshing.
//
// kicap.vn runs on Bizweb, which exposes the storefront catalogue as JSON.
// This script only downloads and trims; every decision about what to seed
// (category mapping, product selection, pricing) lives in seed-data.js.
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SOURCE = 'https://kicap.vn/collections/all/products.json';
const OUTPUT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'kicap-catalog.json');

const PAGE_SIZE = 250;
const MAX_PAGES = 10;
// ProductImage seeds three rows per product; more would be dead weight.
const MAX_IMAGES = 3;
const MAX_DESCRIPTION = 280;

// Bizweb keeps the entire marketing page in `content`: markup, inline <style>
// blocks and HTML comments. Only the prose survives.
export const htmlToText = (html = '') =>
  (html ?? '')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

// Cuts at the last full sentence so a description never ends mid-clause.
export const summarise = (html) => {
  const text = htmlToText(html);
  if (text.length <= MAX_DESCRIPTION) return text;

  const clipped = text.slice(0, MAX_DESCRIPTION);
  const sentenceEnd = Math.max(clipped.lastIndexOf('. '), clipped.lastIndexOf('! '), clipped.lastIndexOf('? '));
  if (sentenceEnd > MAX_DESCRIPTION / 2) return clipped.slice(0, sentenceEnd + 1);

  const wordEnd = clipped.lastIndexOf(' ');
  return `${wordEnd > 0 ? clipped.slice(0, wordEnd) : clipped}…`;
};

export const slim = (product) => ({
  id: product.id,
  name: (product.name ?? '').trim(),
  alias: product.alias,
  vendor: product.vendor,
  productType: product.product_type,
  tags: product.tags ?? [],
  price: product.price_min,
  // 0 means "no strike-through price", i.e. the product is not discounted.
  compareAtPrice: product.compare_at_price_max || 0,
  available: Boolean(product.available),
  description: summarise(product.content),
  images: (product.images ?? []).slice(0, MAX_IMAGES),
  options: (product.options ?? []).map((option) => option.name),
  variants: (product.variants ?? []).map((variant) => ({
    sku: variant.sku,
    // For multi-option products this joins every option, e.g. "Đen / 68 phím".
    title: variant.title,
    option1: variant.option1,
    price: variant.price,
    stock: variant.inventory_quantity,
  })),
});

const fetchPage = async (page) => {
  const response = await fetch(`${SOURCE}?limit=${PAGE_SIZE}&page=${page}`);
  if (!response.ok) throw new Error(`${SOURCE} (trang ${page}) trả về HTTP ${response.status}`);
  const body = await response.json();
  return body.products ?? [];
};

const run = async () => {
  const products = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const batch = await fetchPage(page);
    console.log(`Trang ${page}: ${batch.length} sản phẩm`);
    products.push(...batch.map(slim));
    if (batch.length < PAGE_SIZE) break;
  }

  const payload = { source: SOURCE, fetchedAt: new Date().toISOString(), products };
  await writeFile(OUTPUT, `${JSON.stringify(payload, null, 2)}\n`);
  console.log(`\nĐã ghi ${products.length} sản phẩm vào ${path.relative(process.cwd(), OUTPUT)}`);
};

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  run().catch((error) => {
    console.error('\nTải catalogue thất bại:', error);
    process.exit(1);
  });
}
