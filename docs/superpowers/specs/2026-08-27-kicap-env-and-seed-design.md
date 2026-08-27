# Kicap — Environment Setup and Database Seeding

**Date:** 2026-08-27
**Status:** Approved
**Scope:** `server/` (primary), `client/` (env file only)

## Problem

The repository ships no `.env` file and no `.env.example` in either `client/`
or `server/`. `server/index.js` reads `process.env.MONGODB_URL` and crashes
without it, so the project cannot be started from a fresh clone. The database
is also empty, which leaves the storefront blank and the admin dashboard
without data.

Two deliverables:

1. Working `.env` files for both applications, plus committed `.env.example`
   templates (both repos gitignore `.env`).
2. A seed script that populates all 14 collections with realistic Vietnamese
   e-commerce sample data for a mechanical keyboard shop.

## Constraints Discovered in the Code

These are load-bearing. Violating any of them produces a blank page or a
crash.

### Category names are hardcoded in the client

`client/src/pages/Home/Home.jsx:24-27` requests products by four exact
category strings:

```js
ProductService.getProducts({ limit: 6, category: 'Bàn phím cơ' }, dispatch),
ProductService.getProducts({ limit: 4, category: 'Keycap bộ' }, dispatch),
ProductService.getProducts({ limit: 4, category: 'Switch' }, dispatch),
ProductService.getProducts({ limit: 4, category: 'Phụ kiện' }, dispatch),
```

`ProductService.getProducts` (server) matches `Product.category` against the
string directly, and `getProductsByFilter` cross-references
`Category.categoryName`. Seed data must use these four names verbatim in both
the `Category` collection and every `Product.category` field, or the four
homepage sections render empty.

### Order status lookup has no null guard

`client/src/pages/admin/Order/ShowOrder/ShowOrder.jsx:72`:

```js
const statusString = resOrderStatuses.data.find((st) => st.status === status).description;
```

An `Order` whose `status` value has no matching document in `OrderStatus`
throws a `TypeError` and takes down the admin orders page. The `OrderStatus`
collection must cover every status value present on seeded orders.

### Order status semantics

From `client/src/pages/admin/Order/DetailOrder/DetailOrder.jsx` and
`server/src/services/OrderService.js:147-154`:

| Value | Meaning | Side effects applied on transition |
| --- | --- | --- |
| 0 | Awaiting approval | — |
| 1 | Approved | sets `acceptTime` |
| 2 | Shipping | requires a `shipper` |
| 3 | Completed | sets `shippedTime`, `finishedTime`, `isPaid = true` |

Seeded orders must set these timestamp fields consistently with their status,
matching what `updateOrder` would have produced.

### The product detail page requires router state

`client/src/pages/ProductDetails/ProductDetails.jsx:27` reads
`const productID = location.state.id;` with no guard. Only
`ProductCard.jsx:20,52` supplies that state. Reaching `/product/<slug>` any
other way — a page refresh, a pasted URL, or a plain `<Link>` — throws
`TypeError: Cannot read properties of null (reading 'id')`.

`HeroSlider.jsx:41` renders `<Link to={item.toProduct}>` with no state, so a
slider whose `toProduct` points at a product detail URL would crash the app on
click. Seeded sliders therefore point at `/products` (the listing page)
instead. Fixing the guard is a client-side change and is out of scope.

### Relations are joined by name, not by ObjectId

`Product.category`, `Product.supplier`, and `Product.brand` are free-form
strings. `Category.categoryName` and `Supplier.name` must match the
corresponding product strings exactly for filters and the admin product form
to work.

### Known dead code (out of scope)

`server/src/services/DashboardService.js:30-44` (`getRevenue`) builds a
`query` it never uses, calls `Order.find({})` and discards the result, and
resolves without a `data` field. The admin revenue chart will stay empty
regardless of seed data. This spec does not change it.

### Environment facts

Node v22.22.3, npm 10.9.8, yarn 1.22.22. `mongod` is already running on
`127.0.0.1:27017`; `mongosh` and Docker are available. No MongoDB Atlas
instance is needed.

## Part 1 — Environment Files

Four files. `client/.gitignore` and `server/.gitignore` both list `.env`, so
the `.example` files are what get committed.

### `server/.env` and `server/.env.example`

Required — the server will not function without these:

| Variable | Value | Read at |
| --- | --- | --- |
| `PORT` | `3000` | `index.js:10` (defaults to 3000) |
| `MONGODB_URL` | `mongodb://127.0.0.1:27017/kicap` | `index.js:11` |
| `ACCESS_TOKEN` | 64-char hex, generated | `src/utils/index.js:29,39`, `src/middlewares/authMiddleware.js:7,25` |
| `REFRESH_TOKEN` | 64-char hex, generated, different from above | `src/utils/index.js:34,52` |
| `APP_URL` | `http://localhost:5173` | `src/controllers/UserController.js:45,228,280,308` |

Optional — left empty in `.env` with an explanatory comment. The server boots
without them; only the named feature breaks:

| Variable group | Feature it gates |
| --- | --- |
| `MAILER_EMAIL`, `MAILER_PASS` | Registration email verification and password reset (`nodemailer` over Gmail; needs an App Password, not the account password) |
| `FIREBASE_APIKEY`, `FIREBASE_AUTHDOMAIN`, `FIREBASE_DATABASEURL`, `FIREBASE_PROJECTID`, `FIREBASE_STORAGEBUCKET`, `FIREBASE_MESSAGINGSENDERID`, `FIREBASE_APPID`, `FIREBASE_MEASUREMENTID` | Image upload in the admin pages (`ProductRouter`, `ProductImageRouter`, `SliderRouter`) |
| `VNP_TMNCODE`, `VNP_HASHSECRET`, `VNP_URL`, `VNP_RETURNURL` | VNPay online checkout (`CheckoutController`) |

`VNP_URL` and `VNP_RETURNURL` are pre-filled with the sandbox endpoint and
`http://localhost:5173/vnpay_result` respectively, since those are not
merchant-specific.

The two JWT secrets are generated with
`crypto.randomBytes(32).toString('hex')` at file-creation time. The
`.env.example` file carries placeholders, never the real values.

### `client/.env` and `client/.env.example`

One variable:

```
VITE_REACT_APP_API_KEY=http://localhost:3000/api
```

The `/api` suffix is mandatory. `client/src/api/apiConfig.js` sets this as the
axios `baseURL`, and the service layer calls paths like `/category/get-all`,
while `server/src/routes/index.js` mounts every router under `/api/*`.

### Run commands

```bash
cd server && npm install && npm run dev   # nodemon, http://localhost:3000
cd client && yarn && yarn dev             # vite --host --open, http://localhost:5173
```

## Part 2 — Seed Script

### Layout

```
server/scripts/
  seed.js        # orchestration: connect, confirm, wipe, insert, summarise
  seed-data.js   # static sample data, no logic
```

`server/package.json` gains `"seed": "node scripts/seed.js"`.

The data lives in its own module purely because it is bulky; `seed.js` stays
readable. No further abstraction — no per-collection seeder classes, no
factory layer.

### Approach: direct mongoose access

The script connects with mongoose using `MONGODB_URL` and imports the existing
models from `server/src/models/`. It does not drive the REST API.

Rationale:

- No running server required.
- Generated `_id` values are available immediately, which the cross-collection
  references need (`Order.userID`, `Variant.productID`, `ProductImage.productID`,
  `Comment.product_id`).
- There is no endpoint that can create the first admin. `UserService.createUser`
  accepts only `name`, `phone`, `email`, `password`; `isAdmin` defaults to
  `false` and there is no bootstrap path.

`convertToSlug` is reused from `server/src/utils/index.js` so `Product.slug`
matches what the application itself would write. Passwords use
`bcrypt.hashSync(password, 10)`, identical to `UserService.createUser`.

`generateSKU` from the same module is deliberately **not** reused. It returns
`'SKU' + Date.now().toString().slice(-5)`, so consecutive calls inside a seed
loop collide — ~75 products and variants created within the same few
milliseconds would share a handful of SKU values. Neither `Product.sku` nor
`Variant.sku` is declared unique, so this would not throw; it would just
produce misleading sample data. Seed records therefore carry explicit,
distinct SKU strings written into `seed-data.js`.

Importing `src/utils/index.js` is safe: its only module-level side effect is
`nodemailer.createTransport`, which builds an object without opening a
connection, and the Firebase calls are all inside function bodies.

### Insert order

Dependencies dictate the sequence:

1. **Independent:** `Province`, `OrderStatus`, `Shipper`, `Attribute`
2. **Named referents:** `Category`, `Supplier`
3. **`User`** — 1 admin, 4 customers
4. **`Product`** — references category and supplier by name
5. **`Variant`, `ProductImage`** — reference `Product._id`
6. **`Slider`** — `toProduct` holds the route path `/products`
7. **`Order`, `OrderDetail`** — reference `User._id` and product snapshots
8. **`Comment`** — references `Product._id`; afterwards recompute
   `Product.rating` as the mean of its comments' ratings

### Data content

| Collection | Volume | Notes |
| --- | --- | --- |
| `Category` | 6 | Must include verbatim: `Bàn phím cơ`, `Keycap bộ`, `Switch`, `Phụ kiện`. Plus `Kê tay`, `Chuột & Pad`. |
| `Supplier` | 4 | Unique `phone` and `email` (schema enforces both) |
| `Attribute` | 3 | `Màu sắc`, `Loại switch`, `Layout`, with `displayOrder` 1–3 |
| `Product` | ~40 | Spread across all 6 categories. Real brand names (AKKO, Keychron, Leopold, FL Esports, Royal Kludge, Monsgeek, Gateron, Kailh); product names and descriptions written for this project, not copied from any site. Prices in VND: keyboards 790k–4.5M, keycap sets 350k–1.5M, switches 180k–650k, accessories 90k–500k. `salePrice` derived from `price` and `discount`. |
| `Variant` | 30 | Across the 12 products with `hasVariant: true`, 2–3 each; keyed to the seeded attributes |
| `ProductImage` | 3 per product | `displayOrder` 0–2 |
| `Slider` | 4 | `toProduct` is `/products`; see the router-state constraint above |
| `Province` | 34 | Current Vietnamese administrative units; `provinceType` is `Tỉnh` or `Thành phố` |
| `OrderStatus` | 5 | Values 0–4 with Vietnamese descriptions. Value 4 (`Đã hủy`) is seeded defensively even though no seeded order uses it. |
| `Shipper` | 3 | Unique `phone` |
| `User` | 5 | `admin@kicap.local` / `Admin@123` with `isAdmin: true`; four customers with `Khach@123`. All `isVerify: true` so login works without a configured mailer. |
| `Order` | ~18 | Spread over the last 4 months, covering statuses 0/1/2/3, mixing COD and VNPay. Timestamp fields and `isPaid` consistent with status per the table above. Orders at status 2 or 3 carry a `shipper`. |
| `OrderDetail` | 26 total, 1–2 per order | Snapshot of name/image/price at order time; `Order.totalPrice` equals the sum of line totals plus `shippingPrice` |
| `Comment` | ~60 | Ratings 3–5 across a subset of products |

Product and slider images use placeholder URLs of the form
`https://placehold.co/600x600/1a1a1a/white?text=<encoded name>`. No Firebase
configuration is required, and no images are hotlinked from any third-party
store. Viewing images requires an internet connection.

### Re-run safety

The script:

1. Prints the connection host, the database name, and the current document
   count of each of the 14 collections it is about to clear.
2. Waits for the operator to type `y` (via `readline`). The `--yes` flag skips
   the prompt for non-interactive use.
3. Calls `deleteMany({})` on exactly those 14 collections. It never calls
   `dropDatabase`, so other databases on the same `mongod` are untouched.
4. Inserts the full data set and prints a per-collection summary table.
5. Disconnects and exits with code 0 on success, non-zero on failure.

Running it repeatedly produces an equivalent database each time.

## Verification

1. `cd server && npm run seed` — summary table lists a non-zero count for all
   14 collections.
2. `curl 'http://localhost:3000/api/product/get-all?limit=5'` returns 5
   products with `status: "OK"`.
3. `http://localhost:5173` — all four homepage sections
   (Bàn phím cơ, Keycap bộ, Switch, Phụ kiện) render products; the brand and
   price filters on `/products` return results.
4. Log in as `admin@kicap.local` — `/admin/orders` loads without a
   `TypeError` (this is the null-guard constraint above), `/admin/products`
   paginates, `/admin/dashboard` shows non-zero counts. The revenue chart is
   expected to stay empty because of the dead `getRevenue`.
5. Log in as a customer — the order history page lists that customer's seeded
   orders.

## Out of Scope

- Fixing `DashboardService.getRevenue`.
- Adding a null guard to `ShowOrder.jsx:72` or `ProductDetails.jsx:27`. The
  seed data works around both; changing client code is a separate decision.
- Scraping product data or images from any live website.
- Provisioning Firebase, Gmail, or VNPay sandbox credentials. The `.env` files
  carry documented placeholders; filling them in is the operator's task.
- Serving static images from the Express app (`express.static` is not added).
