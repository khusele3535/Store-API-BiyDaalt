
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
  ["/products?limit=101", "limit"],
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
