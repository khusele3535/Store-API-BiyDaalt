function logger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const duration =
      Number(process.hrtime.bigint() - start) / 1e6;

    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration.toFixed(2)}ms`
    );
  });

  next();
}

module.exports = logger;