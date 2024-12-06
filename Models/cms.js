const mongoose = require("mongoose");

const cmsSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    role: { type: String, enum: [1, 2, 3] }, // 1 for About Us, 2 for Terms & Conditions, 3 for Privacy
  },
  { timestamps: true }
);

module.exports = mongoose.models.cms || mongoose.model("cms", cmsSchema);
