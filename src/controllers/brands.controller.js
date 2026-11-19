const prisma = require("../db");

function parseId(value) {
  const id = Number(value);

  return /^\d+$/.test(value) &&
    Number.isSafeInteger(id) &&
    id > 0
    ? id
    : null;
}

function validateBrand(body, partial = false) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    return { message: "Invalid request body" };
  }

  const keys = Object.keys(body);
  const allowed = ["name", "foundedYear"];

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

  if (!partial || "name" in body) {
    if (
      typeof body.name !== "string" ||
      !body.name.trim()
    ) {
      return {
        message: "Brand name is required",
        field: "name",
      };
    }
  }

  if (
    "foundedYear" in body &&
    body.foundedYear !== null &&
    (
      !Number.isInteger(body.foundedYear) ||
      body.foundedYear < 1800 ||
      body.foundedYear > new Date().getFullYear()
    )
  ) {
    return {
      message: "Invalid foundedYear",
      field: "foundedYear",
    };
  }

  return null;
}

// GET /brands
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { id: "asc" },
    });

    res.status(200).json(brands);
  } catch (error) {
    next(error);
  }
};

// GET /brands/:id
exports.getBrandById = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid brand ID",
        field: "id",
      });
    }

    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    res.status(200).json(brand);
  } catch (error) {
    next(error);
  }
};

// POST /brands
exports.createBrand = async (req, res, next) => {
  try {
    const error = validateBrand(req.body);

    if (error) {
      return res.status(400).json(error);
    }

    const brand = await prisma.brand.create({
      data: {
        name: req.body.name.trim(),
        foundedYear: req.body.foundedYear ?? null,
      },
    });

    res.status(201).json(brand);
  } catch (error) {
    next(error);
  }
};

// PATCH /brands/:id
exports.updateBrand = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid brand ID",
        field: "id",
      });
    }

    const error = validateBrand(req.body, true);

    if (error) {
      return res.status(400).json(error);
    }

    const existing = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    const data = {};

    if ("name" in req.body) {
      data.name = req.body.name.trim();
    }

    if ("foundedYear" in req.body) {
      data.foundedYear = req.body.foundedYear;
    }

    const brand = await prisma.brand.update({
      where: { id },
      data,
    });

    res.status(200).json(brand);
  } catch (error) {
    next(error);
  }
};

// DELETE /brands/:id
exports.deleteBrand = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid brand ID",
        field: "id",
      });
    }

    const existing = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    await prisma.brand.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// GET /brands/:id/products
exports.getBrandProducts = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "Invalid brand ID",
        field: "id",
      });
    }

    const brand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!brand) {
      return res.status(404).json({
        message: "Brand not found",
      });
    }

    const products = await prisma.product.findMany({
      where: { brandId: id },
      orderBy: { id: "asc" },
    });

    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};