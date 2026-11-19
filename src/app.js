require("dotenv").config();

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const path = require("path");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const categoriesRoutes = require("./routes/categories.routes");
const brandsRoutes = require("./routes/brands.routes");
const productsRoutes = require("./routes/products.routes");
const reviewsRoutes = require("./routes/reviews.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Swagger documentation
const swaggerDocument = YAML.load(
  path.join(__dirname, "../openapi.yaml")
);

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// Health check
app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
  });
});

// API routes
app.use("/categories", categoriesRoutes);
app.use("/brands", brandsRoutes);
app.use("/products", productsRoutes);
app.use("/reviews", reviewsRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Store API running at http://localhost:${PORT}`);
  console.log(`Swagger UI: http://localhost:${PORT}/docs`);
});