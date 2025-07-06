const createError = require("http-errors");

// catch 404 and forward to error handler
const notFoundHandler = (req, res, next) => {
  next(createError(404));
};

// error handler
const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
};

// Handle 404 errors
const pageNotFound = (req, res) => {
  res.status(404).send("Page not found");
};

// Global error handler
const globalErrorHandler = (err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).send("Something went wrong!");
};

module.exports = {
  notFoundHandler,
  errorHandler,
  pageNotFound,
  globalErrorHandler,
};
