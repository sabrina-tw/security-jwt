const express = require("express");
const router = express.Router();
const Trainer = require("../models/trainer.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const createJWTToken = require("../config/jwt");

router.post("/", async (req, res, next) => {
  try {
    const trainer = new Trainer(req.body);
    const newTrainer = await trainer.save();
    res.json(newTrainer);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const trainers = await Trainer.find();
    res.json(trainers);
  } catch (err) {
    next(err);
  }
});

const protectRoute = (req, res, next) => {
  try {
    if (!req.cookies.token) {
      const err = new Error("You are not authorized");
      next(err);
    } else {
      req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
      next();
    }
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};

router.get("/:username", protectRoute, async (req, res, next) => {
  try {
    const username = req.params.username;
    const regex = new RegExp(username, "gi");
    const trainers = await Trainer.find({ username: regex }, "-password");
    res.send(trainers);
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const trainer = await Trainer.findOne({ username });
    const result = await bcrypt.compare(password, trainer.password);

    if (!result) {
      throw new Error("Login failed");
    }

    const token = createJWTToken(trainer.username);

    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = oneDay * 7;
    const expiryDate = new Date(Date.now() + oneWeek);

    res.cookie("token", token, {
      expires: expiryDate,
      httpOnly: true, // client-side js cannot access cookie info
      secure: true, // use HTTPS
    });

    res.send("You are now logged in!");
  } catch (err) {
    if (err.message === "Login failed") {
      err.statusCode = 400;
    }
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").send("You are now logged out!");
});

module.exports = router;
