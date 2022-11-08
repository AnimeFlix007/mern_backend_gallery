const jwt = require("jsonwebtoken");
const HttpErrorHandler = require("../error/HttpErrorHandler");

const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return next(HttpErrorHandler("User unauthenticated", 401));
  }
  jwt.verify(String(token), process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(HttpErrorHandler("token not valid", 401));
    }
    req.user = user;
    return next();
  });
};

const verifyUser = (req, res, next) => {
  if (req.user.id === req.params.id) {
    next();
  } else {
    return next(HttpErrorHandler("You are not authorized!", 401));
  }
};

module.exports = { verifyToken, verifyUser };
