
const { test } = require("node:test");
const assert = require("node:assert/strict");

const BASE_URL = "http://localhost:3000";

async function request(path) {
  const response = await fetch(`${BASE_URL}${path}`);
  const body = await response.json();

  return { status: response.status, body };
}

test("Health endpoint returns 200", async () => {
  const { status, body } = await request("/health");

  assert.equal(status, 200);
  assert.equal(body.status, "ok");
});

test("Products pagination works", async () => {
  const { status, body } = await request(
    "/products?page=1&limit=5"
  );

  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.length <= 5);
  assert.equal(body.meta.page, 1);
  assert.equal(body.meta.limit, 5);
});

const invalidCases = [
  ["/products?page=0", "page"],
  ["/products?limit=0", "limit"],
  ["/products?limit=100", "limit"],
  ["/products?minPrice=-100", "minPrice"],
  ["/products?sort=unknown", "sort"],
  ["/products?order=invalid", "order"],
];

for (const [path, field] of invalidCases) {
  test(`Invalid ${field}: ${path}`, async () => {
    const { status, body } = await request(path);

    assert.equal(status, 400);
    assert.equal(body.field, field);
  });
}

test("Unknown endpoint returns 404", async () => {
  const { status } = await request("/unknown-endpoint");

  assert.equal(status, 404);
});


test("Categories endpoint returns a list", async () => {
  const { status, body } = await request("/categories");

  assert.equal(status, 200);
  assert.ok(Array.isArray(body));
});

test("Brands endpoint returns a list", async () => {
  const { status, body } = await request("/brands");

  assert.equal(status, 200);
  assert.ok(Array.isArray(body));
});

test("Unknown category returns 404", async () => {
  const { status } = await request("/categories/999999");

  assert.equal(status, 404);
});

test("Unknown brand returns 404", async () => {
  const { status } = await request("/brands/999999");

  assert.equal(status, 404);
});


test("Products are sorted by price descending", async () => {
  const { status, body } = await request(
    "/products?sort=price&order=desc&limit=10"
  );

  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data));

  for (let i = 1; i < body.data.length; i++) {
    assert.ok(body.data[i - 1].price >= body.data[i].price);
  }
});

test("Products can be filtered by category", async () => {
  const { status, body } = await request(
    "/products?categoryId=1&limit=50"
  );

  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.every((product) => product.categoryId === 1));
});

test("Products can be filtered without brand", async () => {
  const { status, body } = await request(
    "/products?hasBrand=false&limit=50"
  );

  assert.equal(status, 200);
  assert.ok(Array.isArray(body.data));
  assert.ok(body.data.every((product) => product.brandId === null));
});

test("Unknown product returns 404", async () => {
  const { status } = await request("/products/999999");

  assert.equal(status, 404);
});


test("Reviews endpoint returns a list", async () => {
  const { status, body } = await request("/reviews");

  assert.equal(status, 200);
  assert.ok(Array.isArray(body));
});

test("Unknown review returns 404", async () => {
  const { status } = await request("/reviews/999999");

  assert.equal(status, 404);
});

test("Product reviews endpoint returns a list", async () => {
  const { status, body } = await request("/products/1/reviews");

  assert.equal(status, 200);
  assert.ok(Array.isArray(body));
});

test("Invalid review ID returns 400", async () => {
  const { status } = await request("/reviews/abc");

  assert.equal(status, 400);
});


test("Category products endpoint returns a list", async () => {
  const { status, body } = await request(
    "/categories/1/products"
  );

  assert.equal(status, 200);
  assert.ok(Array.isArray(body));
  assert.ok(body.every((product) => product.categoryId === 1));
});

test("Brand products endpoint returns a list", async () => {
  const { status, body } = await request(
    "/brands/1/products"
  );

  assert.equal(status, 200);
  assert.ok(Array.isArray(body));
  assert.ok(body.every((product) => product.brandId === 1));
});

test("Unknown category products returns 404", async () => {
  const { status } = await request(
    "/categories/999999/products"
  );

  assert.equal(status, 404);
});

test("Unknown brand products returns 404", async () => {
  const { status } = await request(
    "/brands/999999/products"
  );

  assert.equal(status, 404);
});

test("Limit 50 is accepted", async () => {
  const { status, body } = await request("/products?limit=50");

  assert.equal(status, 200);
  assert.equal(body.meta.limit, 50);
});