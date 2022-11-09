const jwt = require("jsonwebtoken");
const HttpErrorHandler = require("../error/HttpErrorHandler");

const verifyToken = (req, res, next) => {
  const token = req?.cookies?.access_token;
  if (!token) {
    return next(new HttpErrorHandler("User unauthenticated", 401));
  }
  jwt.verify(String(token), process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new HttpErrorHandler("token not valid", 401));
    }
    req.user = user;
    return next();
  });
};

module.exports = { verifyToken };
