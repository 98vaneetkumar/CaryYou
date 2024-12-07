const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new mongoose.Schema(
  {
    orderBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    restaurant: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "restaurant",
    },
    price: { type: String },
    item: { type: String },
    status: {
      type: Number,
      enum: [1, 2, 3, 4], // 1-pending 2-success 3-cancel 4-ongoing
    },
    rider: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    riderTip: {
      type: Number,
    },
    orderPickUpTime: {
      type: Date,
    },
    orderPickUpDate: {
      type: Date,
    },
    orderDeliveredTime: {
      type: Date,
    },
    orderDeliveredDate: {
      type: Date,
    },
    cancelReason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.order || mongoose.model("order", orderSchema);
