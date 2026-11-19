const prisma = require("../db");

function parseId(value) {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function validateReview(body, partial = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { message: "Invalid request body" };
  }

  const allowed = [
    "productId",
    "authorName",
    "rating",
    "comment",
  ];

  const keys = Object.keys(body);

  if (keys.length === 0) {
    return { message: "Request body cannot be empty" };
  }

  for (const key of keys) {
    if (!allowed.includes(key)) {
      return {
        message: `Unknown or read-only field: ${key}`,
        field: key,
      };
    }
  }

  if (!partial || "productId" in body) {
    if (!Number.isSafeInteger(body.productId) || body.productId <= 0) {
      return { message: "Invalid productId", field: "productId" };
    }
  }

  if (!partial || "authorName" in body) {
    if (
      typeof body.authorName !== "string" ||
      !body.authorName.trim()
    ) {
      return {
        message: "authorName is required",
        field: "authorName",
      };
    }
  }

  if (!partial || "rating" in body) {
    if (
      !Number.isInteger(body.rating) ||
      body.rating < 1 ||
      body.rating > 5
    ) {
      return {
        message: "Rating must be an integer from 1 to 5",
        field: "rating",
      };
    }
  }

  if (
    "comment" in body &&
    body.comment !== null &&
    typeof body.comment !== "string"
  ) {
    return {
      message: "Invalid comment",
      field: "comment",
    };
  }

  return null;
}

// GET /reviews
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { id: "asc" },
      include: {
        product: true,
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

// GET /reviews/:id
exports.getReviewById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        message: "Invalid review ID",
        field: "id",
      });
    }

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        product: true,
      },
    });

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

// POST /reviews
exports.createReview = async (req, res, next) => {
  try {
    const error = validateReview(req.body);

    if (error) {
      return res.status(400).json(error);
    }

    const product = await prisma.product.findUnique({
      where: { id: req.body.productId },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        field: "productId",
      });
    }

    const authorName = req.body.authorName.trim();

    const existing = await prisma.review.findUnique({
      where: {
        productId_authorName: {
          productId: req.body.productId,
          authorName,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        message: "This author already reviewed this product",
        field: "authorName",
      });
    }

    const review = await prisma.review.create({
      data: {
        productId: req.body.productId,
        authorName,
        rating: req.body.rating,
        comment: req.body.comment ?? null,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

// PATCH /reviews/:id
exports.updateReview = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        message: "Invalid review ID",
        field: "id",
      });
    }

    const error = validateReview(req.body, true);

    if (error) {
      return res.status(400).json(error);
    }

    const existing = await prisma.review.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    const data = { ...req.body };

    if ("authorName" in data) {
      data.authorName = data.authorName.trim();
    }

    if ("productId" in data) {
      const product = await prisma.product.findUnique({
        where: { id: data.productId },
      });

      if (!product) {
        return res.status(404).json({
          message: "Product not found",
          field: "productId",
        });
      }
    }

    const targetProductId = data.productId ?? existing.productId;
    const targetAuthorName = data.authorName ?? existing.authorName;

    const duplicate = await prisma.review.findUnique({
      where: {
        productId_authorName: {
          productId: targetProductId,
          authorName: targetAuthorName,
        },
      },
    });

    if (duplicate && duplicate.id !== id) {
      return res.status(409).json({
        message: "This author already reviewed this product",
        field: "authorName",
      });
    }

    const review = await prisma.review.update({
      where: { id },
      data,
    });

    res.status(200).json(review);
  } catch (error) {
    next(error);
  }
};

// DELETE /reviews/:id
exports.deleteReview = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        message: "Invalid review ID",
        field: "id",
      });
    }

    const existing = await prisma.review.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    await prisma.review.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// GET /products/:id/reviews
exports.getProductReviews = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        message: "Invalid product ID",
        field: "id",
      });
    }

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const reviews = await prisma.review.findMany({
      where: { productId: id },
      orderBy: { id: "asc" },
    });

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};