const mongoose = require('mongoose')
const HttpErrorHandler = require('../middleware/error/HttpErrorHandler')

const validateId = (id, next) => {
    const isValid = mongoose.Types.ObjectId.isValid(id)
    if(!isValid) {
        return next(new HttpErrorHandler("Invalid id", 404))
    }
}

module.exports = validateId