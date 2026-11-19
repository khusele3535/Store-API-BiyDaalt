const prisma = require("../db");

// ========================================
// HELPERS
// ========================================

function parsePositiveInt(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number > 0
    ? number
    : null;
}

function parseNonNegativeInt(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);

  return Number.isSafeInteger(number) && number >= 0
    ? number
    : null;
}

function validateProduct(body, partial = false) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return {
      message: "Invalid request body",
    };
  }

  const allowedFields = [
    "title",
    "price",
    "stock",
    "description",
    "isAvailable",
    "categoryId",
    "brandId",
  ];

  const keys = Object.keys(body);

  if (keys.length === 0) {
    return {
      message: "Request body cannot be empty",
    };
  }

  for (const key of keys) {
    if (!allowedFields.includes(key)) {
      return {
        message: `Unknown or read-only field: ${key}`,
        field: key,
      };
    }
  }

  // Title
  if (!partial || "title" in body) {
    if (
      typeof body.title !== "string" ||
      !body.title.trim()
    ) {
      return {
        message: "Title is required",
        field: "title",
      };
    }
  }

  // Price
  if (!partial || "price" in body) {
    if (
      !Number.isSafeInteger(body.price) ||
      body.price < 0
    ) {
      return {
        message: "Price must be a non-negative integer",
        field: "price",
      };
    }
  }

  // Stock
  if (!partial || "stock" in body) {
    if (
      !Number.isSafeInteger(body.stock) ||
      body.stock < 0
    ) {
      return {
        message: "Stock must be a non-negative integer",
        field: "stock",
      };
    }
  }

  // Description
  if (
    "description" in body &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    return {
      message: "Invalid description",
      field: "description",
    };
  }

  // Availability
  if (
    "isAvailable" in body &&
    typeof body.isAvailable !== "boolean"
  ) {
    return {
      message: "isAvailable must be boolean",
      field: "isAvailable",
    };
  }

  // Category
  if (!partial || "categoryId" in body) {
    if (
      !Number.isSafeInteger(body.categoryId) ||
      body.categoryId <= 0
    ) {
      return {
        message: "Invalid categoryId",
        field: "categoryId",
      };
    }
  }

  // Brand
  if (
    "brandId" in body &&
    body.brandId !== null &&
    (
      !Number.isSafeInteger(body.brandId) ||
      body.brandId <= 0
    )
  ) {
    return {
      message: "Invalid brandId",
      field: "brandId",
    };
  }

  return null;
}

async function checkRelations(body) {
  if ("categoryId" in body) {
    const category = await prisma.category.findUnique({
      where: {
        id: body.categoryId,
      },
    });

    if (!category) {
      return {
        message: "Category not found",
        field: "categoryId",
      };
    }
  }

  if ("brandId" in body && body.brandId !== null) {
    const brand = await prisma.brand.findUnique({
      where: {
        id: body.brandId,
      },
    });

    if (!brand) {
      return {
        message: "Brand not found",
        field: "brandId",
      };
    }
  }

  return null;
}

// ========================================
// GET /products
// Search + Filter + Sort + Pagination
// ========================================

exports.getProducts = async (req, res, next) => {
  try {
    const query = req.query;

    const allowed = [
      "q",
      "categoryId",
      "brandId",
      "hasBrand",
      "minPrice",
      "maxPrice",
      "isAvailable",
      "sort",
      "order",
      "page",
      "limit",
    ];

    for (const key of Object.keys(query)) {
      if (!allowed.includes(key)) {
        return res.status(400).json({
          message: `Unknown query parameter: ${key}`,
          field: key,
        });
      }

      if (typeof query[key] !== "string") {
        return res.status(400).json({
          message: `Invalid query parameter: ${key}`,
          field: key,
        });
      }
    }

    const where = {};

    // Search
    if (query.q !== undefined) {
      if (!query.q.trim()) {
        return res.status(400).json({
          message: "Search query cannot be empty",
          field: "q",
        });
      }

      where.OR = [
        {
          title: {
            contains: query.q.trim(),
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: query.q.trim(),
            mode: "insensitive",
          },
        },
      ];
    }

    // Category and Brand filters
    for (const field of ["categoryId", "brandId"]) {
      if (query[field] !== undefined) {
        const id = parsePositiveInt(query[field]);

        if (id === null) {
          return res.status(400).json({
            message: `Invalid ${field}`,
            field,
          });
        }

        where[field] = id;
      }
    }

    // Price filters
    for (const field of ["minPrice", "maxPrice"]) {
      if (query[field] !== undefined) {
        const price = parseNonNegativeInt(query[field]);

        if (price === null) {
          return res.status(400).json({
            message: `Invalid ${field}`,
            field,
          });
        }

        where.price ??= {};

        where.price[
          field === "minPrice" ? "gte" : "lte"
        ] = price;
      }
    }

    if (
      query.minPrice !== undefined &&
      query.maxPrice !== undefined &&
      Number(query.minPrice) > Number(query.maxPrice)
    ) {
      return res.status(400).json({
        message: "minPrice cannot exceed maxPrice",
        field: "minPrice",
      });
    }

    // Boolean filters
    for (const field of ["hasBrand", "isAvailable"]) {
      if (query[field] !== undefined) {
        if (!["true", "false"].includes(query[field])) {
          return res.status(400).json({
            message: `Invalid ${field}`,
            field,
          });
        }

        const value = query[field] === "true";

        if (field === "hasBrand") {
          where.brandId = value ? { not: null } : null;
        } else {
          where.isAvailable = value;
        }
      }
    }

    if (
      query.hasBrand === "false" &&
      query.brandId !== undefined
    ) {
      return res.status(400).json({
        message: "brandId conflicts with hasBrand=false",
        field: "hasBrand",
      });
    }

    // Sorting
    const allowedSort = [
      "id",
      "title",
      "price",
      "stock",
      "createdAt",
    ];

    const sort = query.sort ?? "id";
    const order = query.order ?? "asc";

    if (!allowedSort.includes(sort)) {
      return res.status(400).json({
        message: "Invalid sort field",
        field: "sort",
      });
    }

    if (!["asc", "desc"].includes(order)) {
      return res.status(400).json({
        message: "Invalid sort order",
        field: "order",
      });
    }

    // Pagination
    const page =
      query.page === undefined
        ? 1
        : parsePositiveInt(query.page);

    const limit =
      query.limit === undefined
        ? 10
        : parsePositiveInt(query.limit);

    if (page === null) {
      return res.status(400).json({
        message: "Invalid page",
        field: "page",
      });
    }

    if (limit === null || limit > 100) {
      return res.status(400).json({
        message: "Limit must be between 1 and 100",
        field: "limit",
      });
    }

    if (!Number.isSafeInteger((page - 1) * limit)) {
      return res.status(400).json({
        message: "Page is too large",
        field: "page",
      });
    }

    const [total, products] = await prisma.$transaction([
      prisma.product.count({
        where,
      }),
      prisma.product.findMany({
        where,
        orderBy: [
          { [sort]: order },
          ...(sort === "id" ? [] : [{ id: "asc" }]),
        ],
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: true,
          brand: true,
        },
      }),
    ]);

    res.status(200).json({
      data: products,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// GET /products/:id
// ========================================

exports.getProductById = async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);

    if (id === null) {
      return res.status(400).json({
        message: "Invalid product ID",
        field: "id",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        reviews: true,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// ========================================
// POST /products
// ========================================

exports.createProduct = async (req, res, next) => {
  try {
    const error = validateProduct(req.body);

    if (error) {
      return res.status(400).json(error);
    }

    const relationError = await checkRelations(req.body);

    if (relationError) {
      return res.status(404).json(relationError);
    }

    const data = {
      title: req.body.title.trim(),
      price: req.body.price,
      stock: req.body.stock,
      categoryId: req.body.categoryId,
    };

    for (const field of [
      "description",
      "isAvailable",
      "brandId",
    ]) {
      if (field in req.body) {
        data[field] = req.body[field];
      }
    }

    const product = await prisma.product.create({
      data,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// ========================================
// PATCH /products/:id
// ========================================

exports.updateProduct = async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);

    if (id === null) {
      return res.status(400).json({
        message: "Invalid product ID",
        field: "id",
      });
    }

    const error = validateProduct(req.body, true);

    if (error) {
      return res.status(400).json(error);
    }

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const relationError = await checkRelations(req.body);

    if (relationError) {
      return res.status(404).json(relationError);
    }

    const data = { ...req.body };

    if ("title" in data) {
      data.title = data.title.trim();
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

// ========================================
// DELETE /products/:id
// ========================================

exports.deleteProduct = async (req, res, next) => {
  try {
    const id = parsePositiveInt(req.params.id);

    if (id === null) {
      return res.status(400).json({
        message: "Invalid product ID",
        field: "id",
      });
    }

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};