const { Prisma } = require("@prisma/client");

function errorHandler(err, req, res, next) {
  console.error("API Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  // Invalid JSON
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON request body",
    });
  }

  // Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return res.status(409).json({
          message: "Duplicate value violates a unique constraint",
        });

      case "P2003":
        return res.status(409).json({
          message: "Cannot perform operation due to related records",
        });

      case "P2025":
        return res.status(404).json({
          message: "Record not found",
        });

      default:
        return res.status(500).json({
          message: "Database operation failed",
        });
    }
  }

  // Custom application errors
  if (
    Number.isInteger(err.status) &&
    err.status >= 400 &&
    err.status < 500
  ) {
    return res.status(err.status).json({
      message: err.message || "Request failed",
      ...(err.field ? { field: err.field } : {}),
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
}

module.exports = errorHandler;