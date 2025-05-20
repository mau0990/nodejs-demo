const jwt = require("jsonwebtoken");
const HttpError = require("../models/httpError");

const checkAutorization = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  const token = req.headers.autthorization?.split(" ")[1];
  if (!token) {
    return next(new HttpError("Authentication failed!", 401));
  }
  const decodedToken = jwt.verify(token, process.env.JWT_KEY);
  req.userData = { userId: decodedToken.userId };
  next();
};

module.exports = checkAutorization;
