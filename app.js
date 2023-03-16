const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");

const sessionMiddleware = require("./middlewares/sessionMiddleware");

// APP INITIALIZATION
const app = express();

// Session middleware
app.set("trust proxy", 1);
app.use(sessionMiddleware);
app.use(cookieParser());

// Serving static files
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  let timeOfTheDay;
  const now = new Date(); // Get current date and time
  const currentHour = now.getHours(); // Get current hour (0-23)

  if (currentHour >= 5 && currentHour < 12) {
    timeOfTheDay = "Good morning!"; // It's morning (between 5am and 12pm)
  } else if (currentHour >= 12 && currentHour < 18) {
    timeOfTheDay = "Good afternoon!"; // It's afternoon (between 12pm and 6pm)
  } else {
    timeOfTheDay = "Good evening!"; // It's evening (between 6pm and 5am)
  }

  res.status(200).render("index", { timeOfTheDay });
});

// Any request that makes it to this part has lost it's way
app.all("*", (req, res, next) => {
  return res.status(404).json({
    status: "failed",
    message: `Can't find ${req.originalUrl} on this server! The resource you're looking for can't be found. Please check the URL before trying again.`,
  });
});

module.exports = app;
