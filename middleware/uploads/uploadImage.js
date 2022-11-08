const multer = require("multer");
const sharp = require("sharp");
const path = require("path");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb({ message: "Unsupported file format" }, false);
  }
};

const photoUpload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  // 10mb
  limits: { fieldSize: 10000000 },
});

const photoResize = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  req.file.filename = `image-${Date.now()}-${req.file.originalname}`;
  await sharp(req.file.buffer)
    .resize(250, 250)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(`public/images/${req.file.filename}`));
  next();
};

module.exports = { photoUpload, photoResize };
