const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  fullName: { type: String },
  customerId:{type:String,default:null},
  socketId:{type:String,default:null},
  stripeAccountId:{type:String},
  stripeAccountHas:{type:Number ,default:0},
  email: { type: String },
  socialId:{type:String},
  socialType:{type:String},
  password: { type: String },
  phone_verified:{type:String},
  countryCode:{type:String},
  phoneNumber: { type: String },
  DOB:{type:Date},
  image: { type: String },
  role: {
    type: Number,
    enum: [0, 1, 2, 3, 4], // 0 for super Admin, 1 for sub Admin, 2 for user, 3 rider , 4 driver
    deafult: 1,
  },
  location:{
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere', // Create a geospatial index for coordinates
      default:[0,0],
      required:false
    },
  },
  address:[
    {
      fullName:{type: String,},
      address: {type:String},
      countryCode:{type:String},
      phoneNumber:{type:String},
      city:{type:String},
      state:{type:String},
      zipCode:{type:String},
      type:{type:Number} //1 for home , 2 for work , 3 for other 
    }
  ],
  licenceDetails:[{
    licenceNumber:{type:String},
    licenceType:{type:String},
    licenceImage:[{type:String}],
    issueOn:{type:String},
    DOB:{type:String},
    nationality:{type:String},
    expiry_date:{type:String},
  }],
  vehicleInfo:[{
    picOfVehicle:[{type:String}],
    typeOfVehicle:{type:String},
    picOfVehicleRegistration:[{type:String}],
    regExpDate:{type:String},
    insurancePolicy:[{type:String}],
    insuranceExpiryDate:{type:String},
    vehicleNumber:{type:String},
  }],
  riderOnOff:{type:Number},
  notificationStatus:{type:Number, default:1},// 0 means off and 1 means on
  deviceToken: { type: String },
  deviceType: { type: String },
  loginTime: { type: Number },
  resetToken: { type: String, default: null },
  resetTokenExpires:{type:String,default:null},
  resetPasswordExpires: { type: Date, default: null },
  aboutMe:{type:String},
  is_block:{type:Number,default:0},
  is_otp_verify:{
    type: Number,
    enum: [0, 1],
    deafult: 0,
  },
  status: {
    type: Number,
    default: 0
  }
},
{ timestamps: true });

userSchema.index({"location": '2dsphere' });
const user = mongoose.models.user || mongoose.model("user", userSchema);
module.exports = user;