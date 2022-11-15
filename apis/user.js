const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userSchema");
const JWT_SECRET = process.env.JWT_SECRET;


router.post(
  "/join",
  body("name", "Enter a valid name").isLength({ min: 3, max: 25 }),
  body("email", "Enter a valid email").isEmail(),
  body("password", "Enter a strong password").isLength({ min: 8, max: 25 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const existingUser = await userSchema.findOne({ email: req.body.email });
      if (existingUser) {
        return res
          .status(400)
          .json({ Error: "A user with this email already exists" });
      }
      const salt = await bcrypt.genSalt(14);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user0 = await userSchema.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const userToken = {
        user: {
          id: user0.id,
        },
      };
      const authToken = jwt.sign(userToken, JWT_SECRET);
      res.json({ authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("INTERNAL SERVER ERROR");
    }
  }
);

router.post(
  "/login",
  body("email", "Enter your email").isEmail(),
  body("password", "Enter your password").isLength({ min: 8, max: 25 }),
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      const existingUser = await userSchema.findOne({ email });
      if (!existingUser) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "incorrect credentials" });
      }

      const passwordMatch = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!passwordMatch) {
        success = false;
        return res
          .status(400)
          .json({ success, error: "incorrect credentials" });
      }
      const userToken = {
        user: {
          id: existingUser.id,
        },
      };
      const authToken = jwt.sign(userToken, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("INTERNAL SERVER ERROR");
    }
  }
);

module.exports = router;
