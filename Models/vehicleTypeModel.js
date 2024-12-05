const mongoose = require("mongoose");

const vehicleTypeSchema = new mongoose.Schema(
  {
    category: {
      type: String, // Bike, Auto, car etc
      required: true,
    },
    name: { type: String, required: true }, // Specific vehicle name (e.g., Activa, Swift, etc.)
    fuelType: {
      type: String, // e.g., Petrol, Diesel, Electric, Hybrid
      enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
      required: true,
    }
  },
  { timestamps: true }
);

const vehicleType =
  mongoose.models.vehicleType || mongoose.model("vehicleType", vehicleTypeSchema);

module.exports = vehicleType;
