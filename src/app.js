require("dotenv").config();

const express = require("express");
const cors = require("cors");

const logger = require("./middleware/logger");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Global middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

// Error middleware
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Store API running at http://localhost:${PORT}`);
});
