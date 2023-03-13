const session = require("express-session");
var MongoDBStore = require("connect-mongodb-session")(session);

var store = new MongoDBStore({
  uri: process.env.DATABASE_URI,
  collection: "sessions",
});

// Catch errors
store.on("error", function (error) {
  console.log(error);
});

const sess = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { maxAge: +process.env.COOKIE_EXPIRES_IN },
};

if (process.env.NODE_ENV === "production") {
  sess.cookie.secure = true; // serve secure cookies
}

module.exports = session(sess);
