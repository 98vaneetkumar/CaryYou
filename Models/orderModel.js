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
      enum: [1, 2, 3, 4, 5], // 1-pending 2-success 3-reject 4-ongoing 5-return
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
  },
  { timestamps: true }
);

module.exports = mongoose.models.order || mongoose.model("order", orderSchema);
