const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const resourceSchema = new Schema(
  {
    options: [String],
    menu: [
      {
        name: String,
        price: Number,
        course: String,
        cuisine: String,
      },
    ],
  },
  { timestamps: {} }
);

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;
