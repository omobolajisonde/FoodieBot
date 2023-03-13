const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const orderSchema = new Schema({
  orderNo: { type: Number },
  order: [
    {
      type: ObjectId,
      ref: "Menu",
    },
  ],
  total: Number,
});

const userSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    orders: [orderSchema],
  },
  { timestamps: {} }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
