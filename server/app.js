const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

const sessionMiddleware = require("./middlewares/sessionMiddleware");

// APP INITIALIZATION
const app = express();

// Session middleware
app.use(sessionMiddleware);
app.use(cookieParser());

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.status(200).render("index");
});

module.exports = app;
