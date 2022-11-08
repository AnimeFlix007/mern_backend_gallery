const errorMiddleware = async (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;
  return res.status(err.statusCode).json({ message: err.message });
};

module.exports = errorMiddleware