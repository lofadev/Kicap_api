import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  attributes,
  categories,
  comments,
  orderStatuses,
  orders,
  placeholderImage,
  products,
  provinces,
  shippers,
  sliders,
  suppliers,
  users,
  variants,
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
