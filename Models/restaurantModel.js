const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantSchema = new mongoose.Schema(
  {
    userId:{
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    address: { type: String},
    location:{
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere", // Create a geospatial index for coordinates
        default: [0, 0],
        required: false,
      },
    },
    category:[{type:String}],
    subCategory:[{type:String}],
    products:[{
      categoryId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "restaurant",
      },
      subCategoryId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: "restaurant"
      },
      itemName:{type: String, required: true},
      price:{type: String, required: true},
      size:{type: String}
    }],
    staffs:[{
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    }],
    openingTime:{type:String},
    closingTime:{type:String}
  },
  { timestamps: true }
);
restaurantSchema.index({ location: "2dsphere" });
module.exports = mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);
