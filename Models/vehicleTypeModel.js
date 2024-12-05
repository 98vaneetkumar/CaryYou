const mongoose = require("mongoose");

const vehicleTypeSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: ['Two-Wheeler', 'Four-Wheeler', 'Three-Wheeler', 'Other'], // Main categories
      required: true,
    },
    type: {
      type: String,
      enum: [
        'Bike',
        'Scooty',
        'Car',
        'Van',
        'Auto-Rickshaw',
        'Other',
      ], // Subcategories based on category
      required: true,
    },
    name: { type: String, required: true }, // Specific vehicle name (e.g., Activa, Swift, etc.)
    image: { type: String }, // Image URL for the vehicle
    capacity: { type: Number, required: true }, // Number of passengers the vehicle can accommodate
    status: {
      type: Number,
      enum: [0, 1], // 0: Inactive, 1: Active
      default: 1,
    },
    features: {
      type: [String], // Optional features like AC, GPS, etc.
      default: [],
    },
    description: { type: String }, // Additional details about the vehicle type
    driverCommission: {
      type: Number,
      default: 0, // Commission percentage for drivers
    },
    minFare: { type: Number, required: true }, // Minimum fare for this vehicle type
    perKmFare: { type: Number, required: true }, // Fare per kilometer
    perMinuteFare: { type: Number, required: true }, // Fare per minute
  },
  { timestamps: true }
);

const vehicleType =
  mongoose.models.vehicleType || mongoose.model("vehicleType", vehicleTypeSchema);

module.exports = vehicleType;
