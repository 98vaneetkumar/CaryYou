const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    name:{type:String},
    image: { type: String },
    address: { type: String },
    location: {
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
    category: [
      {
        name: { type: String, required: true },
        image: { type: String },
        status:{type:Number,default:1}// 1 for acitve  and 0 for  not acitve
      },
    ],
    subCategory: [
      {
        name: { type: String, required: true },
        image: { type: String },
        categoryId: {
          type: Schema.Types.ObjectId,
        },
        status:{type:Number,default:1}// 1 for acitve  and 0 for  not acitve

      },

    ],
    products: [
      {
        subCategoryId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        images: [{ type: String }],
        itemName: { type: String, required: true },
        price: { type: String, required: true },
        size: { type: String },
        status:{type:Number,default:1}// 1 for acitve  and 0 for  not acitve

      },
    ],
    staffs: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
      },
    ],
    openingTime: { type: String },
    closingTime: { type: String },
  },
  { timestamps: true }
);

restaurantSchema.index({ location: "2dsphere" });

module.exports =
  mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);
