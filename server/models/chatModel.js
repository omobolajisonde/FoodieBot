const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const chatSchema = new Schema(
  {
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isBotMsg: {
      type: Boolean,
      required: true,
    },
    userId: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
  },
  { timestamps: {} }
);

const Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
