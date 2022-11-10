const express = require("express");
const crypto = require("crypto");

const generateToken = require("../config/token/generateToken");
const { verifyToken } = require("../middleware/auth/authMiddleware");
const HttpErrorHandler = require("../middleware/error/HttpErrorHandler");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const validateId = require("../utils/validateId");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.status(200).json({ message: "all Users", users });
  } catch (error) {
    return next(new HttpErrorHandler());
  }
});

router.post("/register", async (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new HttpErrorHandler("User already exists", 401));
    }
    const user = await User.create({
      firstName,
      lastName,
      phone,
      email,
      password,
    });
    return res.json({ user, message: "User registered sucessfully" });
  } catch (error) {
    return next(new HttpErrorHandler());
  }
});

router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email }).populate("gallery");
    if (!existingUser) {
      return next(new HttpErrorHandler("User does not exists", 401));
    }
    if ((await existingUser.isPassword(password)) === false) {
      return next(new HttpErrorHandler("Invalid Password", 401));
    }

    const token = generateToken(existingUser);
    res.cookie("access_token", token, {
      // access by server only
      httpOnly: true,
      expires: new Date(Date.now() + 25891000000)
    });
    return res.status(200).json({
      user: existingUser,
      token,
      message: "User logged In sucessfully",
    });
  } catch (error) {
    return next(new HttpErrorHandler(error.message));
  }
});

router.post("/logout", async (req, res, next) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "User Logged Out Successfully" });
});

router.post("/send-verification-mail", verifyToken, async (req, res, next) => {
  const { id, email } = req.user;
  const subject = "Node Js Team";
  try {
    const user = await User.findById(id);
    const verifyToken = await user.createAccountVerificationToken();
    const message = `Verify your acount now in 10 mins or ignore this message <a href="https://animixplay-gallery-frontend.com/verify-account/${verifyToken}">Click here to verify</a>`;
    await user.save();
    console.log(verifyToken);
    await sendEmail(email, subject, message);
    console.log("ok");
    return res
      .status(200)
      .json({
        url: message,
        message: "E-mail has been send to your registered G-mail account",
      });
  } catch (error) {
    return next(new HttpErrorHandler(error.message));
  }
});

router.put("/verify-account", verifyToken, async (req, res, next) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  try {
    const user = await User.findOneAndUpdate(
      {
        accountVerificationToken: hashedToken,
        accountVerificationTokenExpires: { $gt: Date.now() },
      },
      {
        isAccountVerified: true,
        accountVerificationToken: undefined,
        accountVerificationTokenExpires: undefined,
      },
      {
        new: true,
      }
    );
    if (!user) {
      return next(new HttpErrorHandler("Token expired", 400));
    }
    res.status(200).json({ message: "account verified", user });
  } catch (error) {
    return next(new HttpErrorHandler());
  }
});

router.get("/getallphotos", verifyToken, async (req, res, next) => {
  const userId = req.user.id;
  try {
    const user = await User.findById(userId).populate("gallery");
    res
      .status(200)
      .json({ images: user.gallery, message: "Fetched All Images" });
  } catch (error) {
    return next(new HttpErrorHandler());
  }
});

module.exports = router;
