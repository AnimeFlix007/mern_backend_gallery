const cloudinary = require("cloudinary");
const dotenv = require("dotenv")

dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const cloudinaryUploading = async (fileToUpload) => {
  try {
    const data = await cloudinary.uploader.upload(fileToUpload, {
      resource_type: "auto",
    });
    return {
      secure_url: data?.secure_url,
    };
  } catch (error) {
    return error;
  }
};

module.exports = cloudinaryUploading;
