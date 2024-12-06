const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//this is for message store
const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: false,
    },
    message: {
      type: String, //type: mongoose.Schema.Types.Mixed, // Allow storing different message types
      required: true,
    },
    message_type: {
      type: String,
      required: true,
    },
    constantId: {
      type: Schema.Types.ObjectId,
      ref: "ChatConstant",
    },
    is_read: {
      type: Number,
      default: 0,
    },
    is_delete: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
