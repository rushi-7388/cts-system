const crypto = require("crypto");
const { recordRequest } = require("../utils/metrics.util");

function tracerMiddleware(req, res, next) {
  const correlationId = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = correlationId;
  res.setHeader("X-Request-Id", correlationId);

  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const endTime = process.hrtime.bigint();
    const durationMs = Number(endTime - startTime) / 1e6;

    recordRequest({
      method: req.method,
      path: req.route ? req.baseUrl + req.route.path : req.path,
      statusCode: res.statusCode,
      durationMs,
    });
  });

  next();
}

module.exports = tracerMiddleware;
