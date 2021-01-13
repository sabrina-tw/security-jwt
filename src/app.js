require("dotenv").config();
require("./utils/db");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(express.json());
app.use(cookieParser());

const trainersRouter = require("./routes/trainers.route");
app.use("/trainers", trainersRouter);

module.exports = app;
