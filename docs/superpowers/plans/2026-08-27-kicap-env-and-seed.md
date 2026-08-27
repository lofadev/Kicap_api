# Kicap Environment Setup and Database Seeding — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Kicap project runnable from a fresh clone and populate all 14 MongoDB collections with coherent Vietnamese sample data for a mechanical keyboard shop.

**Architecture:** Four environment files (real `.env` plus committed `.env.example` for both `client/` and `server/`), then a two-file seed script under `server/scripts/` that connects with mongoose, imports the existing models, wipes exactly the app's 14 collections behind a confirmation prompt, and inserts data in dependency order. Data invariants that the client silently depends on are locked down by unit tests running on Node's built-in test runner — no new dependency.

**Tech Stack:** Node v22.22.3, ESM (`"type": "module"`), mongoose 7, bcrypt 6, `node:test` + `node:assert/strict`, local `mongod` on `127.0.0.1:27017`, Vite 5 + React 18 on the client.

**Spec:** `server/docs/superpowers/specs/2026-08-27-kicap-env-and-seed-design.md`

## Global Constraints

- **Do not run any `git commit`.** The user has explicitly declined commits. Each task ends with a ready-to-run commit command; execute it only after the user gives an explicit go-ahead.
- **No AI or model attribution in commit messages** — no `Co-Authored-By`, no "Generated with", no model names. (`~/.claude/CLAUDE.md`)
- Two separate git repos: `client/` and `server/`. Both on `master`, both clean. There is no repo at the workspace root.
- Both repos gitignore `.env`. Only the `.env.example` files are committable.
- These four category names must appear verbatim in `Category.categoryName` and in `Product.category`: `Bàn phím cơ`, `Keycap bộ`, `Switch`, `Phụ kiện`. (`client/src/pages/Home/Home.jsx:24-27`)
- Every `Order.status` value used must have a matching document in `OrderStatus`, or the admin orders page throws. (`client/src/pages/admin/Order/ShowOrder/ShowOrder.jsx:72`)
- `Slider.toProduct` must be `/products`, never a product URL. (`client/src/pages/ProductDetails/ProductDetails.jsx:27` reads `location.state.id` unguarded.)
- `salePrice` is the price actually charged; `price` is the struck-through original. (`client/src/components/ProductCard/ProductCard.jsx:76-79`)
- Do not modify any file under `client/src/` or `server/src/`. The only `server/src` interaction is _importing_ from `server/src/models/` and `server/src/utils/index.js`.
- Vietnamese user-facing strings keep their diacritics. Placeholder image labels are transliterated to ASCII via `unidecode` (already a server dependency).

---

## File Structure

| File                               | Responsibility                                                                                                                    |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `server/.env`                      | Real local secrets and connection strings. Not committed.                                                                         |
| `server/.env.example`              | Same keys, placeholder values, inline comments. Committed.                                                                        |
| `client/.env`                      | `VITE_REACT_APP_API_KEY` only. Not committed.                                                                                     |
| `client/.env.example`              | Same, placeholder. Committed.                                                                                                     |
| `server/scripts/seed-data.js`      | Static sample data plus one tiny image-URL helper. No DB access, no mongoose import — importable by tests with zero side effects. |
| `server/scripts/seed.js`           | Orchestration only: connect, report, confirm, wipe, insert in order, recompute ratings, print summary.                            |
| `server/scripts/seed-data.test.js` | Invariants over `seed-data.js` that the client depends on. Pure, no DB.                                                           |
| `server/package.json`              | Add `seed` and `test` scripts.                                                                                                    |

`seed-data.js` holds no logic beyond `placeholderImage` so that `seed-data.test.js` can import it without a database, and so `seed.js` stays short enough to read in one screen.

---

## Task 1: Environment files and a booting stack

**Files:**

- Create: `server/.env`, `server/.env.example`, `client/.env`, `client/.env.example`

**Interfaces:**

- Consumes: nothing.
- Produces: `process.env.MONGODB_URL` (`mongodb://127.0.0.1:27017/kicap`), consumed by Task 2's `seed.js`. `PORT=3000`. Client base URL `http://localhost:3000/api`.

- [ ] **Step 1: Generate the two JWT secrets**

```bash
cd /home/antpt/workspaces/kicap/server
node -e "const c=require('node:crypto');console.log('ACCESS_TOKEN='+c.randomBytes(32).toString('hex'));console.log('REFRESH_TOKEN='+c.randomBytes(32).toString('hex'))"
```

Expected: two distinct 64-character hex lines. Copy them into Step 2.

- [ ] **Step 2: Write `server/.env`**

Paste the two generated values in place of `<...>`.

```bash
PORT=3000
MONGODB_URL=mongodb://127.0.0.1:27017/kicap
ACCESS_TOKEN=<hex from step 1>
REFRESH_TOKEN=<the other hex from step 1>
APP_URL=http://localhost:5173

# --- Optional. Empty is fine: the server boots, only the named feature breaks. ---

# Registration email verification + password reset (src/utils/index.js:149).
# Gmail requires an App Password, not the account password.
MAILER_EMAIL=
MAILER_PASS=

# Image upload on the admin pages (ProductRouter, ProductImageRouter, SliderRouter).
# Seed data uses placeholder URLs, so seeding does not need these.
FIREBASE_APIKEY=
FIREBASE_AUTHDOMAIN=
FIREBASE_DATABASEURL=
FIREBASE_PROJECTID=
FIREBASE_STORAGEBUCKET=
FIREBASE_MESSAGINGSENDERID=
FIREBASE_APPID=
FIREBASE_MEASUREMENTID=

# VNPay online checkout (src/controllers/CheckoutController.js).
# TMNCODE and HASHSECRET are merchant-specific; register at sandbox.vnpayment.vn.
VNP_TMNCODE=
VNP_HASHSECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURNURL=http://localhost:5173/vnpay_result
```

- [ ] **Step 3: Write `server/.env.example`**

Identical to Step 2 but with every secret replaced by a placeholder, so it is safe to commit:

```bash
PORT=3000
MONGODB_URL=mongodb://127.0.0.1:27017/kicap

# Generate each with: node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
ACCESS_TOKEN=replace-with-64-char-hex
REFRESH_TOKEN=replace-with-a-different-64-char-hex

# Frontend origin, used to build email verification and password reset links.
APP_URL=http://localhost:5173

# --- Optional. Empty is fine: the server boots, only the named feature breaks. ---

# Registration email verification + password reset. Gmail needs an App Password.
MAILER_EMAIL=
MAILER_PASS=

# Image upload on the admin pages.
FIREBASE_APIKEY=
FIREBASE_AUTHDOMAIN=
FIREBASE_DATABASEURL=
FIREBASE_PROJECTID=
FIREBASE_STORAGEBUCKET=
FIREBASE_MESSAGINGSENDERID=
FIREBASE_APPID=
FIREBASE_MEASUREMENTID=

# VNPay online checkout. Register a sandbox merchant to get the first two.
VNP_TMNCODE=
VNP_HASHSECRET=
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURNURL=http://localhost:5173/vnpay_result
```

- [ ] **Step 4: Write `client/.env` and `client/.env.example`**

Both files, identical content. The `/api` suffix is mandatory — `client/src/api/apiConfig.js` uses this as the axios `baseURL` while services call paths like `/category/get-all`, and `server/src/routes/index.js` mounts everything under `/api/*`.

```bash
# Base URL of the Kicap API. The /api suffix is required.
VITE_REACT_APP_API_KEY=http://localhost:3000/api
```

- [ ] **Step 5: Install dependencies (neither repo has `node_modules` yet)**

```bash
cd /home/antpt/workspaces/kicap/server && npm install
cd /home/antpt/workspaces/kicap/client && yarn
```

Expected: both complete without an `ERESOLVE` or peer-dependency failure.

- [ ] **Step 6: Verify mongod is reachable**

```bash
mongosh --quiet --eval 'db.runCommand({ ping: 1 })'
```

Expected: `{ ok: 1 }`. If this fails, start MongoDB before continuing — every later task needs it.

- [ ] **Step 7: Boot the server and verify it connects**

```bash
cd /home/antpt/workspaces/kicap/server && npm run dev
```

Expected on stdout: `Server running at http://localhost:3000` with no mongoose error. In a second terminal:

```bash
curl -s http://localhost:3000/
```

Expected: `{"name":"Hi LofA"}`

- [ ] **Step 8: Boot the client**

```bash
cd /home/antpt/workspaces/kicap/client && yarn dev
```

Expected: Vite prints a local URL on port 5173. Open it — the homepage renders its static chrome (header, footer, news section from `client/data.js`). Product sections are empty; that is correct, the database has no data yet.

- [ ] **Step 9: Commit — DO NOT RUN without explicit approval**

```bash
cd /home/antpt/workspaces/kicap/server && git add .env.example docs/ && git commit -m "chore: add env template and setup/seed design docs"
cd /home/antpt/workspaces/kicap/client && git add .env.example && git commit -m "chore: add env template"
```

---

## Task 2: Test harness, seed runner, and reference collections

Six collections with no outbound references: `Province`, `OrderStatus`, `Shipper`, `Attribute`, `Category`, `Supplier`. By the end of this task `npm run seed` works end to end — later tasks only add data.

**Files:**

- Create: `server/scripts/seed-data.js`, `server/scripts/seed-data.test.js`, `server/scripts/seed.js`
- Modify: `server/package.json` (scripts block)

**Interfaces:**

- Consumes: `MONGODB_URL` from Task 1.
- Produces, from `seed-data.js`:
  - `placeholderImage(text: string, size?: string): string`
  - `categories: Array<{ categoryName, description, image }>` — 6 items
  - `suppliers: Array<{ name, contactName, phone, email, address, province }>` — 4 items
  - `attributes: Array<{ name, displayOrder }>` — 3 items
  - `provinces: Array<{ provinceId, provinceName, provinceType }>` — 34 items
  - `orderStatuses: Array<{ status: number, description }>` — 5 items
  - `shippers: Array<{ name, phone }>` — 3 items
- Produces, from `seed.js`: `COLLECTIONS: Array<[label: string, model: mongoose.Model]>` in wipe/insert order, and a `run()` entry point. Tasks 3 and 4 extend both files.

- [ ] **Step 1: Add the `test` and `seed` scripts to `server/package.json`**

Replace the `scripts` block:

```json
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "seed": "node scripts/seed.js",
    "test": "node --test scripts/"
  },
```

`node --test` is built into Node 22 — no new dependency. It discovers `scripts/*.test.js`.

- [ ] **Step 2: Write the failing test — `server/scripts/seed-data.test.js`**

```js
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  attributes,
  categories,
  orderStatuses,
  placeholderImage,
  provinces,
  shippers,
  suppliers,
} from './seed-data.js';

const duplicates = (values) => values.filter((v, i) => values.indexOf(v) !== i);

describe('placeholderImage', () => {
  it('transliterates Vietnamese to ASCII and percent-encodes the label', () => {
    assert.equal(placeholderImage('Bàn phím cơ'), 'https://placehold.co/600x600/1a1a1a/ffffff?text=Ban%20phim%20co');
  });

  it('accepts a custom size', () => {
    assert.match(placeholderImage('Banner', '1200x400'), /placehold\.co\/1200x400\//);
  });
});

describe('categories', () => {
  // client/src/pages/Home/Home.jsx:24-27 requests these four names verbatim.
  // A mismatch leaves four homepage sections empty.
  it('contains the four names the homepage hardcodes', () => {
    const names = categories.map((c) => c.categoryName);
    for (const required of ['Bàn phím cơ', 'Keycap bộ', 'Switch', 'Phụ kiện']) {
      assert.ok(names.includes(required), `missing category: ${required}`);
    }
  });

  it('has unique categoryName values', () => {
    assert.deepEqual(duplicates(categories.map((c) => c.categoryName)), []);
  });

  it('gives every category an image', () => {
    for (const c of categories) assert.match(c.image, /^https:\/\/placehold\.co\//);
  });
});

describe('suppliers', () => {
  // SupplierModel declares phone and email unique; a duplicate aborts insertMany.
  it('has unique phone and email values', () => {
    assert.deepEqual(duplicates(suppliers.map((s) => s.phone)), []);
    assert.deepEqual(duplicates(suppliers.map((s) => s.email)), []);
  });

  it('fills every required field', () => {
    for (const s of suppliers) {
      for (const key of ['name', 'contactName', 'phone', 'email', 'address', 'province']) {
        assert.ok(s[key], `supplier ${s.name} is missing ${key}`);
      }
    }
  });
});

describe('attributes', () => {
  it('has unique names and unique displayOrder values', () => {
    assert.deepEqual(duplicates(attributes.map((a) => a.name)), []);
    assert.deepEqual(duplicates(attributes.map((a) => a.displayOrder)), []);
  });
});

describe('provinces', () => {
  it('has 34 entries with unique provinceId values', () => {
    assert.equal(provinces.length, 34);
    assert.deepEqual(duplicates(provinces.map((p) => p.provinceId)), []);
  });

  it('classifies each entry as Tỉnh or Thành phố', () => {
    for (const p of provinces) {
      assert.ok(['Tỉnh', 'Thành phố'].includes(p.provinceType), `bad type on ${p.provinceName}`);
    }
  });

  it('has exactly 6 centrally-governed cities', () => {
    assert.equal(provinces.filter((p) => p.provinceType === 'Thành phố').length, 6);
  });
});

describe('orderStatuses', () => {
  // client/.../ShowOrder.jsx:72 calls .find(...).description with no null guard.
  it('covers statuses 0 through 4 with unique values and a description', () => {
    assert.deepEqual(
      orderStatuses.map((s) => s.status).sort((a, b) => a - b),
      [0, 1, 2, 3, 4],
    );
    for (const s of orderStatuses) assert.ok(s.description.length > 0);
  });
});

describe('shippers', () => {
  it('has unique phone values', () => {
    assert.deepEqual(duplicates(shippers.map((s) => s.phone)), []);
  });
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `cd /home/antpt/workspaces/kicap/server && npm test`
Expected: FAIL — `Cannot find module '.../scripts/seed-data.js'`

- [ ] **Step 4: Write `server/scripts/seed-data.js`**

```js
// Sample data for local development. Written for this project; nothing here is
// copied from any live storefront. Brand names are used descriptively.
import unidecode from 'unidecode';

export const placeholderImage = (text, size = '600x600') =>
  `https://placehold.co/${size}/1a1a1a/ffffff?text=${encodeURIComponent(unidecode(text))}`;

// The first four names are hardcoded in client/src/pages/Home/Home.jsx:24-27.
export const categories = [
  {
    categoryName: 'Bàn phím cơ',
    description: 'Bàn phím cơ custom và pre-built, đủ layout từ 60% đến full-size.',
    image: placeholderImage('Ban phim co'),
  },
  {
    categoryName: 'Keycap bộ',
    description: 'Bộ keycap PBT và ABS, nhiều profile: Cherry, OSA, MDA, XDA.',
    image: placeholderImage('Keycap bo'),
  },
  {
    categoryName: 'Switch',
    description: 'Switch linear, tactile và clicky, bán theo bộ.',
    image: placeholderImage('Switch'),
  },
  {
    categoryName: 'Phụ kiện',
    description: 'Cáp xoắn, dụng cụ lube, foam tiêu âm, stabilizer.',
    image: placeholderImage('Phu kien'),
  },
  {
    categoryName: 'Kê tay',
    description: 'Kê tay gỗ tự nhiên và da PU, đủ kích thước bàn phím.',
    image: placeholderImage('Ke tay'),
  },
  {
    categoryName: 'Chuột & Pad',
    description: 'Deskmat khổ lớn và pad lót chuột.',
    image: placeholderImage('Chuot va Pad'),
  },
];

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

export const attributes = [
  { name: 'Loại switch', displayOrder: 1 },
  { name: 'Màu sắc', displayOrder: 2 },
  { name: 'Layout', displayOrder: 3 },
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
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `cd /home/antpt/workspaces/kicap/server && npm test`
Expected: PASS, all assertions green.

- [ ] **Step 6: Write `server/scripts/seed.js`**

```js
import 'dotenv/config';
import mongoose from 'mongoose';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

import Attribute from '../src/models/AttributeModel.js';
import Category from '../src/models/CategoryModel.js';
import Comment from '../src/models/CommentModel.js';
import Order from '../src/models/OrderModel.js';
import OrderDetail from '../src/models/OrderDetailModel.js';
import OrderStatus from '../src/models/OrderStatusModel.js';
import Product from '../src/models/ProductModel.js';
import ProductImage from '../src/models/ProductImageModel.js';
import Province from '../src/models/ProvinceModel.js';
import Shipper from '../src/models/ShipperModel.js';
import Slider from '../src/models/SliderModel.js';
import Supplier from '../src/models/SupplierModel.js';
import User from '../src/models/UserModel.js';
import Variant from '../src/models/VariantModel.js';

import * as data from './seed-data.js';

// Wipe and insert order. Independent collections first, then referents.
const COLLECTIONS = [
  ['Province', Province],
  ['OrderStatus', OrderStatus],
  ['Shipper', Shipper],
  ['Attribute', Attribute],
  ['Category', Category],
  ['Supplier', Supplier],
  ['User', User],
  ['Product', Product],
  ['Variant', Variant],
  ['ProductImage', ProductImage],
  ['Slider', Slider],
  ['Order', Order],
  ['OrderDetail', OrderDetail],
  ['Comment', Comment],
];

const confirmWipe = async () => {
  if (process.argv.includes('--yes')) return true;
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('\nXoá toàn bộ dữ liệu trên và seed lại? Gõ "y" để tiếp tục: ');
  rl.close();
  return answer.trim().toLowerCase() === 'y';
};

const printCounts = async (title) => {
  console.log(`\n${title}`);
  for (const [label, Model] of COLLECTIONS) {
    const count = await Model.countDocuments();
    console.log(`  ${label.padEnd(14)} ${String(count).padStart(4)}`);
  }
};

const seedReference = async () => {
  await Province.insertMany(data.provinces);
  await OrderStatus.insertMany(data.orderStatuses);
  await Shipper.insertMany(data.shippers);
  await Attribute.insertMany(data.attributes);
  await Category.insertMany(data.categories);
  await Supplier.insertMany(data.suppliers);
};

const run = async () => {
  const url = process.env.MONGODB_URL;
  if (!url) {
    console.error('Thiếu MONGODB_URL. Kiểm tra server/.env.');
    process.exit(1);
  }

  await mongoose.connect(url);
  const { host, port, name } = mongoose.connection;
  console.log(`\nMongoDB : ${host}:${port}`);
  console.log(`Database: ${name}`);
  await printCounts('Số document sẽ bị xoá:');

  if (!(await confirmWipe())) {
    console.log('Đã huỷ, không thay đổi gì.');
    await mongoose.disconnect();
    return;
  }

  // deleteMany on exactly these collections — never dropDatabase, so other
  // databases on the same mongod are untouched.
  for (const [, Model] of COLLECTIONS) await Model.deleteMany({});

  await seedReference();

  await printCounts('Đã seed xong:');
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error('\nSeed thất bại:', error);
  await mongoose.disconnect();
  process.exit(1);
});
```

- [ ] **Step 7: Run the seed and confirm the six collections fill**

```bash
cd /home/antpt/workspaces/kicap/server && npm run seed
```

Expected: the pre-wipe table shows all zeros, the prompt appears, typing `y` produces a post-seed table reading `Province 34`, `OrderStatus 5`, `Shipper 3`, `Attribute 3`, `Category 6`, `Supplier 4`, and `0` for the remaining eight.

- [ ] **Step 8: Verify the confirmation prompt actually aborts**

```bash
cd /home/antpt/workspaces/kicap/server && printf 'n\n' | npm run seed
mongosh --quiet kicap --eval 'db.categories.countDocuments()'
```

Expected: the script prints `Đã huỷ, không thay đổi gì.` and the count is still `6` — nothing was deleted.

- [ ] **Step 9: Verify `--yes` skips the prompt**

```bash
cd /home/antpt/workspaces/kicap/server && npm run seed -- --yes
```

Expected: no prompt, finishes with the same post-seed table.

- [ ] **Step 10: Verify the API serves the seeded reference data**

With `npm run dev` running:

```bash
curl -s http://localhost:3000/api/category/get-all | head -c 300
curl -s 'http://localhost:3000/api/province/get-all?search=' | head -c 300
```

Expected: `"status":"OK"` and Vietnamese category names with correct diacritics in both responses.

- [ ] **Step 11: Commit — DO NOT RUN without explicit approval**

```bash
cd /home/antpt/workspaces/kicap/server
git add package.json scripts/
git commit -m "feat(seed): add seed runner and reference collection data"
```

---

## Task 3: Catalog — products, variants, images, sliders

**Files:**

- Modify: `server/scripts/seed-data.js` (append), `server/scripts/seed-data.test.js` (append), `server/scripts/seed.js` (add `seedCatalog`)

**Interfaces:**

- Consumes: `categories`, `suppliers`, `attributes`, `placeholderImage` from Task 2.
- Produces, from `seed-data.js`:
  - `products: Array<{ name, sku, brand, category, supplier, description, price, discount, stock, hasVariant }>` — 40 items. `slug`, `salePrice`, `image`, `more_image` are derived in `seed.js`, not stored here.
  - `variants: Array<{ product: string, name: string, value: string, sku: string, priceDelta: number, stock: number }>` — 30 items. `product` matches a `products[].name`; `name` matches an `attributes[].name`.
  - `sliders: Array<{ label, description, displayOrder }>` — 4 items. `image` and `toProduct` are derived in `seed.js`.
- Produces, from `seed.js`: `seedCatalog(): Promise<Product[]>` returning the inserted product documents, used by Task 4.

- [ ] **Step 1: Append the failing tests to `server/scripts/seed-data.test.js`**

Extend the import at the top of the file to `import { attributes, categories, orderStatuses, placeholderImage, products, provinces, shippers, sliders, suppliers, variants } from './seed-data.js';` then append:

```js
describe('products', () => {
  it('has 40 entries with unique names and unique SKUs', () => {
    assert.equal(products.length, 40);
    // ProductModel declares name unique; SKU is not unique in the schema but
    // duplicates make the sample data misleading.
    assert.deepEqual(duplicates(products.map((p) => p.name)), []);
    assert.deepEqual(duplicates(products.map((p) => p.sku)), []);
  });

  it('references only seeded category names', () => {
    const names = categories.map((c) => c.categoryName);
    for (const p of products) {
      assert.ok(names.includes(p.category), `${p.name} has unknown category ${p.category}`);
    }
  });

  it('references only seeded supplier names', () => {
    const names = suppliers.map((s) => s.name);
    for (const p of products) {
      assert.ok(names.includes(p.supplier), `${p.name} has unknown supplier ${p.supplier}`);
    }
  });

  it('puts at least 4 products in each of the four homepage categories', () => {
    for (const required of ['Bàn phím cơ', 'Keycap bộ', 'Switch', 'Phụ kiện']) {
      const count = products.filter((p) => p.category === required).length;
      assert.ok(count >= 4, `${required} has only ${count} products`);
    }
  });

  it('keeps price, discount and stock in valid ranges', () => {
    for (const p of products) {
      assert.ok(p.price > 0, `${p.name} has non-positive price`);
      assert.ok(p.discount >= 0 && p.discount <= 50, `${p.name} has discount ${p.discount}`);
      assert.ok(p.stock > 0, `${p.name} has no stock`);
    }
  });
});

describe('variants', () => {
  it('has 30 entries with unique SKUs', () => {
    assert.equal(variants.length, 30);
    assert.deepEqual(duplicates(variants.map((v) => v.sku)), []);
  });

  it('attaches only to products flagged hasVariant', () => {
    const withVariants = new Set(products.filter((p) => p.hasVariant).map((p) => p.name));
    for (const v of variants) {
      assert.ok(withVariants.has(v.product), `variant ${v.sku} points at ${v.product}`);
    }
  });

  it('gives every hasVariant product at least two variants', () => {
    for (const p of products.filter((x) => x.hasVariant)) {
      const count = variants.filter((v) => v.product === p.name).length;
      assert.ok(count >= 2, `${p.name} has only ${count} variants`);
    }
  });

  it('uses only seeded attribute names', () => {
    const names = attributes.map((a) => a.name);
    for (const v of variants) {
      assert.ok(names.includes(v.name), `variant ${v.sku} uses unknown attribute ${v.name}`);
    }
  });

  it('never drives a variant price to zero or below', () => {
    const byName = new Map(products.map((p) => [p.name, p]));
    for (const v of variants) {
      assert.ok(byName.get(v.product).price + v.priceDelta > 0, `variant ${v.sku} priced <= 0`);
    }
  });
});

describe('sliders', () => {
  it('has 4 entries with unique displayOrder values', () => {
    assert.equal(sliders.length, 4);
    assert.deepEqual(duplicates(sliders.map((s) => s.displayOrder)), []);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd /home/antpt/workspaces/kicap/server && npm test`
Expected: FAIL — `SyntaxError: The requested module './seed-data.js' does not provide an export named 'products'`

- [ ] **Step 3: Append the product catalogue to `server/scripts/seed-data.js`**

Product names and descriptions below are written for this project. Brand names refer to real manufacturers descriptively. Prices are in VND.

```js
const KEYBOARD = 'Bàn phím cơ';
const KEYCAP = 'Keycap bộ';
const SWITCH = 'Switch';
const ACCESSORY = 'Phụ kiện';
const WRISTREST = 'Kê tay';
const MOUSEPAD = 'Chuột & Pad';

const KICAP_DIST = 'Kicap Distribution';
const HANOI_SUPPLY = 'Hà Nội Keyboard Supply';
const DANANG_IMPORT = 'Đà Nẵng Gear Import';
const SWITCH_HOUSE = 'Switch House Việt Nam';

export const products = [
  // --- Bàn phím cơ (12) ---
  {
    name: 'AKKO 3068B Plus World Tour Tokyo',
    sku: 'KB-AKK-001',
    brand: 'AKKO',
    category: KEYBOARD,
    supplier: KICAP_DIST,
    price: 1690000,
    discount: 10,
    stock: 24,
    hasVariant: true,
    description: 'Bàn phím 65% ba chế độ kết nối, vỏ nhựa ABS, hotswap 5 pin, foam tiêu âm sẵn trong máy.',
  },
  {
    name: 'AKKO MOD007B PC Hiệu Ứng Từ Trường',
    sku: 'KB-AKK-002',
    brand: 'AKKO',
    category: KEYBOARD,
    supplier: KICAP_DIST,
    price: 2890000,
    discount: 0,
    stock: 12,
    hasVariant: false,
    description: 'Layout 75% gasket mount, tấm PC, switch từ trường điều chỉnh được hành trình kích hoạt.',
  },
  {
    name: 'Keychron K8 Pro Vỏ Nhôm',
    sku: 'KB-KEY-003',
    brand: 'Keychron',
    category: KEYBOARD,
    supplier: HANOI_SUPPLY,
    price: 3290000,
    discount: 12,
    stock: 15,
    hasVariant: true,
    description: 'TKL vỏ nhôm nguyên khối, firmware QMK/VIA, pin 4000mAh, hotswap toàn bộ phím.',
  },
  {
    name: 'Keychron V6 Max Có Núm Xoay',
    sku: 'KB-KEY-004',
    brand: 'Keychron',
    category: KEYBOARD,
    supplier: HANOI_SUPPLY,
    price: 2790000,
    discount: 0,
    stock: 18,
    hasVariant: true,
    description: 'Full-size 96% gasket mount, núm xoay nhôm, hai lớp foam, kết nối 2.4GHz và Bluetooth.',
  },
  {
    name: 'Keychron Q1 Pro QMK Bản Nhôm',
    sku: 'KB-KEY-005',
    brand: 'Keychron',
    category: KEYBOARD,
    supplier: HANOI_SUPPLY,
    price: 4490000,
    discount: 8,
    stock: 8,
    hasVariant: false,
    description: 'Custom 75% dựng sẵn, vỏ nhôm CNC 6063, gasket mount, double gasket, PCB hotswap.',
  },
  {
    name: 'Leopold FC660M Bản Xám Than',
    sku: 'KB-LEO-006',
    brand: 'Leopold',
    category: KEYBOARD,
    supplier: DANANG_IMPORT,
    price: 2590000,
    discount: 0,
    stock: 10,
    hasVariant: false,
    description: 'Layout 65% huyền thoại, keycap PBT dye-sub, vỏ dày, gõ chắc tay, không hotswap.',
  },
  {
    name: 'Leopold FC900R Bluetooth',
    sku: 'KB-LEO-007',
    brand: 'Leopold',
    category: KEYBOARD,
    supplier: DANANG_IMPORT,
    price: 3190000,
    discount: 5,
    stock: 7,
    hasVariant: false,
    description: 'Full-size có dây và Bluetooth, keycap PBT, chất lượng hoàn thiện quen thuộc của Leopold.',
  },
  {
    name: 'FL Esports MK750 Ba Chế Độ',
    sku: 'KB-FLE-008',
    brand: 'FL Esports',
    category: KEYBOARD,
    supplier: KICAP_DIST,
    price: 1490000,
    discount: 15,
    stock: 30,
    hasVariant: true,
    description: 'TKL gasket mount tầm giá phổ thông, ba chế độ kết nối, sẵn foam và băng tape mod.',
  },
  {
    name: 'FL Esports CMK87 Gasket',
    sku: 'KB-FLE-009',
    brand: 'FL Esports',
    category: KEYBOARD,
    supplier: KICAP_DIST,
    price: 1190000,
    discount: 0,
    stock: 26,
    hasVariant: false,
    description: 'TKL vỏ nhựa gasket mount, hotswap 5 pin, LED South-facing, hợp để build lần đầu.',
  },
  {
    name: 'Royal Kludge RK84 Pro',
    sku: 'KB-RKG-010',
    brand: 'Royal Kludge',
    category: KEYBOARD,
    supplier: KICAP_DIST,
    price: 1290000,
    discount: 10,
    stock: 22,
    hasVariant: true,
    description: 'Layout 75% ba chế độ, hotswap, đèn RGB, có núm xoay chỉnh âm lượng.',
  },
  {
    name: 'Royal Kludge R65 Từ Trường',
    sku: 'KB-RKG-011',
    brand: 'Royal Kludge',
    category: KEYBOARD,
    supplier: KICAP_DIST,
    price: 990000,
    discount: 0,
    stock: 20,
    hasVariant: false,
    description: 'Bàn phím 65% switch từ trường, tần số quét 8000Hz, chỉnh actuation trong phần mềm.',
  },
  {
    name: 'Monsgeek M1W Bản Đặc Biệt',
    sku: 'KB-MON-012',
    brand: 'Monsgeek',
    category: KEYBOARD,
    supplier: DANANG_IMPORT,
    price: 2190000,
    discount: 7,
    stock: 11,
    hasVariant: true,
    description: 'Custom 75% vỏ nhôm không dây, gasket mount, tấm định vị FR4, hộp đựng đầy đủ.',
  },

  // --- Keycap bộ (8) ---
  {
    name: 'Keycap AKKO Black & Pink Profile ASA',
    sku: 'KC-AKK-013',
    brand: 'AKKO',
    category: KEYCAP,
    supplier: KICAP_DIST,
    price: 890000,
    discount: 0,
    stock: 40,
    hasVariant: false,
    description: 'Bộ 158 phím PBT dye-sub profile ASA, phối đen hồng, hợp layout từ 60% đến full-size.',
  },
  {
    name: 'Keycap AKKO Matcha Red Bean',
    sku: 'KC-AKK-014',
    brand: 'AKKO',
    category: KEYCAP,
    supplier: KICAP_DIST,
    price: 790000,
    discount: 10,
    stock: 35,
    hasVariant: false,
    description: 'Bộ 157 phím PBT profile Cherry, tông xanh matcha và đỏ đậu, in dye-sub bền màu.',
  },
  {
    name: 'Keycap AKKO Ocean Star Profile Cherry',
    sku: 'KC-AKK-015',
    brand: 'AKKO',
    category: KEYCAP,
    supplier: KICAP_DIST,
    price: 950000,
    discount: 0,
    stock: 28,
    hasVariant: false,
    description: 'Bộ 155 phím PBT dye-sub, tông xanh biển và trắng, có sẵn phím phụ cho layout lẻ.',
  },
  {
    name: 'Keycap Monsgeek Cherry Trắng Xám',
    sku: 'KC-MON-016',
    brand: 'Monsgeek',
    category: KEYCAP,
    supplier: DANANG_IMPORT,
    price: 690000,
    discount: 5,
    stock: 33,
    hasVariant: true,
    description: 'Bộ 140 phím PBT profile Cherry, phối trắng xám tối giản, độ dày thành 1.4mm.',
  },
  {
    name: 'Keycap Keychron OSA PBT Full Set',
    sku: 'KC-KEY-017',
    brand: 'Keychron',
    category: KEYCAP,
    supplier: HANOI_SUPPLY,
    price: 1250000,
    discount: 0,
    stock: 19,
    hasVariant: false,
    description: 'Bộ 219 phím profile OSA, hỗ trợ cả layout Mac và Windows, in dye-sub.',
  },
  {
    name: 'Keycap FL Esports SA Sương Mai',
    sku: 'KC-FLE-018',
    brand: 'FL Esports',
    category: KEYCAP,
    supplier: KICAP_DIST,
    price: 550000,
    discount: 12,
    stock: 44,
    hasVariant: false,
    description: 'Bộ 129 phím profile SA cao, tông pastel xám xanh, chất liệu PBT.',
  },
  {
    name: 'Keycap AKKO MDA Wabi-Sabi',
    sku: 'KC-AKK-019',
    brand: 'AKKO',
    category: KEYCAP,
    supplier: KICAP_DIST,
    price: 1150000,
    discount: 0,
    stock: 16,
    hasVariant: true,
    description: 'Bộ 229 phím profile MDA lấy cảm hứng mỹ học Nhật Bản, PBT dye-sub năm mặt.',
  },
  {
    name: 'Keycap Royal Kludge XDA Pastel',
    sku: 'KC-RKG-020',
    brand: 'Royal Kludge',
    category: KEYCAP,
    supplier: KICAP_DIST,
    price: 420000,
    discount: 8,
    stock: 50,
    hasVariant: false,
    description: 'Bộ 126 phím profile XDA phẳng, tông pastel, giá dễ tiếp cận cho bản build đầu tiên.',
  },

  // --- Switch (8) ---
  {
    name: 'Switch Gateron Yellow Pro (bộ 70)',
    sku: 'SW-GAT-021',
    brand: 'Gateron',
    category: SWITCH,
    supplier: SWITCH_HOUSE,
    price: 350000,
    discount: 0,
    stock: 60,
    hasVariant: true,
    description: 'Switch linear đã lube sẵn từ nhà máy, lực nhấn 50g, hành trình mượt, giá tốt.',
  },
  {
    name: 'Switch Gateron Oil King (bộ 70)',
    sku: 'SW-GAT-022',
    brand: 'Gateron',
    category: SWITCH,
    supplier: SWITCH_HOUSE,
    price: 620000,
    discount: 5,
    stock: 38,
    hasVariant: false,
    description: 'Linear cao cấp vỏ đen nhám, lực nhấn 55g, âm gõ trầm và đầm, lube sẵn.',
  },
  {
    name: 'Switch Gateron Baby Kangaroo (bộ 70)',
    sku: 'SW-GAT-023',
    brand: 'Gateron',
    category: SWITCH,
    supplier: SWITCH_HOUSE,
    price: 590000,
    discount: 0,
    stock: 30,
    hasVariant: false,
    description: 'Tactile bump rõ ở đầu hành trình, lực nhấn 67g, phản hồi dứt khoát.',
  },
  {
    name: 'Switch Kailh Box Jade (bộ 70)',
    sku: 'SW-KAI-024',
    brand: 'Kailh',
    category: SWITCH,
    supplier: SWITCH_HOUSE,
    price: 480000,
    discount: 10,
    stock: 25,
    hasVariant: false,
    description: 'Clicky click bar, tiếng lách cách vang và sắc, vỏ box chống bụi chống nước.',
  },
  {
    name: 'Switch Kailh Box White V2 (bộ 70)',
    sku: 'SW-KAI-025',
    brand: 'Kailh',
    category: SWITCH,
    supplier: SWITCH_HOUSE,
    price: 380000,
    discount: 0,
    stock: 42,
    hasVariant: false,
    description: 'Clicky bản cải tiến, lực nhấn 45g, nhẹ tay hơn Box Jade, độ ổn định cao.',
  },
  {
    name: 'Switch AKKO CS Jelly Purple (bộ 45)',
    sku: 'SW-AKK-026',
    brand: 'AKKO',
    category: SWITCH,
    supplier: KICAP_DIST,
    price: 250000,
    discount: 0,
    stock: 55,
    hasVariant: true,
    description: 'Linear vỏ trong, lực nhấn 45g, êm và nhẹ, hợp gõ văn bản thời gian dài.',
  },
  {
    name: 'Switch AKKO CS Lavender Purple (bộ 45)',
    sku: 'SW-AKK-027',
    brand: 'AKKO',
    category: SWITCH,
    supplier: KICAP_DIST,
    price: 280000,
    discount: 8,
    stock: 47,
    hasVariant: false,
    description: 'Tactile bump nhẹ, lực nhấn 50g, cân bằng giữa cảm giác phản hồi và độ êm.',
  },
  {
    name: 'Switch Monsgeek Sunset Linear (bộ 70)',
    sku: 'SW-MON-028',
    brand: 'Monsgeek',
    category: SWITCH,
    supplier: DANANG_IMPORT,
    price: 450000,
    discount: 0,
    stock: 29,
    hasVariant: false,
    description: 'Linear lube sẵn, lò xo dài 22mm, lực nhấn 63g, âm gõ thiên trầm.',
  },

  // --- Phụ kiện (6) ---
  {
    name: 'Cáp Xoắn Aviator USB-C Đen Bạc',
    sku: 'PK-KIC-029',
    brand: 'Kicap',
    category: ACCESSORY,
    supplier: KICAP_DIST,
    price: 320000,
    discount: 0,
    stock: 45,
    hasVariant: false,
    description: 'Cáp xoắn bọc dù dài 1.5m, đầu nối aviator tháo rời, tương thích mọi bàn phím USB-C.',
  },
  {
    name: 'Bộ Dụng Cụ Lube Switch 12 Món',
    sku: 'PK-KIC-030',
    brand: 'Kicap',
    category: ACCESSORY,
    supplier: KICAP_DIST,
    price: 290000,
    discount: 10,
    stock: 32,
    hasVariant: false,
    description: 'Gồm kẹp tách switch, cọ lube, khay giữ, nhíp và trạm chứa, đủ cho một lần build.',
  },
  {
    name: 'Dầu Lube Krytox 205g0 5ml',
    sku: 'PK-KIC-031',
    brand: 'Kicap',
    category: ACCESSORY,
    supplier: SWITCH_HOUSE,
    price: 180000,
    discount: 0,
    stock: 58,
    hasVariant: false,
    description: 'Mỡ lube tiêu chuẩn cho switch linear, lượng 5ml đủ cho khoảng 90 switch.',
  },
  {
    name: 'Foam Tiêu Âm Poron 3mm',
    sku: 'PK-KIC-032',
    brand: 'Kicap',
    category: ACCESSORY,
    supplier: KICAP_DIST,
    price: 120000,
    discount: 0,
    stock: 64,
    hasVariant: false,
    description: 'Tấm foam Poron cắt sẵn theo layout, giảm tiếng vọng trong khoang bàn phím.',
  },
  {
    name: 'Bộ Stabilizer Durock V2 Plate Mount',
    sku: 'PK-KIC-033',
    brand: 'Kicap',
    category: ACCESSORY,
    supplier: SWITCH_HOUSE,
    price: 350000,
    discount: 5,
    stock: 27,
    hasVariant: false,
    description: 'Stab plate mount vỏ trong, đã cắt gọt sẵn, giảm rung phím dài đáng kể.',
  },
  {
    name: 'Hộp Đựng Switch 100 Ngăn',
    sku: 'PK-KIC-034',
    brand: 'Kicap',
    category: ACCESSORY,
    supplier: KICAP_DIST,
    price: 95000,
    discount: 0,
    stock: 70,
    hasVariant: false,
    description: 'Hộp nhựa trong 100 ngăn có nắp, phân loại switch theo loại và lực nhấn.',
  },

  // --- Kê tay (3) ---
  {
    name: 'Kê Tay Gỗ Óc Chó Full-size',
    sku: 'KT-KIC-035',
    brand: 'Kicap',
    category: WRISTREST,
    supplier: DANANG_IMPORT,
    price: 450000,
    discount: 0,
    stock: 18,
    hasVariant: true,
    description: 'Kê tay gỗ óc chó nguyên khối, phủ dầu tự nhiên, chống trượt bằng đế cao su.',
  },
  {
    name: 'Kê Tay Gỗ Cao Su TKL',
    sku: 'KT-KIC-036',
    brand: 'Kicap',
    category: WRISTREST,
    supplier: DANANG_IMPORT,
    price: 320000,
    discount: 8,
    stock: 23,
    hasVariant: true,
    description: 'Kê tay gỗ cao su dài 36cm cho bàn phím TKL, cạnh bo tròn, hoàn thiện mịn.',
  },
  {
    name: 'Kê Tay Da PU Cho Layout 65%',
    sku: 'KT-KIC-037',
    brand: 'Kicap',
    category: WRISTREST,
    supplier: KICAP_DIST,
    price: 190000,
    discount: 0,
    stock: 36,
    hasVariant: false,
    description: 'Kê tay bọc da PU, lõi memory foam, dài 30cm, dễ lau chùi.',
  },

  // --- Chuột & Pad (3) ---
  {
    name: 'Deskmat Kicap Tokyo Night 900x400',
    sku: 'MP-KIC-038',
    brand: 'Kicap',
    category: MOUSEPAD,
    supplier: KICAP_DIST,
    price: 280000,
    discount: 0,
    stock: 41,
    hasVariant: false,
    description: 'Deskmat khổ lớn 900x400mm, mặt vải dệt mịn, viền may chắc, đế cao su chống trượt.',
  },
  {
    name: 'Deskmat Kicap Matcha 800x300',
    sku: 'MP-KIC-039',
    brand: 'Kicap',
    category: MOUSEPAD,
    supplier: KICAP_DIST,
    price: 240000,
    discount: 10,
    stock: 39,
    hasVariant: false,
    description: 'Deskmat 800x300mm tông xanh matcha, dày 4mm, hợp bàn làm việc cỡ vừa.',
  },
  {
    name: 'Pad Lót Chuột Tròn Kicap Mini',
    sku: 'MP-KIC-040',
    brand: 'Kicap',
    category: MOUSEPAD,
    supplier: KICAP_DIST,
    price: 90000,
    discount: 0,
    stock: 75,
    hasVariant: false,
    description: 'Pad tròn đường kính 22cm, mặt vải tốc độ, phù hợp không gian bàn nhỏ.',
  },
];

// 12 products carry variants. priceDelta is added to the parent product's price.
export const variants = [
  // 6 keyboards x 3 switch options
  {
    product: 'AKKO 3068B Plus World Tour Tokyo',
    name: 'Loại switch',
    value: 'AKKO CS Jelly Purple',
    sku: 'KB-AKK-001-V1',
    priceDelta: 0,
    stock: 10,
  },
  {
    product: 'AKKO 3068B Plus World Tour Tokyo',
    name: 'Loại switch',
    value: 'AKKO CS Lavender Purple',
    sku: 'KB-AKK-001-V2',
    priceDelta: 50000,
    stock: 8,
  },
  {
    product: 'AKKO 3068B Plus World Tour Tokyo',
    name: 'Loại switch',
    value: 'Gateron Yellow Pro',
    sku: 'KB-AKK-001-V3',
    priceDelta: 80000,
    stock: 6,
  },
  {
    product: 'Keychron K8 Pro Vỏ Nhôm',
    name: 'Loại switch',
    value: 'Gateron Yellow Pro',
    sku: 'KB-KEY-003-V1',
    priceDelta: 0,
    stock: 6,
  },
  {
    product: 'Keychron K8 Pro Vỏ Nhôm',
    name: 'Loại switch',
    value: 'Gateron Baby Kangaroo',
    sku: 'KB-KEY-003-V2',
    priceDelta: 120000,
    stock: 5,
  },
  {
    product: 'Keychron K8 Pro Vỏ Nhôm',
    name: 'Loại switch',
    value: 'Kailh Box White V2',
    sku: 'KB-KEY-003-V3',
    priceDelta: 60000,
    stock: 4,
  },
  {
    product: 'Keychron V6 Max Có Núm Xoay',
    name: 'Loại switch',
    value: 'Gateron Yellow Pro',
    sku: 'KB-KEY-004-V1',
    priceDelta: 0,
    stock: 8,
  },
  {
    product: 'Keychron V6 Max Có Núm Xoay',
    name: 'Loại switch',
    value: 'Gateron Oil King',
    sku: 'KB-KEY-004-V2',
    priceDelta: 150000,
    stock: 6,
  },
  {
    product: 'Keychron V6 Max Có Núm Xoay',
    name: 'Loại switch',
    value: 'Gateron Baby Kangaroo',
    sku: 'KB-KEY-004-V3',
    priceDelta: 130000,
    stock: 4,
  },
  {
    product: 'FL Esports MK750 Ba Chế Độ',
    name: 'Loại switch',
    value: 'Gateron Yellow Pro',
    sku: 'KB-FLE-008-V1',
    priceDelta: 0,
    stock: 12,
  },
  {
    product: 'FL Esports MK750 Ba Chế Độ',
    name: 'Loại switch',
    value: 'Kailh Box Jade',
    sku: 'KB-FLE-008-V2',
    priceDelta: 90000,
    stock: 10,
  },
  {
    product: 'FL Esports MK750 Ba Chế Độ',
    name: 'Loại switch',
    value: 'Monsgeek Sunset Linear',
    sku: 'KB-FLE-008-V3',
    priceDelta: 70000,
    stock: 8,
  },
  {
    product: 'Royal Kludge RK84 Pro',
    name: 'Loại switch',
    value: 'AKKO CS Jelly Purple',
    sku: 'KB-RKG-010-V1',
    priceDelta: 0,
    stock: 9,
  },
  {
    product: 'Royal Kludge RK84 Pro',
    name: 'Loại switch',
    value: 'Gateron Yellow Pro',
    sku: 'KB-RKG-010-V2',
    priceDelta: 60000,
    stock: 7,
  },
  {
    product: 'Royal Kludge RK84 Pro',
    name: 'Loại switch',
    value: 'Kailh Box White V2',
    sku: 'KB-RKG-010-V3',
    priceDelta: 50000,
    stock: 6,
  },
  {
    product: 'Monsgeek M1W Bản Đặc Biệt',
    name: 'Loại switch',
    value: 'Gateron Oil King',
    sku: 'KB-MON-012-V1',
    priceDelta: 0,
    stock: 5,
  },
  {
    product: 'Monsgeek M1W Bản Đặc Biệt',
    name: 'Loại switch',
    value: 'Monsgeek Sunset Linear',
    sku: 'KB-MON-012-V2',
    priceDelta: -40000,
    stock: 4,
  },
  {
    product: 'Monsgeek M1W Bản Đặc Biệt',
    name: 'Loại switch',
    value: 'Gateron Baby Kangaroo',
    sku: 'KB-MON-012-V3',
    priceDelta: 20000,
    stock: 2,
  },

  // 2 keycap sets x 2 colours
  {
    product: 'Keycap Monsgeek Cherry Trắng Xám',
    name: 'Màu sắc',
    value: 'Trắng xám',
    sku: 'KC-MON-016-V1',
    priceDelta: 0,
    stock: 18,
  },
  {
    product: 'Keycap Monsgeek Cherry Trắng Xám',
    name: 'Màu sắc',
    value: 'Đen xám',
    sku: 'KC-MON-016-V2',
    priceDelta: 0,
    stock: 15,
  },
  {
    product: 'Keycap AKKO MDA Wabi-Sabi',
    name: 'Màu sắc',
    value: 'Bản đầy đủ 229 phím',
    sku: 'KC-AKK-019-V1',
    priceDelta: 0,
    stock: 9,
  },
  {
    product: 'Keycap AKKO MDA Wabi-Sabi',
    name: 'Màu sắc',
    value: 'Bản rút gọn 129 phím',
    sku: 'KC-AKK-019-V2',
    priceDelta: -350000,
    stock: 7,
  },

  // 2 switch packs x 2 colours
  {
    product: 'Switch Gateron Yellow Pro (bộ 70)',
    name: 'Màu sắc',
    value: 'Vàng trong',
    sku: 'SW-GAT-021-V1',
    priceDelta: 0,
    stock: 32,
  },
  {
    product: 'Switch Gateron Yellow Pro (bộ 70)',
    name: 'Màu sắc',
    value: 'Vàng đục',
    sku: 'SW-GAT-021-V2',
    priceDelta: 20000,
    stock: 28,
  },
  {
    product: 'Switch AKKO CS Jelly Purple (bộ 45)',
    name: 'Màu sắc',
    value: 'Tím trong',
    sku: 'SW-AKK-026-V1',
    priceDelta: 0,
    stock: 30,
  },
  {
    product: 'Switch AKKO CS Jelly Purple (bộ 45)',
    name: 'Màu sắc',
    value: 'Tím khói',
    sku: 'SW-AKK-026-V2',
    priceDelta: 15000,
    stock: 25,
  },

  // 2 wrist rests x 2 layouts
  {
    product: 'Kê Tay Gỗ Óc Chó Full-size',
    name: 'Layout',
    value: 'Full-size 44cm',
    sku: 'KT-KIC-035-V1',
    priceDelta: 0,
    stock: 10,
  },
  {
    product: 'Kê Tay Gỗ Óc Chó Full-size',
    name: 'Layout',
    value: 'TKL 36cm',
    sku: 'KT-KIC-035-V2',
    priceDelta: -60000,
    stock: 8,
  },
  {
    product: 'Kê Tay Gỗ Cao Su TKL',
    name: 'Layout',
    value: 'TKL 36cm',
    sku: 'KT-KIC-036-V1',
    priceDelta: 0,
    stock: 13,
  },
  {
    product: 'Kê Tay Gỗ Cao Su TKL',
    name: 'Layout',
    value: '65% 30cm',
    sku: 'KT-KIC-036-V2',
    priceDelta: -50000,
    stock: 10,
  },
];

// toProduct is set to '/products' in seed.js. It must NOT point at a product
// detail URL: HeroSlider.jsx:41 renders a plain <Link>, and
// ProductDetails.jsx:27 reads location.state.id unguarded, so arriving without
// router state throws a TypeError.
export const sliders = [
  { label: 'Ban phim co custom', description: 'Bàn phím cơ custom — dựng sẵn, gõ là mê', displayOrder: 0 },
  { label: 'Keycap moi ve', description: 'Bộ keycap mới về — PBT dye-sub nhiều profile', displayOrder: 1 },
  { label: 'Switch lube san', description: 'Switch lube sẵn — mượt ngay khi lắp', displayOrder: 2 },
  { label: 'Phu kien build phim', description: 'Phụ kiện build phím — đủ đồ cho lần đầu', displayOrder: 3 },
];
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd /home/antpt/workspaces/kicap/server && npm test`
Expected: PASS.

- [ ] **Step 5: Add `seedCatalog` to `server/scripts/seed.js`**

Add these imports below the existing ones:

```js
import { convertToSlug, roundedPrice } from '../src/utils/index.js';
```

Insert `seedCatalog` after `seedReference`:

```js
// price is the struck-through original; salePrice is what the customer pays
// (client/src/components/ProductCard/ProductCard.jsx:76-79).
const applyDiscount = (price, discount) => roundedPrice((price * (100 - discount)) / 100);

const seedCatalog = async () => {
  const products = await Product.insertMany(
    data.products.map((p) => ({
      ...p,
      slug: convertToSlug(p.name),
      salePrice: applyDiscount(p.price, p.discount),
      image: placeholderImageFor(p.name, 1),
      more_image: placeholderImageFor(p.name, 2),
      rating: 0,
    })),
  );

  const byName = new Map(products.map((p) => [p.name, p]));

  await Variant.insertMany(
    data.variants.map((v, index) => {
      const parent = byName.get(v.product);
      const price = parent.price + v.priceDelta;
      return {
        productID: parent._id,
        sku: v.sku,
        name: v.name,
        value: v.value,
        stock: v.stock,
        discount: parent.discount,
        price,
        salePrice: applyDiscount(price, parent.discount),
        displayOrder: index,
        toImageOrder: 0,
      };
    }),
  );

  await ProductImage.insertMany(
    products.flatMap((p) =>
      [0, 1, 2].map((order) => ({
        productID: p._id,
        image: placeholderImageFor(p.name, order + 1),
        description: `${p.name} - ảnh ${order + 1}`,
        displayOrder: order,
        isHidden: false,
      })),
    ),
  );

  await Slider.insertMany(
    data.sliders.map((s) => ({
      image: data.placeholderImage(s.label, '1600x600'),
      description: s.description,
      displayOrder: s.displayOrder,
      toProduct: '/products',
    })),
  );

  return products;
};
```

Add the small helper above `seedCatalog` so product and gallery images stay consistent:

```js
const placeholderImageFor = (name, index) => data.placeholderImage(`${name} ${index}`);
```

Then call it inside `run()`, replacing the single `await seedReference();` line with:

```js
await seedReference();
await seedCatalog();
```

- [ ] **Step 6: Verify the `convertToSlug` import chain actually loads**

`src/utils/index.js` pulls in `firebase/app`, `firebase/storage`, `nodemailer`, and `jsonwebtoken` at module scope. None of them connect on import — `nodemailer.createTransport` only builds an object, and the Firebase calls all sit inside function bodies — but confirm before relying on it:

```bash
cd /home/antpt/workspaces/kicap/server
node -e "import('./src/utils/index.js').then(m => console.log(m.convertToSlug('Kê Tay Gỗ Óc Chó Full-size')))"
```

Expected: `ke-tay-go-oc-cho-full-size`

If this throws instead, do not fight it: copy the six-line `convertToSlug` and the one-line `roundedPrice` from `src/utils/index.js:123-131` into `seed-data.js` as exports, with a comment naming the source file and line range, and import them from there. Everything downstream is unchanged.

- [ ] **Step 7: Re-seed and verify the catalog counts**

```bash
cd /home/antpt/workspaces/kicap/server && npm run seed -- --yes
```

Expected in the post-seed table: `Product 40`, `Variant 30`, `ProductImage 120`, `Slider 4`, alongside the Task 2 counts.

- [ ] **Step 8: Verify slugs and sale prices landed correctly**

```bash
mongosh --quiet kicap --eval '
  const p = db.products.findOne({ sku: "KB-AKK-001" });
  print(p.name, "|", p.slug, "| price", p.price, "| salePrice", p.salePrice, "| discount", p.discount);
  print("san pham khong co slug:", db.products.countDocuments({ slug: { $in: [null, ""] } }));
'
```

Expected: slug `akko-3068b-plus-world-tour-tokyo`, `price 1690000`, `salePrice 1521000`, `discount 10`, and `san pham khong co slug: 0`.

- [ ] **Step 9: Verify the homepage sections fill**

With both `npm run dev` and `yarn dev` running, open `http://localhost:5173`. Expected: the hero slider shows 4 banners, and all four product sections (Bàn phím cơ, Keycap bộ, Switch, Phụ kiện) render cards with Vietnamese names, a struck-through price where `discount > 0`, and a `-N%` badge.

Then check the filter page at `http://localhost:5173/products` — the Thương hiệu facet should list AKKO, Keychron, Leopold, FL Esports, Royal Kludge, Monsgeek, Gateron, Kailh, and Kicap, and selecting one narrows the grid.

- [ ] **Step 10: Commit — DO NOT RUN without explicit approval**

```bash
cd /home/antpt/workspaces/kicap/server
git add scripts/
git commit -m "feat(seed): add product catalog, variants, images and sliders"
```

---

## Task 4: Users, orders and comments

**Files:**

- Modify: `server/scripts/seed-data.js` (append), `server/scripts/seed-data.test.js` (append), `server/scripts/seed.js` (add `seedCommerce`)

**Interfaces:**

- Consumes: `products` from Task 3, `shippers` and `provinces` from Task 2, and the `Product[]` returned by `seedCatalog()`.
- Produces, from `seed-data.js`:
  - `users: Array<{ name, email, phone, password, isAdmin, address, province }>` — 5 items, plaintext passwords hashed in `seed.js`
  - `orders: Array<{ customer, daysAgo, status, paymentMethod, shippingPrice, note, items: Array<{ product, quantity, variant }> }>` — 18 items
  - `comments: Array<{ product, user, rating, content }>` — 60 items
- Produces, from `seed.js`: `seedCommerce(products)`, and `recomputeRatings()`.

- [ ] **Step 1: Append the failing tests to `server/scripts/seed-data.test.js`**

Extend the import list with `comments, orders, users`, then append:

```js
describe('users', () => {
  it('has exactly one admin among five accounts', () => {
    assert.equal(users.length, 5);
    assert.equal(users.filter((u) => u.isAdmin).length, 1);
  });

  it('has unique email and phone values', () => {
    // UserModel declares both unique.
    assert.deepEqual(duplicates(users.map((u) => u.email)), []);
    assert.deepEqual(duplicates(users.map((u) => u.phone)), []);
  });

  it('gives every customer an address and a seeded province', () => {
    const provinceNames = provinces.map((p) => p.provinceName);
    for (const u of users.filter((x) => !x.isAdmin)) {
      assert.ok(u.address.length > 0, `${u.email} has no address`);
      assert.ok(provinceNames.includes(u.province), `${u.email} has unknown province ${u.province}`);
    }
  });
});

describe('orders', () => {
  it('has 18 orders, each with at least one line item', () => {
    assert.equal(orders.length, 18);
    for (const o of orders) assert.ok(o.items.length >= 1);
  });

  it('uses only statuses that OrderStatus covers', () => {
    // ShowOrder.jsx:72 crashes on an uncovered status.
    const covered = orderStatuses.map((s) => s.status);
    for (const o of orders) {
      assert.ok(covered.includes(o.status), `order status ${o.status} has no OrderStatus row`);
    }
  });

  it('covers every stage of the live order flow', () => {
    for (const status of [0, 1, 2, 3]) {
      assert.ok(
        orders.some((o) => o.status === status),
        `no order at status ${status}`,
      );
    }
  });

  it('references only seeded customers and products', () => {
    const emails = users.filter((u) => !u.isAdmin).map((u) => u.email);
    const names = products.map((p) => p.name);
    for (const o of orders) {
      assert.ok(emails.includes(o.customer), `order references unknown customer ${o.customer}`);
      for (const item of o.items) {
        assert.ok(names.includes(item.product), `order references unknown product ${item.product}`);
        assert.ok(item.quantity > 0, `non-positive quantity on ${item.product}`);
      }
    }
  });

  it('names a real variant whenever a line item specifies one', () => {
    for (const o of orders) {
      for (const item of o.items.filter((i) => i.variant)) {
        const [attribute, value] = item.variant.split('/');
        const match = variants.find((v) => v.product === item.product && v.name === attribute && v.value === value);
        assert.ok(match, `no variant ${item.variant} on ${item.product}`);
      }
    }
  });

  it('only puts variants on products flagged hasVariant', () => {
    const byName = new Map(products.map((p) => [p.name, p]));
    for (const o of orders) {
      for (const item of o.items) {
        if (!item.variant) continue;
        assert.ok(byName.get(item.product).hasVariant, `${item.product} is not a variant product`);
      }
    }
  });

  it('uses a payment method the checkout knows', () => {
    for (const o of orders) {
      assert.ok(['COD', 'VNPAY'].includes(o.paymentMethod), `bad payment method ${o.paymentMethod}`);
    }
  });

  it('keeps daysAgo inside the last four months', () => {
    for (const o of orders) assert.ok(o.daysAgo >= 0 && o.daysAgo <= 120);
  });
});

describe('comments', () => {
  it('has 60 comments rated 3 to 5 on seeded products', () => {
    assert.equal(comments.length, 60);
    const names = products.map((p) => p.name);
    for (const c of comments) {
      assert.ok(names.includes(c.product), `comment on unknown product ${c.product}`);
      assert.ok(c.rating >= 3 && c.rating <= 5, `rating ${c.rating} out of range`);
      assert.ok(c.content.length > 0);
      assert.ok(c.user.length > 0);
    }
  });

  it('spreads across at least 15 distinct products', () => {
    assert.ok(new Set(comments.map((c) => c.product)).size >= 15);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd /home/antpt/workspaces/kicap/server && npm test`
Expected: FAIL — `does not provide an export named 'users'`

- [ ] **Step 3: Append users, orders and comments to `server/scripts/seed-data.js`**

```js
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

// variant format is `${attributeName}/${value}`, matching
// client/src/pages/ProductDetails/ProductDetails.jsx:110. Empty means no variant.
export const orders = [
  {
    customer: 'khach1@kicap.local',
    daysAgo: 2,
    status: 0,
    paymentMethod: 'COD',
    shippingPrice: 30000,
    note: 'Giao giờ hành chính',
    items: [{ product: 'AKKO 3068B Plus World Tour Tokyo', quantity: 1, variant: 'Loại switch/AKKO CS Jelly Purple' }],
  },
  {
    customer: 'khach2@kicap.local',
    daysAgo: 3,
    status: 0,
    paymentMethod: 'VNPAY',
    shippingPrice: 30000,
    note: '',
    items: [
      { product: 'Keycap AKKO Matcha Red Bean', quantity: 1, variant: '' },
      { product: 'Dầu Lube Krytox 205g0 5ml', quantity: 2, variant: '' },
    ],
  },
  {
    customer: 'khach3@kicap.local',
    daysAgo: 4,
    status: 0,
    paymentMethod: 'COD',
    shippingPrice: 35000,
    note: 'Gọi trước khi giao',
    items: [{ product: 'Switch Gateron Yellow Pro (bộ 70)', quantity: 1, variant: 'Màu sắc/Vàng trong' }],
  },
  {
    customer: 'khach4@kicap.local',
    daysAgo: 5,
    status: 0,
    paymentMethod: 'COD',
    shippingPrice: 35000,
    note: '',
    items: [
      { product: 'Pad Lót Chuột Tròn Kicap Mini', quantity: 2, variant: '' },
      { product: 'Hộp Đựng Switch 100 Ngăn', quantity: 1, variant: '' },
    ],
  },

  {
    customer: 'khach1@kicap.local',
    daysAgo: 9,
    status: 1,
    paymentMethod: 'VNPAY',
    shippingPrice: 30000,
    note: '',
    items: [{ product: 'Keychron K8 Pro Vỏ Nhôm', quantity: 1, variant: 'Loại switch/Gateron Baby Kangaroo' }],
  },
  {
    customer: 'khach2@kicap.local',
    daysAgo: 11,
    status: 1,
    paymentMethod: 'COD',
    shippingPrice: 30000,
    note: 'Để hàng ở lễ tân',
    items: [
      { product: 'Bộ Dụng Cụ Lube Switch 12 Món', quantity: 1, variant: '' },
      { product: 'Foam Tiêu Âm Poron 3mm', quantity: 3, variant: '' },
    ],
  },
  {
    customer: 'khach3@kicap.local',
    daysAgo: 13,
    status: 1,
    paymentMethod: 'COD',
    shippingPrice: 35000,
    note: '',
    items: [{ product: 'Kê Tay Gỗ Cao Su TKL', quantity: 1, variant: 'Layout/TKL 36cm' }],
  },
  {
    customer: 'khach4@kicap.local',
    daysAgo: 15,
    status: 1,
    paymentMethod: 'VNPAY',
    shippingPrice: 35000,
    note: '',
    items: [{ product: 'Keycap Royal Kludge XDA Pastel', quantity: 2, variant: '' }],
  },

  {
    customer: 'khach1@kicap.local',
    daysAgo: 21,
    status: 2,
    paymentMethod: 'COD',
    shippingPrice: 30000,
    note: '',
    items: [
      { product: 'Royal Kludge RK84 Pro', quantity: 1, variant: 'Loại switch/Gateron Yellow Pro' },
      { product: 'Deskmat Kicap Matcha 800x300', quantity: 1, variant: '' },
    ],
  },
  {
    customer: 'khach2@kicap.local',
    daysAgo: 24,
    status: 2,
    paymentMethod: 'VNPAY',
    shippingPrice: 30000,
    note: 'Giao cuối tuần',
    items: [{ product: 'Switch Gateron Oil King (bộ 70)', quantity: 1, variant: '' }],
  },
  {
    customer: 'khach3@kicap.local',
    daysAgo: 27,
    status: 2,
    paymentMethod: 'COD',
    shippingPrice: 35000,
    note: '',
    items: [{ product: 'FL Esports MK750 Ba Chế Độ', quantity: 1, variant: 'Loại switch/Kailh Box Jade' }],
  },
  {
    customer: 'khach4@kicap.local',
    daysAgo: 30,
    status: 2,
    paymentMethod: 'COD',
    shippingPrice: 35000,
    note: '',
    items: [
      { product: 'Bộ Stabilizer Durock V2 Plate Mount', quantity: 1, variant: '' },
      { product: 'Cáp Xoắn Aviator USB-C Đen Bạc', quantity: 1, variant: '' },
    ],
  },

  {
    customer: 'khach1@kicap.local',
    daysAgo: 40,
    status: 3,
    paymentMethod: 'VNPAY',
    shippingPrice: 30000,
    note: '',
    items: [{ product: 'Keychron Q1 Pro QMK Bản Nhôm', quantity: 1, variant: '' }],
  },
  {
    customer: 'khach2@kicap.local',
    daysAgo: 52,
    status: 3,
    paymentMethod: 'COD',
    shippingPrice: 30000,
    note: '',
    items: [
      { product: 'Keycap AKKO MDA Wabi-Sabi', quantity: 1, variant: 'Màu sắc/Bản đầy đủ 229 phím' },
      { product: 'Keycap AKKO Ocean Star Profile Cherry', quantity: 1, variant: '' },
    ],
  },
  {
    customer: 'khach3@kicap.local',
    daysAgo: 63,
    status: 3,
    paymentMethod: 'VNPAY',
    shippingPrice: 35000,
    note: '',
    items: [{ product: 'Leopold FC660M Bản Xám Than', quantity: 1, variant: '' }],
  },
  {
    customer: 'khach4@kicap.local',
    daysAgo: 78,
    status: 3,
    paymentMethod: 'COD',
    shippingPrice: 35000,
    note: 'Đã nhận, cảm ơn shop',
    items: [
      { product: 'Monsgeek M1W Bản Đặc Biệt', quantity: 1, variant: 'Loại switch/Gateron Oil King' },
      { product: 'Kê Tay Gỗ Óc Chó Full-size', quantity: 1, variant: 'Layout/Full-size 44cm' },
    ],
  },
  {
    customer: 'khach1@kicap.local',
    daysAgo: 95,
    status: 3,
    paymentMethod: 'VNPAY',
    shippingPrice: 30000,
    note: '',
    items: [{ product: 'Switch AKKO CS Jelly Purple (bộ 45)', quantity: 2, variant: 'Màu sắc/Tím trong' }],
  },
  {
    customer: 'khach2@kicap.local',
    daysAgo: 112,
    status: 3,
    paymentMethod: 'COD',
    shippingPrice: 30000,
    note: '',
    items: [
      { product: 'Deskmat Kicap Tokyo Night 900x400', quantity: 1, variant: '' },
      { product: 'Kê Tay Da PU Cho Layout 65%', quantity: 1, variant: '' },
    ],
  },
];

// Comment.user is a plain display-name string, not a reference (CommentModel.js).
export const comments = [
  {
    product: 'AKKO 3068B Plus World Tour Tokyo',
    user: 'Hoàng Long',
    rating: 5,
    content: 'Gõ êm, foam sẵn trong máy nên không bị vọng. Đáng tiền ở tầm giá này.',
  },
  {
    product: 'AKKO 3068B Plus World Tour Tokyo',
    user: 'Minh Tuấn',
    rating: 4,
    content: 'Keycap ASA hơi cao, quen tay mất khoảng hai ngày. Còn lại ổn.',
  },
  {
    product: 'AKKO 3068B Plus World Tour Tokyo',
    user: 'Thu Trang',
    rating: 5,
    content: 'Pin trâu, dùng cả tuần mới sạc lại. Màu sắc đúng như ảnh.',
  },
  {
    product: 'AKKO MOD007B PC Hiệu Ứng Từ Trường',
    user: 'Quốc Bảo',
    rating: 5,
    content: 'Chỉnh được hành trình kích hoạt, chơi game phản hồi nhanh hẳn.',
  },
  {
    product: 'AKKO MOD007B PC Hiệu Ứng Từ Trường',
    user: 'Đức Duy',
    rating: 4,
    content: 'Phần mềm hơi khó dùng lúc đầu nhưng phím thì rất tốt.',
  },
  {
    product: 'Keychron K8 Pro Vỏ Nhôm',
    user: 'Khánh Linh',
    rating: 5,
    content: 'Vỏ nhôm nặng, đặt bàn không xê dịch. QMK chỉnh thoải mái.',
  },
  {
    product: 'Keychron K8 Pro Vỏ Nhôm',
    user: 'Anh Khoa',
    rating: 4,
    content: 'Hơi nặng để mang đi làm, nhưng để cố định ở nhà thì tuyệt.',
  },
  {
    product: 'Keychron K8 Pro Vỏ Nhôm',
    user: 'Mai Anh',
    rating: 5,
    content: 'Hotswap dễ thao tác, đổi switch không cần hàn.',
  },
  {
    product: 'Keychron V6 Max Có Núm Xoay',
    user: 'Trọng Nghĩa',
    rating: 4,
    content: 'Núm xoay dùng sướng. Full-size hơi chiếm bàn.',
  },
  {
    product: 'Keychron V6 Max Có Núm Xoay',
    user: 'Hải Yến',
    rating: 5,
    content: 'Kết nối 2.4GHz ổn định, không thấy trễ khi làm việc.',
  },
  {
    product: 'Keychron Q1 Pro QMK Bản Nhôm',
    user: 'Hoàng Long',
    rating: 5,
    content: 'Hoàn thiện tốt nhất trong số phím mình từng mua. Gasket êm.',
  },
  {
    product: 'Keychron Q1 Pro QMK Bản Nhôm',
    user: 'Thanh Tùng',
    rating: 4,
    content: 'Giá cao nhưng xứng đáng nếu định dùng lâu dài.',
  },
  {
    product: 'Leopold FC660M Bản Xám Than',
    user: 'Đức Duy',
    rating: 5,
    content: 'Keycap PBT dày, gõ nhiều năm chắc vẫn chưa bóng.',
  },
  {
    product: 'Leopold FC660M Bản Xám Than',
    user: 'Ngọc Ánh',
    rating: 4,
    content: 'Không hotswap là điểm trừ duy nhất với mình.',
  },
  {
    product: 'Leopold FC900R Bluetooth',
    user: 'Quang Huy',
    rating: 4,
    content: 'Chuyển giữa hai máy nhanh, độ hoàn thiện đúng chuẩn Leopold.',
  },
  {
    product: 'FL Esports MK750 Ba Chế Độ',
    user: 'Khánh Linh',
    rating: 5,
    content: 'Tầm giá này mà có gasket với foam sẵn thì quá tốt.',
  },
  {
    product: 'FL Esports MK750 Ba Chế Độ',
    user: 'Bảo Ngọc',
    rating: 4,
    content: 'Đèn hơi chói vào ban đêm, phải giảm độ sáng.',
  },
  {
    product: 'FL Esports MK750 Ba Chế Độ',
    user: 'Trung Kiên',
    rating: 5,
    content: 'Mua làm phím đầu tiên, không phải mod gì thêm.',
  },
  {
    product: 'FL Esports CMK87 Gasket',
    user: 'Mai Anh',
    rating: 4,
    content: 'Vỏ nhựa nên nhẹ, nhưng âm gõ vẫn đầm nhờ foam.',
  },
  {
    product: 'Royal Kludge RK84 Pro',
    user: 'Hoàng Long',
    rating: 4,
    content: 'Ba chế độ tiện, chuyển máy nhanh. Núm xoay nhạy.',
  },
  {
    product: 'Royal Kludge RK84 Pro',
    user: 'Phương Thảo',
    rating: 3,
    content: 'Stab hơi rung ở phím Space, phải tự chỉnh lại.',
  },
  {
    product: 'Royal Kludge R65 Từ Trường',
    user: 'Đức Duy',
    rating: 4,
    content: 'Giá dưới một triệu mà có switch từ trường thì đáng thử.',
  },
  {
    product: 'Monsgeek M1W Bản Đặc Biệt',
    user: 'Quốc Bảo',
    rating: 5,
    content: 'Vỏ nhôm CNC đẹp, đóng hộp cẩn thận, phụ kiện đầy đủ.',
  },
  {
    product: 'Monsgeek M1W Bản Đặc Biệt',
    user: 'Thu Trang',
    rating: 5,
    content: 'Gõ ra âm trầm rất dễ chịu, không cần mod thêm.',
  },
  {
    product: 'Keycap AKKO Black & Pink Profile ASA',
    user: 'Khánh Linh',
    rating: 5,
    content: 'Màu lên đúng ảnh, đủ phím cho layout 65% của mình.',
  },
  {
    product: 'Keycap AKKO Black & Pink Profile ASA',
    user: 'Ngọc Ánh',
    rating: 4,
    content: 'Profile ASA cao hơn Cherry, cần thời gian làm quen.',
  },
  {
    product: 'Keycap AKKO Matcha Red Bean',
    user: 'Mai Anh',
    rating: 5,
    content: 'Tông xanh matcha nhìn dịu mắt, in dye-sub sắc nét.',
  },
  {
    product: 'Keycap AKKO Matcha Red Bean',
    user: 'Trung Kiên',
    rating: 5,
    content: 'Đủ phím phụ cho cả layout lẻ, không thiếu phím nào.',
  },
  {
    product: 'Keycap AKKO Ocean Star Profile Cherry',
    user: 'Hải Yến',
    rating: 4,
    content: 'Profile Cherry gõ thấp, thoải mái khi làm việc lâu.',
  },
  {
    product: 'Keycap Monsgeek Cherry Trắng Xám',
    user: 'Thanh Tùng',
    rating: 4,
    content: 'Tối giản, hợp bàn làm việc. Thành keycap dày chắc chắn.',
  },
  {
    product: 'Keycap Monsgeek Cherry Trắng Xám',
    user: 'Phương Thảo',
    rating: 3,
    content: 'Bản trắng xám hơi dễ bám bẩn, phải lau thường xuyên.',
  },
  {
    product: 'Keycap Keychron OSA PBT Full Set',
    user: 'Anh Khoa',
    rating: 5,
    content: 'Có sẵn cả phím Mac lẫn Windows, đổi máy không thiếu gì.',
  },
  {
    product: 'Keycap FL Esports SA Sương Mai',
    user: 'Bảo Ngọc',
    rating: 4,
    content: 'Profile SA cao, gõ vui tai nhưng nên dùng kèm kê tay.',
  },
  {
    product: 'Keycap AKKO MDA Wabi-Sabi',
    user: 'Quang Huy',
    rating: 5,
    content: 'Bộ này in năm mặt, nhìn góc nào cũng đẹp.',
  },
  {
    product: 'Keycap AKKO MDA Wabi-Sabi',
    user: 'Hoàng Long',
    rating: 5,
    content: 'Đắt hơn mặt bằng chung nhưng chất lượng in rất tốt.',
  },
  {
    product: 'Keycap Royal Kludge XDA Pastel',
    user: 'Thu Trang',
    rating: 4,
    content: 'Giá mềm, màu pastel dễ phối. XDA phẳng nên gõ đều tay.',
  },
  {
    product: 'Switch Gateron Yellow Pro (bộ 70)',
    user: 'Đức Duy',
    rating: 5,
    content: 'Lube sẵn từ nhà máy, lắp vào là mượt luôn, khỏi tự lube.',
  },
  {
    product: 'Switch Gateron Yellow Pro (bộ 70)',
    user: 'Trung Kiên',
    rating: 5,
    content: 'Giá tốt nhất trong nhóm linear mà mình từng dùng.',
  },
  {
    product: 'Switch Gateron Yellow Pro (bộ 70)',
    user: 'Ngọc Ánh',
    rating: 4,
    content: 'Vài con hơi lệch nhưng đa số đều tay.',
  },
  {
    product: 'Switch Gateron Oil King (bộ 70)',
    user: 'Quốc Bảo',
    rating: 5,
    content: 'Âm trầm và đầm, đúng như mô tả. Rất đáng tiền.',
  },
  {
    product: 'Switch Gateron Oil King (bộ 70)',
    user: 'Khánh Linh',
    rating: 5,
    content: 'Mượt hơn Yellow Pro rõ rệt, không cần lube thêm.',
  },
  {
    product: 'Switch Gateron Baby Kangaroo (bộ 70)',
    user: 'Mai Anh',
    rating: 4,
    content: 'Bump rõ ở đầu hành trình, gõ văn bản rất thích.',
  },
  {
    product: 'Switch Kailh Box Jade (bộ 70)',
    user: 'Thanh Tùng',
    rating: 4,
    content: 'Tiếng click to thật, không hợp dùng ở văn phòng chung.',
  },
  {
    product: 'Switch Kailh Box Jade (bộ 70)',
    user: 'Phương Thảo',
    rating: 5,
    content: 'Mình thích tiếng vang, con này đúng gu.',
  },
  {
    product: 'Switch Kailh Box White V2 (bộ 70)',
    user: 'Hải Yến',
    rating: 4,
    content: 'Nhẹ tay hơn Box Jade, tiếng click vẫn rõ.',
  },
  {
    product: 'Switch AKKO CS Jelly Purple (bộ 45)',
    user: 'Bảo Ngọc',
    rating: 4,
    content: 'Êm và nhẹ, gõ lâu không mỏi. Giá hợp lý.',
  },
  {
    product: 'Switch AKKO CS Jelly Purple (bộ 45)',
    user: 'Quang Huy',
    rating: 4,
    content: 'Bộ 45 con đủ cho layout 65% của mình.',
  },
  {
    product: 'Switch AKKO CS Lavender Purple (bộ 45)',
    user: 'Anh Khoa',
    rating: 5,
    content: 'Bump nhẹ vừa đủ, cân bằng tốt giữa êm và phản hồi.',
  },
  {
    product: 'Switch Monsgeek Sunset Linear (bộ 70)',
    user: 'Hoàng Long',
    rating: 4,
    content: 'Lò xo dài nên nhấn đều, âm thiên trầm dễ nghe.',
  },
  {
    product: 'Cáp Xoắn Aviator USB-C Đen Bạc',
    user: 'Thu Trang',
    rating: 5,
    content: 'Cáp chắc, đầu aviator tháo ra lắp vào nhẹ nhàng.',
  },
  {
    product: 'Cáp Xoắn Aviator USB-C Đen Bạc',
    user: 'Đức Duy',
    rating: 4,
    content: 'Đẹp, nhưng dây xoắn hơi ngắn nếu bàn sâu.',
  },
  {
    product: 'Bộ Dụng Cụ Lube Switch 12 Món',
    user: 'Trung Kiên',
    rating: 5,
    content: 'Đủ đồ cho lần build đầu, không phải mua lẻ thêm gì.',
  },
  {
    product: 'Bộ Dụng Cụ Lube Switch 12 Món',
    user: 'Ngọc Ánh',
    rating: 4,
    content: 'Cọ lube hơi to, nên mua thêm cọ nhỏ cho lò xo.',
  },
  {
    product: 'Dầu Lube Krytox 205g0 5ml',
    user: 'Quốc Bảo',
    rating: 5,
    content: 'Lube chuẩn cho linear, 5ml dùng được gần trăm con.',
  },
  {
    product: 'Foam Tiêu Âm Poron 3mm',
    user: 'Khánh Linh',
    rating: 4,
    content: 'Cắt sẵn theo layout nên lắp nhanh, giảm vọng rõ.',
  },
  {
    product: 'Bộ Stabilizer Durock V2 Plate Mount',
    user: 'Mai Anh',
    rating: 5,
    content: 'Đã cắt gọt sẵn, phím Space hết rung hẳn.',
  },
  {
    product: 'Hộp Đựng Switch 100 Ngăn',
    user: 'Thanh Tùng',
    rating: 4,
    content: 'Phân loại switch gọn gàng, nắp đóng chắc.',
  },
  {
    product: 'Kê Tay Gỗ Óc Chó Full-size',
    user: 'Phương Thảo',
    rating: 5,
    content: 'Vân gỗ đẹp, phủ dầu mịn tay, đế cao su bám bàn tốt.',
  },
  { product: 'Kê Tay Gỗ Cao Su TKL', user: 'Hải Yến', rating: 4, content: 'Giá mềm hơn óc chó mà hoàn thiện vẫn ổn.' },
  {
    product: 'Deskmat Kicap Tokyo Night 900x400',
    user: 'Bảo Ngọc',
    rating: 5,
    content: 'Khổ lớn đủ để cả bàn phím và chuột, viền may chắc.',
  },
];
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd /home/antpt/workspaces/kicap/server && npm test`
Expected: PASS.

- [ ] **Step 5: Add `seedCommerce` and `recomputeRatings` to `server/scripts/seed.js`**

Add `import bcrypt from 'bcrypt';` and `import { randomUUID } from 'node:crypto';` to the import block, then insert after `seedCatalog`:

```js
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

// Mirrors the transitions in OrderService.updateOrder:147-154 so seeded orders
// look exactly like ones the app produced itself.
const orderTimestamps = (orderTime, status) => {
  const stamps = { orderTime };
  if (status >= 1) stamps.acceptTime = new Date(orderTime.getTime() + 4 * HOUR);
  if (status >= 3) {
    stamps.shippedTime = new Date(orderTime.getTime() + 28 * HOUR);
    stamps.finishedTime = new Date(orderTime.getTime() + 52 * HOUR);
  }
  return stamps;
};

const seedCommerce = async (products) => {
  const userDocs = await User.insertMany(
    data.users.map((u) => ({
      ...u,
      password: bcrypt.hashSync(u.password, 10),
      isVerify: true,
      isLocked: 0,
      avatar: data.placeholderImage(u.name, '200x200'),
    })),
  );

  const userByEmail = new Map(userDocs.map((u) => [u.email, u]));
  const productByName = new Map(products.map((p) => [p.name, p]));
  const variantDocs = await Variant.find();
  const variantKey = (productID, name, value) => `${productID}|${name}|${value}`;
  const variantByKey = new Map(variantDocs.map((v) => [variantKey(v.productID.toString(), v.name, v.value), v]));

  const now = Date.now();
  const orderDocs = [];
  const detailDocs = [];

  data.orders.forEach((order, index) => {
    const customer = userByEmail.get(order.customer);
    const orderTime = new Date(now - order.daysAgo * DAY);
    const orderID = randomUUID();

    let itemsTotal = 0;
    for (const item of order.items) {
      const product = productByName.get(item.product);
      let unitPrice = product.salePrice;

      if (item.variant) {
        const [attribute, value] = item.variant.split('/');
        unitPrice = variantByKey.get(variantKey(product._id.toString(), attribute, value)).salePrice;
      }

      itemsTotal += unitPrice * item.quantity;
      detailDocs.push({
        orderID,
        productID: product._id.toString(),
        name: product.name,
        image: product.image,
        quantity: item.quantity,
        price: unitPrice,
        variant: item.variant,
        createdAt: orderTime,
        updatedAt: orderTime,
      });
    }

    orderDocs.push({
      orderID,
      userID: customer._id,
      // A shipper is assigned when the order moves to status 2 (DetailOrder.jsx:78).
      shipper: order.status >= 2 ? data.shippers[index % data.shippers.length].name : '',
      ...orderTimestamps(orderTime, order.status),
      status: order.status,
      deliveryAddress: customer.address,
      deliveryProvince: customer.province,
      email: customer.email,
      fullName: customer.name,
      phone: customer.phone,
      note: order.note,
      paymentMethod: order.paymentMethod,
      isPaid: order.status === 3 || order.paymentMethod === 'VNPAY',
      shippingPrice: order.shippingPrice,
      totalPrice: itemsTotal + order.shippingPrice,
      createdAt: orderTime,
      updatedAt: orderTime,
    });
  });

  await Order.insertMany(orderDocs);
  await OrderDetail.insertMany(detailDocs);

  await Comment.insertMany(
    data.comments.map((c) => ({
      user: c.user,
      content: c.content,
      rating: c.rating,
      product_id: productByName.get(c.product)._id,
    })),
  );
};

// Product.rating is a denormalised average; the app has no job that maintains
// it, so the seed computes it once from the comments it just inserted.
const recomputeRatings = async () => {
  const grouped = await Comment.aggregate([{ $group: { _id: '$product_id', average: { $avg: '$rating' } } }]);

  await Promise.all(
    grouped.map(({ _id, average }) => Product.updateOne({ _id }, { rating: Math.round(average * 10) / 10 })),
  );
};
```

Then extend `run()`:

```js
await seedReference();
const products = await seedCatalog();
await seedCommerce(products);
await recomputeRatings();
```

Note the `createdAt`/`updatedAt` overrides on orders and details: both schemas use `{ timestamps: true }`, which would otherwise stamp every seeded order with today's date and make the admin date-range filter useless. Mongoose honours explicit values passed to `insertMany`.

- [ ] **Step 6: Re-seed and verify all 14 collections fill**

```bash
cd /home/antpt/workspaces/kicap/server && npm run seed -- --yes
```

Expected post-seed table: `Province 34`, `OrderStatus 5`, `Shipper 3`, `Attribute 3`, `Category 6`, `Supplier 4`, `User 5`, `Product 40`, `Variant 30`, `ProductImage 120`, `Slider 4`, `Order 18`, `OrderDetail 26`, `Comment 60`.

- [ ] **Step 7: Verify order integrity in the database**

```bash
mongosh --quiet kicap --eval '
  print("don co status khong ro:", db.orders.countDocuments({ status: { $nin: db.orderstatuses.distinct("status") } }));
  print("don status>=1 thieu acceptTime:", db.orders.countDocuments({ status: { $gte: 1 }, acceptTime: null }));
  print("don status=3 chua isPaid:", db.orders.countDocuments({ status: 3, isPaid: false }));
  print("don status>=2 khong co shipper:", db.orders.countDocuments({ status: { $gte: 2 }, shipper: "" }));
  print("don khong co dong hang:", db.orders.countDocuments({ orderID: { $nin: db.orderdetails.distinct("orderID") } }));
  print("san pham co rating > 0:", db.products.countDocuments({ rating: { $gt: 0 } }));
'
```

Expected: every count is `0` except the last, which should be at least `15`.

- [ ] **Step 8: Verify the admin login works with the seeded hash**

```bash
curl -s -X POST http://localhost:3000/api/user/sign-in \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@kicap.local","password":"Admin@123"}'
```

Expected: `"status":"OK"` with an `access_token` in the payload. A `Mật khẩu không đúng` response means the bcrypt hashing in Step 5 diverged from `UserService`.

- [ ] **Step 9: Commit — DO NOT RUN without explicit approval**

```bash
cd /home/antpt/workspaces/kicap/server
git add scripts/
git commit -m "feat(seed): add users, orders, order details and comments"
```

---

## Task 5: End-to-end acceptance

No new files. This task walks the spec's Verification section against a running stack and records anything that does not hold.

**Files:**

- Modify: none (unless a defect is found, which is reported rather than patched)

**Interfaces:**

- Consumes: everything from Tasks 1–4.
- Produces: a pass/fail report against the spec's acceptance criteria.

- [ ] **Step 1: Start from a clean slate**

```bash
cd /home/antpt/workspaces/kicap/server && npm test && npm run seed -- --yes && npm run dev
```

In a second terminal: `cd /home/antpt/workspaces/kicap/client && yarn dev`

Expected: tests pass, the seed summary shows all 14 collections populated, both dev servers come up.

- [ ] **Step 2: Verify the API surface**

```bash
curl -s 'http://localhost:3000/api/product/get-all?limit=5' | head -c 400
curl -s 'http://localhost:3000/api/product/get-all?limit=6&category=B%C3%A0n%20ph%C3%ADm%20c%C6%A1' | head -c 400
curl -s http://localhost:3000/api/slider/get-all | head -c 300
curl -s http://localhost:3000/api/order-status/get-all | head -c 300
```

Expected: all four return `"status":"OK"` with populated `data` arrays and intact Vietnamese diacritics.

- [ ] **Step 3: Walk the storefront**

At `http://localhost:5173`, confirm:

- The hero slider cycles 4 banners; clicking one lands on `/products` without a crash.
- All four product sections render cards.
- `/products` filters by brand, by price band, and by `Hàng có sẵn`.
- Clicking a product card opens the detail page with a 3-image gallery; a `hasVariant` product shows its variant selector and the price updates on selection.
- Adding to cart and opening `/cart` shows the line at the variant's `salePrice`.

- [ ] **Step 4: Walk the admin area**

Log in at `/admin/login` as `admin@kicap.local` / `Admin@123`, then confirm:

- `/admin/dashboard` shows non-zero product, user, category and order counts.
- **`/admin/orders` loads without a `TypeError`** — this is the `ShowOrder.jsx:72` constraint; a crash here means an order carries a status with no `OrderStatus` row.
- Opening an order shows its line items, and the date-range filter returns orders across several months rather than only today.
- `/admin/products` paginates and search returns matches.

- [ ] **Step 5: Walk the customer account area**

Log in as `khach1@kicap.local` / `Khach@123` and confirm the order history lists that customer's 5 seeded orders with their correct status labels.

- [ ] **Step 6: Confirm the two known-empty spots and report**

The admin revenue chart stays empty — `DashboardService.getRevenue` never returns a `data` field. Refreshing a product detail page throws — `ProductDetails.jsx:27` reads `location.state.id` unguarded. Both are pre-existing defects listed as out of scope in the spec.

Write up the walkthrough result: which acceptance criteria passed, which failed, and for each failure whether it is seed data or pre-existing app code. Do not patch `client/src/` or `server/src/` — report and let the user decide.

- [ ] **Step 7: Commit — DO NOT RUN without explicit approval**

Nothing to commit unless Step 6 surfaced a seed-data fix. If it did:

```bash
cd /home/antpt/workspaces/kicap/server
git add scripts/
git commit -m "fix(seed): <what the walkthrough turned up>"
```

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: environment files and run commands → Task 1; the seed layout, mongoose approach and re-run safety → Task 2; insert order steps 1–6 → Tasks 2 and 3; steps 7–8 → Task 4; the data content table → Tasks 2–4; the Verification list → Task 5; the Out of Scope list → Global Constraints plus Task 5 Step 6. The four load-bearing constraints (category names, `OrderStatus` coverage, `toProduct`, `salePrice` semantics) each have a dedicated assertion.

**Corrections applied during review:**

- The spec's data table said `Variant` was "~35" and `hasVariant` was "~12 products". The plan pins these at exactly 30 variants across 12 products. The spec should be updated to match so the two documents do not drift.
- `OrderDetail` volume: the spec said "1–4 per order"; the 18 orders written here total 26 line items, all within 1–2 per order. The assertion checks `>= 1`, so this holds either way.
- Attribute ordering: the spec did not fix `displayOrder`; the plan assigns `Loại switch` = 1, `Màu sắc` = 2, `Layout` = 3, and the test enforces uniqueness.

**Placeholder scan.** No "TBD", no "add error handling", no "similar to Task N". Every code step carries the code. The one conditional branch (Step 6 of Task 3) names the exact fallback, the exact source lines to copy, and states that nothing downstream changes.

**Type consistency.** `placeholderImage(text, size)` is defined once in Task 2 and used with the same signature in Tasks 3 and 4. `placeholderImageFor(name, index)` is defined in Task 3 Step 5 before its first use in the same step. `seedCatalog()` returns `Product[]` in Task 3 and is consumed as `seedCommerce(products)` in Task 4. `variants[].product` matches `products[].name`, `variants[].name` matches `attributes[].name`, and `orders[].items[].variant` is `` `${name}/${value}` `` — asserted in Task 4 Step 1. `COLLECTIONS` is declared once in Task 2 with all 14 entries, so `printCounts` needs no change in later tasks.
