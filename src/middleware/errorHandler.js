function errorHandler(err, req, res, next) {
  console.error(err);

  const status =
    Number.isInteger(err.status) &&
    err.status >= 400 &&
    err.status <= 599
      ? err.status
      : 500;

  res.status(status).json({
    message:
      status === 500
        ? "Internal server error"
        : err.message || "Request failed"
  });
}

module.exports = errorHandler;