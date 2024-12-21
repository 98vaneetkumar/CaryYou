const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const restaurantSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    name: { type: String },
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
        status: { type: Number, default: 1 }, // 1 for active and 0 for inactive
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    subCategory: [
      {
        name: { type: String, required: true },
        image: { type: String },
        categoryId: {
          type: Schema.Types.ObjectId,
        },
        status: { type: Number, default: 1 }, // 1 for active and 0 for inactive
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
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
        status: { type: Number, default: 1 }, // 1 for active and 0 for inactive
        description: { type: String },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    staffs: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
      },
    ],
    banner_image: [
      {
        image: [{ type: String }],
      },
    ],
    openingTime: { type: String },
    closingTime: { type: String },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // Enable timestamps for the main schema
);

// Middleware to update timestamps for nested objects
restaurantSchema.pre("save", function (next) {
  const now = Date.now();

  // Update timestamps for category
  this.category.forEach((item) => {
    if (!item.createdAt) item.createdAt = now;
    item.updatedAt = now;
  });

  // Update timestamps for subCategory
  this.subCategory.forEach((item) => {
    if (!item.createdAt) item.createdAt = now;
    item.updatedAt = now;
  });

  // Update timestamps for products
  this.products.forEach((item) => {
    if (!item.createdAt) item.createdAt = now;
    item.updatedAt = now;
  });

  next();
});

restaurantSchema.index({ location: "2dsphere" });

module.exports =
  mongoose.models.restaurant || mongoose.model("restaurant", restaurantSchema);
