export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(error.stack || error);
  }

  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Internal server error"
  });
}
