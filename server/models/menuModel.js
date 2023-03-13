const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const menuSchema = new Schema({
  id: Number,
  name: String,
  price: Number,
  course: String,
  cuisine: String,
});

menuSchema.index("id", { unique: true });

module.exports = mongoose.model("Menu", menuSchema);
