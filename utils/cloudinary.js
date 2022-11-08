const cloudinary = require("cloudinary");

cloudinary.config({
  cloud_name: "dhu8dd8s7",
  api_key: '531669927266695',
  api_secret: "Njk_TLhb5Z4bzTHI3Mg8Btxxw68",
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
