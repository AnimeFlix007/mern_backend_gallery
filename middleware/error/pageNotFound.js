const HttpErrorHandler = require("./HttpErrorHandler")

const pageNotFound = async (req, res, next) => {
    const page404 =  new HttpErrorHandler(`Page not found -  ${req.originalUrl}`, 404)
    return next(page404)
}

module.exports = pageNotFound