const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const transactionSchema = new mongoose.Schema(
  {
    userId: { 
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
     },
     restaurantOwnerId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
     },
    restaurantId: { 
        type: Schema.Types.ObjectId,
        required: true,
        ref: "restaurant",
     },
    transactionId:{type:String},
    totalAmount:{type:String},
    adminCommission:{type:String},
    riderCharges:{type:String},
    actualAmount:{type:String},
    addisionalCharge:{type:String},
    refundId:{type:String},
    paymentStatus: { type: String,default:"" },
  },
  { timestamps: true }
);

module.exports = mongoose.models.transaction || mongoose.model("transaction", transactionSchema);
