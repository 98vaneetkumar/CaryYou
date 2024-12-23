const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const rideBookingSchema = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    riderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    userLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      location: {
        type: String,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere", // Create a geospatial index for coordinates
        default: [0, 0],
        required: false,
      },
    },
    destinationLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      location: {
        type: String,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere", // Create a geospatial index for coordinates
        default: [0, 0],
        required: false,
      },
    },
    // vehicleType:{
    //   type: String
    // },
    riderLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      location: {
        type: String,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: "2dsphere", // Create a geospatial index for coordinates
        default: [0, 0],
        required: false,
      },
    },
    status: {
      type: Number,
      enum: [0, 1, 2, 3, 4, 5], // 0 for pending 1 for accept 2 for start 3 for onGoing 4 for complete 5 for cancel
    },
    reasonOfCancelation: {
      type: String,
    },
    riderFair:{
      type:Number,
    },
    adminCommission:{
      type:Number,
    },
    totalDistance:{
      type:String
    },
    totalTimeTaken:{
      type:String
    },
    extraCharges:{
      type:Number,
      default:0
    }
  },
  { timestamps: true }
);
rideBookingSchema.index({ userLocation: "2dsphere" });
rideBookingSchema.index({ riderLocation: "2dsphere" });
rideBookingSchema.index({ destinationLocation: "2dsphere" });

module.exports =
  mongoose.models.rideBooking ||
  mongoose.model("rideBooking", rideBookingSchema);
