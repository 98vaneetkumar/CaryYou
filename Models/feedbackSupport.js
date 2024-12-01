const mongoose = require("mongoose");
const feedBackSupportSchema=new mongoose.Schema({
  fullName:{type:String, required:true},
  email:{type:String, required:true},
  countryCode:{type:String,required:true},
  phoneNumber:{type:String, required:true},
  message:{type:String, required:true},
},{ timestamps: true })

const feedbackSupport = mongoose.model("feedbackSupport", feedBackSupportSchema);
module.exports = feedbackSupport;