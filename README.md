# Kicap API

REST API for the Kicap store — a mechanical keyboard shop with a public storefront and an admin back office. Express 4 + MongoDB (mongoose 7), ESM throughout.

The React client lives in a separate repository and expects this API at `/api`.

## Requirements

- **Node.js 22 or newer** — `index.js` uses top-level `await`, and `npm test` uses the built-in `node --test` runner.
- **MongoDB** reachable over a connection string. A local `mongod` on `127.0.0.1:27017` is the default assumption.

Optional, only for the features that need them: a Firebase project (image upload), a Gmail account with an App Password (transactional email), and a VNPay sandbox merchant (online payment).

## Setup

```bash
npm install
cp .env.example .env
```

Then fill in `.env`. Generate the two JWT secrets with:

```bash
node -e "const c=require('node:crypto');console.log(c.randomBytes(32).toString('hex'))"
```

Run it twice — `ACCESS_TOKEN` and `REFRESH_TOKEN` must differ.

### Environment variables

**Required.** The process exits or authentication breaks without these.

| Variable | Purpose |
| --- | --- |
| `MONGODB_URL` | Mongo connection string. The server fails to start without it. |
| `PORT` | HTTP port. Defaults to `3000`. |
| `ACCESS_TOKEN` | Secret for signing access tokens (2 day expiry). |
| `REFRESH_TOKEN` | Secret for signing refresh tokens (7 day expiry). |
| `APP_URL` | Public origin of the frontend. Used to build email verification and password reset links, so a wrong value silently produces dead links. |

**Optional.** The server boots without them; only the named feature fails.

| Variable | Feature |
| --- | --- |
| `MAILER_EMAIL`, `MAILER_PASS` | Registration verification and password reset, over Gmail SMTP. `MAILER_PASS` must be an App Password, not the account password. |
| `FIREBASE_APIKEY`, `FIREBASE_AUTHDOMAIN`, `FIREBASE_DATABASEURL`, `FIREBASE_PROJECTID`, `FIREBASE_STORAGEBUCKET`, `FIREBASE_MESSAGINGSENDERID`, `FIREBASE_APPID`, `FIREBASE_MEASUREMENTID` | Image upload for products, product galleries and sliders. Uploads go to Firebase Storage; the database stores the resulting URL. |
| `VNP_TMNCODE`, `VNP_HASHSECRET`, `VNP_URL`, `VNP_RETURNURL` | VNPay checkout. `VNP_URL` and `VNP_RETURNURL` have sensible sandbox defaults in `.env.example`; the other two are merchant-specific. |

`.env` is gitignored. Keep `.env.example` in sync whenever a new variable is introduced.

## Running

```bash
npm run dev     # nodemon, restarts on change
npm start       # plain node
```

On success the process logs `Server running at http://localhost:3000`. A quick health check:

```bash
curl http://localhost:3000/
# {"name":"Hi LofA"}
```

## Seeding the database

`scripts/seed.js` fills all 14 collections with a real catalogue taken from the kicap.vn storefront — 81 products with their real names, prices, brands, variants and images — plus users, orders, order details and product reviews.

```bash
npm run seed            # prints what it will delete, then asks for confirmation
npm run seed -- --yes   # skips the prompt (CI, repeated local runs)
```

Before touching anything it prints the target host, the database name, and the current document count of every collection it is about to clear, then waits for you to type `y`. It calls `deleteMany` on exactly those 14 collections and never `dropDatabase`, so other databases on the same server are untouched. Re-running produces an equivalent database each time.

Expected result:

| Collection | Count | | Collection | Count |
| --- | --- | --- | --- | --- |
| Province | 34 | | Product | 81 |
| OrderStatus | 5 | | Variant | 273 |
| Shipper | 3 | | ProductImage | 242 |
| Attribute | 11 | | Slider | 4 |
| Category | 6 | | Order | 18 |
| Supplier | 4 | | OrderDetail | 22 |
| User | 5 | | Comment | 81 |

### Refreshing the catalogue

```bash
npm run fetch:kicap
```

Downloads `https://kicap.vn/collections/all/products.json` into `scripts/kicap-catalog.json`, which is committed to the repo. `npm run seed` reads only that file, so seeding works offline and produces the same database every time. Re-run the fetch when the catalogue should be refreshed; the counts above will shift with it.

### Seeded accounts

| Email | Password | Role |
| --- | --- | --- |
| `admin@kicap.local` | `Admin@123` | Admin |
| `khach1@kicap.local` … `khach4@kicap.local` | `Khach@123` | Customer |

All seeded accounts have `isVerify: true`, so they can log in without a configured mailer.

### Sample data notes

- Product, category and slider images are the storefront's own `bizweb.dktcdn.net` URLs, hotlinked rather than copied. `Product.image` is a plain string, so they sit alongside the Firebase download URLs the admin upload form writes — seeding still needs no Firebase credentials, only an internet connection to render.
- Products are picked per category by quota, preferring items that are in stock, have a full gallery and have real variants. Artisan keycaps, monitors and headphones are filtered out; the six seeded categories are the ones the client expects.
- Prices, discounts, SKUs, brands, descriptions and variants are the storefront's real values. **Stock is not**: only a quarter of the live catalogue is in stock, so anything at zero gets a deterministic 5–30 instead.
- Suppliers, users, orders and reviews are written for this project — kicap.vn publishes none of them. Orders and reviews are generated from a fixed-seed PRNG, so two seeds of the same snapshot produce identical data.
- Orders are spread over the last four months and cover every stage of the order flow. `createdAt` is set explicitly rather than left to `timestamps: true`, otherwise the admin date-range filter would see every order as created today.
- `Product.rating` is recomputed from the seeded comments at the end of the run.

`scripts/seed-data.js` derives everything from the snapshot and touches no database, so `scripts/seed-data.test.js` can assert against it without a running Mongo.

## Tests

```bash
npm test
```

Runs `node --test`. The suite covers the referential invariants the client silently depends on: category names, order-status coverage, unique keys the schemas declare, variant-to-product wiring, and price arithmetic. It needs no database and no running server.

## Project structure

```
index.js              Entry point: dotenv, mongoose.connect, middleware, routes
vercel.json           Serverless deployment config
scripts/
  fetch-kicap.js      Downloads the kicap.vn catalogue into kicap-catalog.json
  kicap-catalog.json  Committed catalogue snapshot (437 products)
  seed.js             Seed orchestration
  seed-data.js        Seed data derived from the snapshot
  seed-data.test.js   Invariant tests over seed-data.js
src/
  routes/             Express routers, one per resource; index.js mounts them under /api
  controllers/        Request/response handling, input validation
  services/           Business logic and database access
  models/             Mongoose schemas (14)
  middlewares/        Auth and param validation
  configs/            Firebase config assembled from env
  utils/              JWT helpers, slug/SKU generation, Firebase upload, mailer
  variable.js         Shared Vietnamese error payloads
```

Requests flow `router → middleware → controller → service → model`. Services resolve a `{ status, message, data }` envelope; controllers put it on the wire.

## Authentication

Sign in at `POST /api/user/sign-in`. Protected routes read the token from the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

Two middlewares guard the routes:

- `authMiddleWare` — **admin only**. Rejects a valid token whose payload lacks `isAdmin` with `403`. An expired token returns `401` so the client knows to refresh.
- `authUserMiddleWare` — **owner or admin**. Allows the request when the token's `id` matches the `:id` route param, or when the caller is an admin.

Access tokens last 2 days, refresh tokens 7. Exchange an expired one at `POST /api/user/refresh-token`.

## API reference

All routes are mounted under `/api`. `:id` params are validated as Mongo ObjectIds where marked.

### Users — `/api/user`

| Method | Path | Notes |
| --- | --- | --- |
| POST | `/sign-up` | |
| POST | `/sign-in` | Returns access and refresh tokens |
| POST | `/sign-out` | |
| POST | `/refresh-token` | |
| GET | `/get-all` | Admin |
| GET | `/:id` | Owner or admin |
| PUT | `/update/:id` | Owner or admin |
| DELETE | `/delete/:id` | Admin |
| POST | `/send-verify-email`, `/verify-email` | Requires mailer config |
| POST | `/get-password`, `/new-password-check`, `/reset-password` | Password reset flow |

### Products — `/api/product`

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/get-all` | Supports `page`, `limit`, `search`, `category` |
| GET | `/get-all-filter` | Faceted filtering: category, brand, price band, stock |
| GET | `/get-menu` | Category groups for the navigation menu |
| GET | `/get-brand` | Distinct brand list, derived from products |
| GET | `/:id` | |
| POST | `/create` | Admin, multipart, uploads to Firebase |
| PUT | `/update/:id` | Admin, multipart |
| DELETE | `/delete/:id` | Admin |
| POST | `/check-quantity` | Stock check before checkout |

### Catalogue resources

`/api/category`, `/api/supplier`, `/api/attribute`, `/api/shipper`, `/api/product-variant` each expose the same shape:

| Method | Path |
| --- | --- |
| GET | `/get-all` |
| GET | `/:id` |
| POST | `/create` |
| PUT | `/update/:id` |
| DELETE | `/delete/:id` |

`/api/province` and `/api/order-status` are read-mostly: `POST /create`, `GET /get-all`, `GET /:id`, plus `PUT /update/:id` on order statuses.

### Product images — `/api/product-image`

`GET /get-all`, `GET /max-order`, `GET /:id`, `POST /create`, `PUT /update/:id`, `DELETE /delete/:id`. Create and update are multipart.

### Sliders — `/api/slider`

`GET /get-all`, `GET /:id`, `POST /create`, `PUT /update/:id`, `DELETE /delete/:id`. Create and update are multipart.

### Orders — `/api/order`

`POST /create`, `GET /get-all` (admin, filterable by status and date range), `GET /get-all/:id` (one customer's orders), `GET /:id`, `PUT /update/:id`, `DELETE /delete/:id`.

Order details live at `/api/order-detail`: `GET /details-of-order`, `PUT /update/:id`, `DELETE /delete/:id`.

### Checkout — `/api/checkout`

`POST /create_payment_url` builds a signed VNPay redirect.

`GET /vnpay_ipn` receives the payment notification. VNPay calls it server-to-server over GET and expects a `{ RspCode, Message }` reply; anything else makes it retry. Configure the URL in the sandbox merchant portal — it must be publicly reachable, so VNPay cannot call it while the server runs on localhost.

`POST /vnpay_return` is the browser-facing counterpart. VNPay redirects the customer to `VNP_RETURNURL`, and the client posts those query parameters here. It verifies the signature before reporting the outcome as `{ code, message }`, and applies the same order update as the IPN so local development works without a public URL. Both endpoints are safe to call more than once for the same order.

### Inventory and dashboard

`GET /api/inventory/get-all`, `GET /api/inventory/:id`, `GET /api/dashboard/get-count`, `GET /api/dashboard/get-revenue`.

## Data model

Fourteen collections. Products join to categories and suppliers **by name**, not by ObjectId:

- `Product.category` must equal a `Category.categoryName`
- `Product.supplier` must equal a `Supplier.name`
- `Product.brand` is a free string; the brand facet is derived by scanning products

True references, by ObjectId: `Variant.productID`, `ProductImage.productID`, `Comment.product_id`, `Order.userID`. `OrderDetail` links to its order by the `orderID` **string** (a UUID v4), not by ObjectId, and snapshots the product name, image and price at purchase time.

`Product.price` is the original price; `Product.salePrice` is what the customer actually pays. The storefront shows `price` struck through whenever `discount > 0`.

Order status is an integer: `0` awaiting approval → `1` approved → `2` shipping → `3` completed. `4` is reserved for cancelled. Moving to `1` stamps `acceptTime`; moving to `3` stamps `shippedTime` and `finishedTime` and flips `isPaid`.

## Constraints worth knowing before changing data

These are undocumented couplings in the client. Breaking one produces an empty page or a crash rather than an error message.

- **Four category names are hardcoded in the storefront homepage**: `Bàn phím cơ`, `Keycap bộ`, `Switch`, `Phụ kiện`. Renaming a category in the database empties the matching homepage section.
- **Every `Order.status` value must have a matching `OrderStatus` document.** The admin order list looks up the description without a null check, so an uncovered status throws and takes down the page.
- **Sliders must not link to a product detail URL.** The product detail page reads its id from React Router state, which a plain link does not carry. Seeded sliders point at `/products`.

## Known issues

- `DashboardService.getRevenue` is incomplete — it builds a query it never uses and resolves without a `data` field, so `GET /api/dashboard/get-revenue` returns no figures and the admin revenue chart stays empty.
- `generateSKU` in `src/utils/index.js` derives the SKU from the last five digits of `Date.now()`, so calls within the same few milliseconds collide. `ProductService.createProduct` works around this by retrying until the SKU is free; the seed script sidesteps it with explicit SKUs.
- Neither `Product.sku` nor `Variant.sku` is declared unique in the schema, so duplicates are stored silently.

## Troubleshooting

**The client renders a blank white page.** Check the browser console for `SyntaxError: ... is not valid JSON` from `getToken`. The client stores its tokens in `localStorage`, which is scoped per origin — and `http://localhost:5173` is Vite's default port, shared with every other project you have run there. A leftover token written in a different format by another app makes `JSON.parse` throw before the first render. Clear `accessToken` and `refreshToken` for that origin, or give this project its own port in the client's `vite.config.js`.

**`Thiếu MONGODB_URL`.** The `.env` file is missing, is not in the server root, or the variable is empty.

**Login returns `Mật khẩu không đúng` for a seeded account.** The `users` collection was written by something other than `npm run seed`. Re-seed — passwords must be bcrypt hashes at cost 10.

**Image upload fails while everything else works.** The `FIREBASE_*` variables are empty or incomplete. Seeding does not need them; the admin upload forms do.

## Deployment

`vercel.json` routes every request to `index.js` on the `@vercel/node` runtime. Set the same environment variables in the Vercel project settings, and point `APP_URL` at the deployed frontend so email links resolve.
