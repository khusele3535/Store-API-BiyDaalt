
const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const YAML = require("yamljs");

const document = YAML.load(
  path.join(__dirname, "../openapi.yaml")
);

const expectedPaths = {
  "/categories": ["get", "post"],
  "/categories/{id}": ["get", "patch", "delete"],
  "/categories/{id}/products": ["get"],
  "/brands": ["get", "post"],
  "/brands/{id}": ["get", "patch", "delete"],
  "/brands/{id}/products": ["get"],
  "/products": ["get", "post"],
  "/products/{id}": ["get", "patch", "delete"],
  "/products/{id}/reviews": ["get"],
  "/reviews": ["get", "post"],
  "/reviews/{id}": ["get", "patch", "delete"],
};

test("OpenAPI document has a valid version", () => {
  assert.ok(document.openapi.startsWith("3."));
});

test("Swagger documents all 23 API operations", () => {
  let count = 0;

  for (const [route, methods] of Object.entries(expectedPaths)) {
    assert.ok(document.paths[route], `Missing path: ${route}`);

    for (const method of methods) {
      assert.ok(
        document.paths[route][method],
        `Missing operation: ${method.toUpperCase()} ${route}`
      );
      count++;
    }
  }

  assert.equal(count, 23);
});

test("Swagger defines reusable parameters", () => {
  for (const name of ["Id", "Page", "Limit"]) {
    assert.ok(document.components.parameters[name]);
  }
});

test("Swagger defines reusable error responses", () => {
  for (const name of [
    "BadRequest",
    "NotFound",
    "Conflict",
    "ServerError",
  ]) {
    assert.ok(document.components.responses[name]);
  }
});

test("Swagger defines required schemas", () => {
  const schemas = [
    "Error",
    "Category",
    "Brand",
    "Product",
    "Review",
    "ProductDetail",
    "PaginatedProducts",
  ];

  for (const name of schemas) {
    assert.ok(document.components.schemas[name]);
  }
});

test("All operations have response definitions", () => {
  for (const [route, methods] of Object.entries(expectedPaths)) {
    for (const method of methods) {
      const operation = document.paths[route][method];

      assert.ok(
        operation.responses,
        `Missing responses: ${method.toUpperCase()} ${route}`
      );
    }
  }
});
