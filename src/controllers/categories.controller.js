const prisma = require("../db");

function parseId(value) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

// GET /categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: "asc" },
    });

    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};

// GET /categories/:id
exports.getCategoryById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid category ID",
        field: "id",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

// POST /categories
exports.createCategory = async (req, res, next) => {
  try {
    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).some((key) => key !== "name") ||
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return res.status(400).json({
        message: "Valid category name is required",
        field: "name",
      });
    }

    const category = await prisma.category.create({
      data: { name: body.name.trim() },
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
};

// PATCH /categories/:id
exports.updateCategory = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid category ID",
        field: "id",
      });
    }

    const body = req.body;

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body) ||
      Object.keys(body).length !== 1 ||
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return res.status(400).json({
        message: "Valid category name is required",
        field: "name",
      });
    }

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { name: body.name.trim() },
    });

    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
};

// DELETE /categories/:id
exports.deleteCategory = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid category ID",
        field: "id",
      });
    }

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const productCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return res.status(409).json({
        message: "Cannot delete category with products",
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// GET /categories/:id/products
exports.getCategoryProducts = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid category ID",
        field: "id",
      });
    }

    const category = await prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const products = await prisma.product.findMany({
      where: { categoryId: id },
      orderBy: { id: "asc" },
    });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};