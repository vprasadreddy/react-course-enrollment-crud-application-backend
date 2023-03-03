const { application } = require("express");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { body, check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const authenticate = require("../middlewares/authenticate");

//get all Users
router.get("/", authenticate, async (req, res) => {
  let email = req.user.email;
  try {
    let user = await User.findOne({
      email,
    });
    if (user) {
      let users = await User.find({});
      res.send(users);
    } else {
      return res.status(401).json({ message: `User not authorised` });
    }
  } catch (error) {
    return res.status(400).json({ message: error });
  }
});

router.post(
  "/register",
  [
    check("name").notEmpty().withMessage("name is required"),
    check("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is not valid email"),
    check("password").notEmpty().withMessage("password is required"),
  ],
  async (req, res) => {
    let { name, email, password } = req.body;
    email = email.toLowerCase();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      try {
        let user = await User.findOne({
          email,
        });
        if (user) {
          return res.status(400).json({ message: "User already exists" });
        }
        //encrypt the password
        let salt = await bcrypt.genSalt(10);
        let encryptedPassword = await bcrypt.hash(password, salt);
        let newUser = new User({
          name,
          email,
          password: encryptedPassword,
        });
        let savedUser = await newUser.save();
        return res
          .status(200)
          .json({ message: "Registration successfull!!!", user: savedUser });
      } catch (error) {
        return res.status(400).json({ message: error });
      }
    }
  }
);

router.post(
  "/login",
  [
    check("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is not valid email"),
    check("password").notEmpty().withMessage("password is required"),
  ],
  async (req, res) => {
    let { email, password } = req.body;
    email = email.toLowerCase();
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } else {
      try {
        let user = await User.findOne({
          email,
        });
        if (user) {
          //console.log(user.id);
          //compare password
          let isPasswordMatch = await bcrypt.compare(password, user.password);
          if (isPasswordMatch) {
            //create JWT token
            let payload = {
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
              },
            };

            jwt.sign(
              payload,
              process.env.JWT_SECRET_KEY,
              { expiresIn: 1200 },
              (error, token) => {
                if (error) throw error;
                res.status(200).json({
                  message: "Login success",
                  token,
                  user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                  },
                });
              }
            );
          } else {
            return res.status(400).json({ message: "Invalid credentials" });
          }
        } else {
          return res.status(400).json({ message: "User not found" });
        }
      } catch (error) {
        return res.status(400).json({ message: error });
      }
    }
  }
);

router.get("/myProfile", authenticate, async (req, res) => {
  let email = req.user.email;
  try {
    let user = await User.findOne({
      email,
    });
    if (user) {
      return res
        .status(200)
        .json({ message: "User authenticated", user: user });
    } else {
      return res
        .status(200)
        .json({ message: `Cannot find user with email: ${email}` });
    }
  } catch (error) {
    return res.status(400).json({ message: error });
  }
});

//update User
// { new: true } should be passed as an option to get the updated product as response.
router.put(
  "/updateuser",
  [
    check("name").notEmpty().withMessage("name is required"),
    check("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is not valid email"),
  ],
  async (req, res) => {
    let updatedUser = {
      name: req.body.name,
      email: req.body.email,
    };
    try {
      let returnedUser = await User.findOneAndUpdate(
        email,
        { $set: updatedUser },
        { new: true }
      );
      return res
        .status(200)
        .json({ message: "User updated successfully", User: returnedUser });
    } catch (error) {
      return res.status(400).json({ message: error });
    }
  }
);

router.delete(
  "/deleteuser",
  authenticate,
  [
    check("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is not valid email"),
  ],
  async (req, res) => {
    const { email } = req.body;
    let isAdmin = req.user.isAdmin;
    console.log(isAdmin);
    if (isAdmin) {
      if (email) {
        try {
          let user = await User.findOne({
            email,
          });
          if (user) {
            await User.findOneAndDelete({ email }, (err, document) => {
              if (err) {
                res.status(400).json({ err: err });
              } else {
                res.status(200).json({
                  message: "User deleted successfully",
                  user: document,
                });
              }
            });
          } else {
            return res.status(400).json({
              message: `User not found with email: ${email}`,
            });
          }
        } catch (error) {
          return res.status(400).json({ message: error });
        }
      } else {
        return res.status(400).json({ message: `Email cannot be empty` });
      }
    } else {
      return res
        .status(401)
        .json({ message: `Current user is not authorized to delete the user` });
    }
  }
);

module.exports = router;
