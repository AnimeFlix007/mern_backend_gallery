const express = require("express");
const path = require("path");
const fs = require("fs");

const cloudinaryUploading = require("../utils/cloudinary");
const {
  photoUpload,
  photoResize,
} = require("../middleware/uploads/uploadImage");
const { verifyToken } = require("../middleware/auth/authMiddleware");
const HttpErrorHandler = require("../middleware/error/HttpErrorHandler");
const Gallery = require("../models/Gallery");
const router = express.Router();

router.post(
  "/",
  verifyToken,
  photoUpload.single("image"),
  photoResize,
  async (req, res, next) => {
    const { id } = req.user
    console.log(req.file.filename);
    const localPath = `public/images/${req.file.filename}`;
    try {
      const imgUpload = await cloudinaryUploading(
        path.join(__dirname, "..", localPath)
      );
      console.log(imgUpload);
      const post = await Gallery.create({
        fileName: req.file.filename,
        user: id,
        photo: imgUpload.secure_url,
      });
      fs.unlinkSync(localPath);
      return res.status(200).json({ post, message: "Image Successfully added to gallery" });
    } catch (error) {
      return next(new HttpErrorHandler(error.message));
    }
  }
);

router.delete("/:id", verifyToken, async(req, res, next) => {
    const { id } = req.params
    try {
        await Gallery.findByIdAndDelete(id)
        return res.status(200).json({ message: "Photo Deleted Successfully" })
    } catch (error) {
        return next(new HttpErrorHandler(error.message));
    }
})

module.exports = router