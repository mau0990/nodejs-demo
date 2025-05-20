const { v4 } = require("uuid");
const HttpError = require("../models/httpError");
const { validationResult } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getAllUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(new HttpError("User Error!", 404));
  }
  res.json({ users: users.map((x) => x.toObject({ getters: true })) });
};

const signUpUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return next(new HttpError("User already exist, please log in!", 404));
    }
  } catch (error) {
    return next(new HttpError("User Error!", 404));
  }

  const encryptedPassword = await bcrypt.hash(password, 12);

  const createdUser = new User({
    name,
    email,
    image:
      "https://zelda.nintendo.com/tears-of-the-kingdom/_images/features/link-crouching.png",
    password: encryptedPassword,
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Could not create the user." + err, 500);
    return next(error); //We use next for asynchronous implementation
  }

  const token = jwt.sign({ email, id: createdUser.id }, "generated_secret", {
    expiresIn: "1h",
  });
  res.status(201).json({ userId: createdUser.id, email, token });
};

const loginUser = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError("Invalid input passed", 422));
  }
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return next(new HttpError("User does not exist!", 404));
    }
  } catch (error) {
    return next(new HttpError("User Error!", 404));
  }

  const isValidPassword = await bcrypt.compare(password, existingUser.password);
  if (!isValidPassword) {
    return next(new HttpError("No valid credentials", 404));
  }

  const token = jwt.sign({ email, id: existingUser.id }, "generated_secret", {
    expiresIn: "1h",
  });

  res.json({ userId: existingUser.id, email: existingUser.email, token });
};

exports.getAllUsers = getAllUsers;
exports.signUpUser = signUpUser;
exports.loginUser = loginUser;
