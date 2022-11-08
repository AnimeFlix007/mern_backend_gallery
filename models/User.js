const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = mongoose.Schema(
  {
    firstName: {
      required: [true, "firstname is required"],
      type: String,
    },
    lastName: {
      required: [true, "lastname is required"],
      type: String,
    },
    email: {
      type: String,
      required: [true, "email is required"],
    },
    phone: {
      type: Number,
      required: [true, "Ph. no. is required"],
    },
    password: {
      type: String,
      required: [true, "password is required"],
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    accountVerificationToken: String,
    accountVerificationTokenExpires: Date,
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
    timestamps: true,
  }
);

userSchema.virtual("gallery", {
  ref: "Gallery",
  foreignField: "user",
  localField: "_id"
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.isPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.createAccountVerificationToken = async function () {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  this.accountVerificationToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");
  this.accountVerificationTokenExpires = Date.now() + 30 * 24 * 60 * 60 * 1000;
  return verificationToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
