const express = require("express");
const crypto = require("crypto");

const generateToken = require("../config/token/generateToken");
const { verifyToken, verifyUser } = require("../middleware/auth/authMiddleware");
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
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return next(new HttpErrorHandler("User does not exists", 401));
    }
    if ((await existingUser.isPassword(password)) === false) {
      return next(new HttpErrorHandler("Password does not match", 401));
    }

    const token = generateToken(existingUser);
    return res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json({
        user: existingUser,
        token,
        message: "User registered sucessfully",
      });
  } catch (error) {
    return next(new HttpErrorHandler(error.message));
  }
});

router.post("/send-verification-mail", verifyToken, async (req, res, next) => {
  const { id, email } = req.user;
  const subject = "Node Js Team";
  console.log(email);
  try {
    const user = await User.findById(id);
    const verifyToken = await user.createAccountVerificationToken();
    const message = `Verify your acount now in 10 mins or ignore this message <a href="http://localhost:5000/api/users/send-verification-mail/${verifyToken}">Click here to verify</a>`;
    await user.save();
    console.log(verifyToken);
    await sendEmail(email, subject, message);
    return res
      .status(200)
      .json({ url: message, message: "mail has been send" });
  } catch (error) {
    return next(new HttpErrorHandler(error.message));
  }
});

router.post("/verify-account", verifyToken, async (req, res, next) => {
  const { token } = req.body;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  console.log(hashedToken);
  try {
    const user = await User.findOne({
      accountVerificationToken: hashedToken,
      accountVerificationTokenExpires: { $gt: new Date() },
    });
    if (!user) {
      return next(new HttpErrorHandler("Token expired", 400));
    }
    user.isAccountVerified = true;
    user.accountVerificationToken = undefined;
    user.accountVerificationTokenExpires = undefined;
    res.status(200).json({ message: "account verified", user });
  } catch (error) {
    return next(new HttpErrorHandler());
  }
});

router.get("/:id", verifyToken, verifyUser, async (req, res, next) => {
  const userId = req.params.id;
  validateId(userId, next);
  try {
    const user = await User.findById(userId).populate("gallery");
    res.status(200).json({ user });
  } catch (error) {
    return next(new HttpErrorHandler());
  }
});

module.exports = router;
