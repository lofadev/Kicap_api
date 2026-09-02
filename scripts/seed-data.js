// Seed catalogue derived from a snapshot of https://kicap.vn/collections/all.
//
// scripts/kicap-catalog.json holds the raw download — refresh it with
// `npm run fetch:kicap`. Everything exported here is derived from that snapshot
// deterministically (fixed-seed PRNG, no Date.now, no Math.random), so seeding
// the same snapshot twice produces identical data.
//
// Product images are the storefront's own bizweb.dktcdn.net URLs. Product.image
// is a plain String, so they sit alongside the Firebase download URLs that
// uploadImageToFirebase (src/utils/index.js) writes for admin-uploaded products.
import { readFileSync } from 'node:fs';
import unidecode from 'unidecode';

const catalog = JSON.parse(readFileSync(new URL('./kicap-catalog.json', import.meta.url), 'utf8'));

// Still used for user avatars and as a last-resort image; kicap.vn has neither.
export const placeholderImage = (text, size = '600x600') =>
  `https://placehold.co/${size}/1a1a1a/ffffff?text=${encodeURIComponent(unidecode(text))}`;

const ascii = (value) => unidecode(value ?? '').toLowerCase();

// Stable across machines and Node versions, unlike a hash seeded by insertion order.
const hashOf = (value) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (Math.imul(hash, 31) + value.charCodeAt(index)) | 0;
  return Math.abs(hash);
};

// mulberry32. Same seed, same sequence, every run.
const createRandom = (seed) => {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// --- Reference data. kicap.vn publishes none of this, so it stays hand-written. ---

export const suppliers = [
  {
    name: 'Kicap Distribution',
    contactName: 'Nguyễn Minh Khoa',
    phone: '0901234567',
    email: 'sales@kicap-dist.vn',
    address: '128 Nguyễn Văn Cừ, Phường Chợ Quán',
    province: 'TP. Hồ Chí Minh',
  },
  {
    name: 'Hà Nội Keyboard Supply',
    contactName: 'Trần Thu Hà',
    phone: '0912345678',
    email: 'contact@hnkeyboard.vn',
    address: '45 Thái Hà, Phường Láng',
    province: 'Hà Nội',
  },
  {
    name: 'Đà Nẵng Gear Import',
    contactName: 'Lê Quốc Bảo',
    phone: '0923456789',
    email: 'import@dngear.vn',
    address: '210 Nguyễn Văn Linh, Phường Hải Châu',
    province: 'Đà Nẵng',
  },
  {
    name: 'Switch House Việt Nam',
    contactName: 'Phạm Thanh Tùng',
    phone: '0934567890',
    email: 'hello@switchhouse.vn',
    address: '77 Lý Thường Kiệt, Phường Ngô Quyền',
    province: 'Hải Phòng',
  },
];

// Statuses 0-3 are the live order flow (DetailOrder.jsx, OrderService.updateOrder).
// 4 is seeded defensively so an operator cancelling an order cannot crash
// ShowOrder.jsx:72, which does .find(...).description with no null guard.
export const orderStatuses = [
  { status: 0, description: 'Chờ duyệt' },
  { status: 1, description: 'Đã duyệt' },
  { status: 2, description: 'Đang giao' },
  { status: 3, description: 'Hoàn thành' },
  { status: 4, description: 'Đã huỷ' },
];

export const shippers = [
  { name: 'Giao Hàng Nhanh', phone: '1900636677' },
  { name: 'Giao Hàng Tiết Kiệm', phone: '19006092' },
  { name: 'Viettel Post', phone: '19008095' },
];

// Vietnamese administrative units in force since the 1 July 2025 merger:
// 6 centrally-governed cities + 28 provinces.
const CITIES = ['Hà Nội', 'Hải Phòng', 'Huế', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Cần Thơ'];

const PROVINCE_NAMES = [
  'Hà Nội',
  'Hải Phòng',
  'Huế',
  'Đà Nẵng',
  'TP. Hồ Chí Minh',
  'Cần Thơ',
  'Lai Châu',
  'Điện Biên',
  'Sơn La',
  'Lạng Sơn',
  'Quảng Ninh',
  'Thanh Hóa',
  'Nghệ An',
  'Hà Tĩnh',
  'Cao Bằng',
  'Tuyên Quang',
  'Lào Cai',
  'Thái Nguyên',
  'Phú Thọ',
  'Bắc Ninh',
  'Hưng Yên',
  'Ninh Bình',
  'Quảng Trị',
  'Quảng Ngãi',
  'Gia Lai',
  'Khánh Hòa',
  'Lâm Đồng',
  'Đắk Lắk',
  'Đồng Nai',
  'Tây Ninh',
  'Vĩnh Long',
  'Đồng Tháp',
  'Cà Mau',
  'An Giang',
];

export const provinces = PROVINCE_NAMES.map((provinceName, index) => ({
  provinceId: String(index + 1).padStart(2, '0'),
  provinceName,
  provinceType: CITIES.includes(provinceName) ? 'Thành phố' : 'Tỉnh',
}));

// Plaintext here; seed.js hashes with bcrypt.hashSync(pw, 10), matching
// UserService.createUser. isVerify is forced true in seed.js so these accounts
// can log in without a configured mailer.
export const users = [
  {
    name: 'Quản trị viên Kicap',
    email: 'admin@kicap.local',
    phone: '0900000001',
    password: 'Admin@123',
    isAdmin: true,
    address: '12 Trần Hưng Đạo',
    province: 'Hà Nội',
  },
  {
    name: 'Nguyễn Hoàng Long',
    email: 'khach1@kicap.local',
    phone: '0900000002',
    password: 'Khach@123',
    isAdmin: false,
    address: '25 Lê Lợi, Phường Bến Nghé',
    province: 'TP. Hồ Chí Minh',
  },
  {
    name: 'Trần Khánh Linh',
    email: 'khach2@kicap.local',
    phone: '0900000003',
    password: 'Khach@123',
    isAdmin: false,
    address: '88 Nguyễn Chí Thanh, Phường Láng',
    province: 'Hà Nội',
  },
  {
    name: 'Phan Đức Duy',
    email: 'khach3@kicap.local',
    phone: '0900000004',
    password: 'Khach@123',
    isAdmin: false,
    address: '304 Hùng Vương',
    province: 'Đà Nẵng',
  },
  {
    name: 'Võ Thị Mai Anh',
    email: 'khach4@kicap.local',
    phone: '0900000005',
    password: 'Khach@123',
    isAdmin: false,
    address: '17 Nguyễn Trãi',
    province: 'Cần Thơ',
  },
];

// --- Catalogue, derived from the kicap.vn snapshot ---

// The first four names are hardcoded in client/src/pages/Home/Home.jsx:24-27.
const KEYBOARD = 'Bàn phím cơ';
const KEYCAP = 'Keycap bộ';
const SWITCH = 'Switch';
const ACCESSORY = 'Phụ kiện';
const WRISTREST = 'Kê tay';
const MOUSEPAD = 'Chuột & Pad';

const CATEGORY_DESCRIPTIONS = {
  [KEYBOARD]: 'Bàn phím cơ custom và pre-built, đủ layout từ 60% đến full-size.',
  [KEYCAP]: 'Bộ keycap PBT và ABS, nhiều profile: Cherry, OSA, MDA, XDA.',
  [SWITCH]: 'Switch linear, tactile và clicky, bán theo bộ.',
  [ACCESSORY]: 'Cáp xoắn, dụng cụ lube, foam tiêu âm, stabilizer.',
  [WRISTREST]: 'Kê tay gỗ tự nhiên và da PU, đủ kích thước bàn phím.',
  [MOUSEPAD]: 'Deskmat khổ lớn, pad lót chuột và chuột chơi game.',
};

// How many products each category contributes. Sized to the snapshot: keycaps
// and keyboards dominate the real storefront, wrist rests barely exist.
const CATEGORY_QUOTAS = [
  [KEYBOARD, 20],
  [KEYCAP, 22],
  [SWITCH, 16],
  [ACCESSORY, 12],
  [WRISTREST, 3],
  [MOUSEPAD, 8],
];

// Bizweb's product_type is set on 323 of the 437 products and is authoritative
// where present; the rest are classified by name.
const TYPE_MAP = {
  'ban phim co': KEYBOARD,
  kit: KEYBOARD,
  combo: KEYBOARD,
  '75%': KEYBOARD,
  '98%': KEYBOARD,
  fullsize: KEYBOARD,
  'keycap bo': KEYCAP,
  switch: SWITCH,
  'phu kien': ACCESSORY,
  'phu kien ban phim': ACCESSORY,
  'custom cable': ACCESSORY,
  mods: ACCESSORY,
  den: ACCESSORY,
  'chuot may tinh': MOUSEPAD,
};

// The storefront files wrist rests and deskmats under generic types, so these
// three run before TYPE_MAP; the rest run after it as the fallback for
// product_type: null.
const SPECIFIC_NAME_RULES = [
  [/ke tay|wrist rest/, WRISTREST],
  [/deskmat|desk mat|lot chuot|pad chuot|mousepad|mouse pad/, MOUSEPAD],
  [/\bchuot\b/, MOUSEPAD],
];

const FALLBACK_NAME_RULES = [
  [/keycap/, KEYCAP],
  [/\b(switch|swich|switxh|swtich|swicth)\b/, SWITCH],
  [/ban phim|keyboard|\bkit\b/, KEYBOARD],
  [/\bcap\b|cable|tui dung|hop dung|foam|lube|stab|\bmod\b|tape|choi ve sinh/, ACCESSORY],
];

// Artisan / single keycaps are a real storefront type but not a seeded category.
const EXCLUDED = /keycap le|artisan/;

const categoryOf = (product) => {
  const name = ascii(product.name);
  if (EXCLUDED.test(name) || ascii(product.productType) === 'keycap le') return null;

  for (const [pattern, category] of SPECIFIC_NAME_RULES) if (pattern.test(name)) return category;

  const byType = TYPE_MAP[ascii(product.productType)];
  if (byType) return byType;

  for (const [pattern, category] of FALLBACK_NAME_RULES) if (pattern.test(name)) return category;
  return null;
};

// 63 products have no vendor. Matching the name against the vendors that do
// appear beats guessing at a word, and Kicap is the shop's own house brand.
const HOUSE_BRAND = 'Kicap';
const KNOWN_BRANDS = [...new Set(catalog.products.map((p) => p.vendor).filter(Boolean))].sort(
  (a, b) => b.length - a.length,
);

const brandOf = (product) => {
  if (product.vendor) return product.vendor;
  const haystack = ` ${ascii(product.name)} `;
  return KNOWN_BRANDS.find((brand) => haystack.includes(` ${ascii(brand)} `)) ?? HOUSE_BRAND;
};

// ProductDetails.jsx:110 encodes a chosen variant as `${name}/${value}` and
// seed.js splits it on the first slash, so neither half may contain one.
// Bizweb joins multi-option titles with " / ", and one option is named
// "Alpha/Number".
const withoutSlash = (value) => value.replace(/\s*\/\s*/g, ' · ');

// Bizweb names the option "Title" with a single "Default Title" value when a
// product has no real variants.
const attributeNameOf = (product) => {
  const name = (product.options[0] ?? '').trim();
  return name && ascii(name) !== 'title' ? withoutSlash(name) : '';
};

// compare_at_price is the struck-through original; price is what the customer
// pays. ProductModel stores the original in `price` and seed.js derives
// salePrice from the percentage, so the percentage is what gets stored.
const MAX_DISCOUNT = 70;

const pricingOf = (product) => {
  const paid = Math.round(product.price);
  const listed = Math.round(product.compareAtPrice);
  if (listed <= paid || paid <= 0) return { price: paid, discount: 0 };
  return { price: listed, discount: Math.min(MAX_DISCOUNT, Math.round(((listed - paid) / listed) * 100)) };
};

// Only 109 of 437 products are in stock on the live site. A dev database of
// mostly sold-out products is useless, so anything at zero gets a deterministic
// 5-30 instead. This is the one product field that is not the real value.
const fallbackStock = (key) => 5 + (hashOf(key) % 26);

const stockOf = (product) => {
  const fromVariants = product.variants.reduce((total, variant) => total + Math.max(variant.stock ?? 0, 0), 0);
  return fromVariants > 0 ? fromVariants : fallbackStock(product.name);
};

// Prefer products that are in stock, carry a full set of images and have real
// variants — they exercise more of the app. Name breaks ties so the selection
// never depends on the snapshot's ordering.
const rankOf = (product) =>
  (product.available ? 4 : 0) + (product.images.length >= 3 ? 2 : 0) + (product.variants.length > 1 ? 1 : 0);

const selectSources = () => {
  const pools = new Map(CATEGORY_QUOTAS.map(([category]) => [category, []]));

  for (const product of catalog.products) {
    // ProductModel requires an image and Bizweb has one product without any.
    if (product.images.length === 0) continue;
    const category = categoryOf(product);
    if (category) pools.get(category).push(product);
  }

  return CATEGORY_QUOTAS.flatMap(([category, quota]) =>
    pools
      .get(category)
      .sort((a, b) => rankOf(b) - rankOf(a) || ascii(a.name).localeCompare(ascii(b.name)))
      .slice(0, quota)
      .map((source) => ({ source, category })),
  );
};

const selected = selectSources();

// The storefront spells the same option both "Phân loại" and "Phân Loại".
// Attribute.name is unique, so one spelling wins and every variant must use it.
const canonicalAttributeNames = new Map();
for (const { source } of selected) {
  const name = attributeNameOf(source);
  if (name && !canonicalAttributeNames.has(ascii(name))) canonicalAttributeNames.set(ascii(name), name);
}

const attributeOf = (product) => canonicalAttributeNames.get(ascii(attributeNameOf(product))) ?? '';

const skuOf = (product) => product.variants[0]?.sku?.trim() || `KIC-${product.id}`;

export const products = selected.map(({ source, category }) => {
  const { price, discount } = pricingOf(source);
  const brand = brandOf(source);
  return {
    name: source.name,
    sku: skuOf(source),
    brand,
    category,
    supplier: suppliers[hashOf(brand) % suppliers.length].name,
    price,
    discount,
    stock: stockOf(source),
    hasVariant: Boolean(attributeNameOf(source)) && source.variants.length > 1,
    description: source.description || `${source.name} — hàng phân phối chính hãng tại Kicap.`,
    // Real storefront URLs. seed.js takes [0] as image, [1] as more_image and
    // seeds one ProductImage row per entry.
    images: source.images,
  };
});

const productByName = new Map(products.map((product) => [product.name, product]));

// priceDelta is added to the parent product's price in seed.js, which then
// re-applies the parent discount. Bizweb gives the variant's paid price, so it
// is converted back to a struck-through price first, rounded to the nearest
// thousand the way roundedPrice does for salePrice.
const listedFrom = (paid, discount) =>
  discount > 0 ? Math.round(paid / (1 - discount / 100) / 1000) * 1000 : paid;

export const variants = selected.flatMap(({ source }) => {
  const parent = productByName.get(source.name);
  if (!parent.hasVariant) return [];

  const name = attributeOf(source);
  const seen = new Set();

  return source.variants.flatMap((variant, index) => {
    const raw = (source.options.length > 1 ? variant.title : variant.option1) || variant.title || '';
    const value = withoutSlash(raw.trim()) || `Phiên bản ${index + 1}`;
    if (seen.has(value)) return [];
    seen.add(value);

    return [
      {
        product: parent.name,
        name,
        value,
        sku: variant.sku?.trim() || `${parent.sku}-V${index + 1}`,
        priceDelta: listedFrom(Math.round(variant.price), parent.discount) - parent.price,
        stock: Math.max(variant.stock ?? 0, 0) || fallbackStock(`${parent.name}#${index}`),
      },
    ];
  });
});

// Only the option names the selected products actually use, so the admin
// variant form offers nothing that leads nowhere.
export const attributes = [...new Set(variants.map((variant) => variant.name))]
  .sort((a, b) => ascii(a).localeCompare(ascii(b)))
  .map((name, index) => ({ name, displayOrder: index + 1 }));

const leadImageOf = (category) => products.find((product) => product.category === category).images[0];

export const categories = CATEGORY_QUOTAS.map(([categoryName]) => ({
  categoryName,
  description: CATEGORY_DESCRIPTIONS[categoryName],
  image: leadImageOf(categoryName),
}));

// toProduct is set to '/products' in seed.js. It must NOT point at a product
// detail URL: HeroSlider.jsx:41 renders a plain <Link>, and
// ProductDetails.jsx:27 reads location.state.id unguarded, so arriving without
// router state throws a TypeError.
export const sliders = [
  [KEYBOARD, 'Bàn phím cơ custom — dựng sẵn, gõ là mê'],
  [KEYCAP, 'Bộ keycap mới về — PBT dye-sub nhiều profile'],
  [SWITCH, 'Switch lube sẵn — mượt ngay khi lắp'],
  [ACCESSORY, 'Phụ kiện build phím — đủ đồ cho lần đầu'],
].map(([category, description], displayOrder) => ({
  image: leadImageOf(category),
  description,
  displayOrder,
}));

// --- Orders and reviews. Generated, because kicap.vn publishes neither. ---

// variant format is `${attributeName}/${value}`, matching
// client/src/pages/ProductDetails/ProductDetails.jsx:110. Empty means no variant.
const ORDER_NOTES = [
  '',
  'Giao giờ hành chính',
  '',
  'Gọi trước khi giao',
  '',
  'Để hàng ở lễ tân',
  'Giao cuối tuần',
  '',
];

// Statuses 0-3 with ages that match: pending orders are days old, completed
// ones months old, so the admin dashboard has a plausible history to chart.
const ORDER_PLAN = [
  { status: 0, count: 4, minDaysAgo: 1, maxDaysAgo: 6 },
  { status: 1, count: 4, minDaysAgo: 8, maxDaysAgo: 18 },
  { status: 2, count: 4, minDaysAgo: 20, maxDaysAgo: 34 },
  { status: 3, count: 6, minDaysAgo: 38, maxDaysAgo: 120 },
];

const INNER_CITY_SHIPPING = 30000;
const OUTER_CITY_SHIPPING = 35000;
const INNER_CITIES = ['Hà Nội', 'TP. Hồ Chí Minh'];

const variantsByProduct = variants.reduce((map, variant) => {
  if (!map.has(variant.product)) map.set(variant.product, []);
  map.get(variant.product).push(variant);
  return map;
}, new Map());

const buildOrders = () => {
  const random = createRandom(20260901);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const customers = users.filter((user) => !user.isAdmin);
  const result = [];
  let index = 0;

  for (const plan of ORDER_PLAN) {
    for (let n = 0; n < plan.count; n += 1) {
      const customer = customers[index % customers.length];
      const itemCount = random() < 0.4 ? 2 : 1;
      const chosen = new Set();
      const items = [];

      while (items.length < itemCount) {
        const product = pick(products);
        if (chosen.has(product.name)) continue;
        chosen.add(product.name);

        const variant = product.hasVariant ? pick(variantsByProduct.get(product.name)) : null;
        items.push({
          product: product.name,
          quantity: random() < 0.75 ? 1 : 2,
          variant: variant ? `${variant.name}/${variant.value}` : '',
        });
      }

      result.push({
        customer: customer.email,
        daysAgo: plan.minDaysAgo + Math.floor(random() * (plan.maxDaysAgo - plan.minDaysAgo + 1)),
        status: plan.status,
        paymentMethod: index % 2 === 0 ? 'COD' : 'VNPAY',
        shippingPrice: INNER_CITIES.includes(customer.province) ? INNER_CITY_SHIPPING : OUTER_CITY_SHIPPING,
        note: ORDER_NOTES[index % ORDER_NOTES.length],
        items,
      });
      index += 1;
    }
  }

  return result;
};

export const orders = buildOrders();

// Comment.user is a plain display-name string, not a reference (CommentModel.js).
const REVIEWERS = [
  'Hoàng Long',
  'Minh Tuấn',
  'Thu Trang',
  'Quốc Bảo',
  'Đức Duy',
  'Khánh Linh',
  'Anh Khoa',
  'Mai Anh',
  'Trọng Nghĩa',
  'Hải Yến',
  'Thanh Tùng',
  'Ngọc Ánh',
  'Quang Huy',
  'Bảo Ngọc',
  'Trung Kiên',
  'Phương Thảo',
];

// Per-category so a review never praises a feature the product cannot have.
const REVIEW_POOL = {
  [KEYBOARD]: [
    'Gõ êm, có foam sẵn nên không bị vọng. Đáng tiền ở tầm giá này.',
    'Hoàn thiện chắc tay, đặt bàn không xê dịch. Đóng gói cẩn thận.',
    'Pin trâu, dùng cả tuần mới phải sạc lại. Kết nối ổn định.',
    'Hotswap dễ thao tác, đổi switch không cần hàn.',
    'Đèn hơi chói vào ban đêm, phải giảm độ sáng xuống.',
    'Mua làm phím đầu tiên, không phải mod thêm gì cả.',
    'Stab hơi rung ở phím Space, mình phải tự chỉnh lại.',
    'Âm gõ trầm và đầm, đúng như mô tả trên shop.',
  ],
  [KEYCAP]: [
    'Màu lên đúng ảnh, đủ phím cho layout 65% của mình.',
    'In dye-sub sắc nét, thành keycap dày chắc chắn.',
    'Đủ phím phụ cho cả layout lẻ, không thiếu phím nào.',
    'Profile hơi cao so với Cherry, quen tay mất vài ngày.',
    'Phối màu dịu mắt, hợp bàn làm việc văn phòng.',
    'Giá mềm mà chất lượng in rất tốt, khó chê.',
    'Bản màu sáng hơi dễ bám bẩn, phải lau thường xuyên.',
    'Lắp vừa khít, không con nào bị rơ hay lỏng stem.',
  ],
  [SWITCH]: [
    'Lube sẵn từ nhà máy, lắp vào là mượt luôn, khỏi tự lube.',
    'Âm trầm và đầm, đúng như mô tả. Rất đáng tiền.',
    'Bump rõ ở đầu hành trình, gõ văn bản rất thích.',
    'Vài con hơi lệch nhưng đa số đều tay, chấp nhận được.',
    'Nhẹ tay, gõ lâu không mỏi. Hợp làm việc cả ngày.',
    'Tiếng click to thật, không hợp dùng ở văn phòng chung.',
    'Lò xo dài nên nhấn đều, không bị hẫng cuối hành trình.',
    'Giá tốt nhất trong nhóm mình từng thử qua.',
  ],
  [ACCESSORY]: [
    'Đủ đồ cho lần build đầu, không phải mua lẻ thêm gì.',
    'Hàng chắc chắn, hoàn thiện gọn gàng, giao nhanh.',
    'Dùng đúng nhu cầu, giá hợp lý so với mặt bằng chung.',
    'Lắp vào là thấy khác ngay, giảm tiếng vọng rõ rệt.',
    'Đẹp nhưng hơi ngắn nếu bàn sâu, cân nhắc trước khi mua.',
    'Shop tư vấn kỹ, hàng đúng mô tả.',
  ],
  [WRISTREST]: [
    'Vân gỗ đẹp, phủ mịn tay, đế cao su bám bàn tốt.',
    'Kê tay êm, gõ lâu đỡ mỏi cổ tay hẳn.',
    'Kích thước vừa với bàn phím, cạnh bo tròn không cấn tay.',
    'Hoàn thiện ổn so với giá, đóng gói kỹ.',
  ],
  [MOUSEPAD]: [
    'Khổ lớn đủ để cả bàn phím và chuột, viền may chắc.',
    'Mặt vải mịn, di chuột nhẹ và đều tay.',
    'Đế cao su bám tốt, dùng vài tháng chưa thấy bong mép.',
    'Màu in đúng ảnh, không bị lệch tông.',
  ],
};

const buildComments = () => {
  const random = createRandom(19112026);
  const result = [];

  products.forEach((product, index) => {
    // Roughly a third of the catalogue stays unreviewed, like a real storefront.
    if (random() < 0.3) return;

    const pool = REVIEW_POOL[product.category];
    const count = random() < 0.45 ? 2 : 1;

    for (let n = 0; n < count; n += 1) {
      result.push({
        product: product.name,
        user: REVIEWERS[(index * 3 + n * 7) % REVIEWERS.length],
        rating: random() < 0.62 ? 5 : random() < 0.75 ? 4 : 3,
        content: pool[(index * 2 + n * 5) % pool.length],
      });
    }
  });

  return result;
};

export const comments = buildComments();
