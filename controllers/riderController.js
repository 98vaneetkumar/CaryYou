"use strict";
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const commonHelper = require("../helpers/commonHelper.js.js");
const helper = require("../helpers/validation.js");
const Models = require("../Models/index");
const Response = require("../config/responses.js");


module.exports = {
  licenseDetailsAdd:async(req, res)=>{
    try {
      const schema = Joi.object().keys({
        licenceNumber: Joi.string().required(),
        licenceType: Joi.string().required(),
        issueOn: Joi.string().required(),
        DOB: Joi.string().required(),
        nationality: Joi.string().required(),
        expiry_date: Joi.string().optional(),
        typeOfVehicle:Joi.string().optional(),
        regExpDate: Joi.string().optional(),
        insuranceExpiryDate: Joi.string().optional(),
        vehicleNumber: Joi.string().optional(),
        });

      let payload = await helper.validationJoi(req.body, schema);
      var licenceImagePaths = [];
      let picOfVehicleArray=[];
      let picOfVehicleRegistrationArray=[];
      let insurancePolicyArray=[];
      
      if (req.files && req.files.licenceImage) {
        const licenceFiles = Array.isArray(req.files.licenceImage) ? req.files.licenceImage : [req.files.licenceImage];
        for (const file of licenceFiles) {
          const uploadedPath = await commonHelper.fileUpload(file);
          licenceImagePaths.push(uploadedPath);
        }
      }
     
      if (req.files && req.files.picOfVehicle) {
        const picOfVehicleFiles = Array.isArray(req.files.picOfVehicle) ? req.files.picOfVehicle : [req.files.picOfVehicle];
        for (const file of picOfVehicleFiles) {
          const uploadedPath = await commonHelper.fileUpload(file);
          picOfVehicleArray.push(uploadedPath);
        }
      }
   
      if (req.files && req.files.picOfVehicleRegistration) {
        const picOfVehicleRegistrationFiles = Array.isArray(req.files.picOfVehicleRegistration) ? req.files.picOfVehicleRegistration : [req.files.picOfVehicleRegistration];
        for (const file of picOfVehicleRegistrationFiles) {
          const uploadedPath = await commonHelper.fileUpload(file);
          picOfVehicleRegistrationArray.push(uploadedPath);
        }
      }

   
      if (req.files && req.files.insurancePolicy) {
        const insurancePolicyFiles = Array.isArray(req.files.insurancePolicy) ? req.files.insurancePolicy : [req.files.insurancePolicy];
        for (const file of insurancePolicyFiles) {
          const uploadedPath = await commonHelper.fileUpload(file);
          insurancePolicyArray.push(uploadedPath);
        }
      }

      let objToSave={
        licenceNumber:payload.licenceNumber,
        licenceType:payload.licenceType,
        issueOn:payload.issueOn,
        DOB:payload.DOB,
        nationality:payload.nationality,
        expiry_date:payload.expiry,
        licenceImage:licenceImagePaths
      }
      let objToSave1={
        picOfVehicle:picOfVehicleArray,
        picOfVehicleRegistration:picOfVehicleRegistrationArray,
        insurancePolicy:insurancePolicyArray,
        typeOfVehicle:payload.typeOfVehicle,
        regExpDate:payload.regExpDate,
        insuranceExpiryDate:payload.insuranceExpir,
        vehicleNumber:payload.vehicleNumber
      }
      const result = await Models.userModel.updateOne(
        { _id: req.user._id }, // Filter by the user's ID
        { $set: { licenceDetails: objToSave,vehicleInfo:objToSave1 } } // Overwrite licenceDetails object
      );
      let response=await Models.userModel.findOne({_id: req.user._id})
      if (result.modifiedCount > 0) {
        return commonHelper.success(res,Response.success_msg.licenceDetailsAdd,response);
      } else {
        return commonHelper.error(
            res,
            Response.error_msg.licenceDetails_failed,
            error.message
          );
      }
    } catch (error) {
      console.error("Error during entering rider's details:", error);
      return commonHelper.error(res, Response.error_msg.riderData_failed, error.message);
    }
  },
  licenseDetailsUpdate: async (req, res) => {
    try {
      // Define Joi schema for validation
      const schema = Joi.object({
        licenceNumber: Joi.string().optional(),
        licenceType: Joi.string().optional(),
        issueOn: Joi.string().optional(),
        DOB: Joi.string().optional(),
        nationality: Joi.string().optional(),
        expiry_date: Joi.string().optional(),
        typeOfVehicle: Joi.string().optional(),
        picOfVehicleRegistration: Joi.string().optional(),
        regExpDate: Joi.string().optional(),
        insurancePolicy: Joi.string().optional(),
        insuranceExpiryDate: Joi.string().optional(),
        vehicleNumber: Joi.string().optional(),
      });
    
      // Validate input payload
      const payload = await helper.validationJoi(req.body, schema);
    
      // Initialize arrays for new images
      const licenceImagePaths = [];
      const picOfVehicleArray = [];
      const picOfVehicleRegistrationArray = [];
      const insurancePolicyArray = [];
    
      // Handle file uploads
      const uploadFile = async (files) => {
        const fileArray = Array.isArray(files) ? files : [files];
        const uploadedPaths = [];
        for (const file of fileArray) {
          const uploadedPath = await commonHelper.fileUpload(file);
          uploadedPaths.push(uploadedPath);
        }
        return uploadedPaths;
      };
    
      if (req.files?.licenceImage) {
        licenceImagePaths.push(...(await uploadFile(req.files.licenceImage)));
      }
      if (req.files?.picOfVehicle) {
        picOfVehicleArray.push(...(await uploadFile(req.files.picOfVehicle)));
      }
      if (req.files?.picOfVehicleRegistration) {
        picOfVehicleRegistrationArray.push(...(await uploadFile(req.files.picOfVehicleRegistration)));
      }
      if (req.files?.insurancePolicy) {
        insurancePolicyArray.push(...(await uploadFile(req.files.insurancePolicy)));
      }
    
      // Fetch existing user data
      const existingUser = await Models.userModel.findOne({ _id: req.user._id });
    
      // Prepare update objects
      const licenceUpdate = {
        ...(payload.licenceNumber && { licenceNumber: payload.licenceNumber }),
        ...(payload.licenceType && { licenceType: payload.licenceType }),
        ...(payload.issueOn && { issueOn: payload.issueOn }),
        ...(payload.DOB && { DOB: payload.DOB }),
        ...(payload.nationality && { nationality: payload.nationality }),
        ...(payload.expiry_date && { expiry_date: payload.expiry_date }),
        ...(licenceImagePaths.length && {
          licenceImage: existingUser?.licenceDetails?.licenceImage
            ? [...existingUser.licenceDetails.licenceImage, ...licenceImagePaths]
            : licenceImagePaths,
        }),
      };
    
      const vehicleUpdate = {
        ...(payload.typeOfVehicle && { typeOfVehicle: payload.typeOfVehicle }),
        ...(picOfVehicleArray.length && {
          picOfVehicle: existingUser?.vehicleInfo?.picOfVehicle
            ? [...existingUser.vehicleInfo.picOfVehicle, ...picOfVehicleArray]
            : picOfVehicleArray,
        }),
        ...(picOfVehicleRegistrationArray.length && {
          picOfVehicleRegistration: existingUser?.vehicleInfo?.picOfVehicleRegistration
            ? [
                ...existingUser.vehicleInfo.picOfVehicleRegistration,
                ...picOfVehicleRegistrationArray,
              ]
            : picOfVehicleRegistrationArray,
        }),
        ...(payload.regExpDate && { regExpDate: payload.regExpDate }),
        ...(insurancePolicyArray.length && {
          insurancePolicy: existingUser?.vehicleInfo?.insurancePolicy
            ? [...existingUser.vehicleInfo.insurancePolicy, ...insurancePolicyArray]
            : insurancePolicyArray,
        }),
        ...(payload.insuranceExpiryDate && { insuranceExpiryDate: payload.insuranceExpiryDate }),
        ...(payload.vehicleNumber && { vehicleNumber: payload.vehicleNumber }),
      };
    
      // Update user document
      const result = await Models.userModel.updateOne(
        { _id: req.user._id },
        {
          ...(Object.keys(licenceUpdate).length > 0 && { $set: { licenceDetails: licenceUpdate } }),
          ...(Object.keys(vehicleUpdate).length > 0 && { $set: { vehicleInfo: vehicleUpdate } }),
        }
      );
    
      // Fetch updated user details
      const updatedUser = await Models.userModel.findOne({ _id: req.user._id });
    
      if (result.modifiedCount > 0) {
        return commonHelper.success(res, Response.success_msg.licenceDetailsUpdated, updatedUser);
      } else {
        return commonHelper.error(
          res,
          Response.error_msg.licenceDetails_failed,
          "No changes made to the record."
        );
      }
    } catch (error) {
      console.error("Error during licence details update:", error);
      return commonHelper.error(res, Response.error_msg.riderData_failed, error.message);
    }
    
  },
  deleteFile:async(req,res)=>{
    try {
      let result=await commonHelper.fileUpload(req.files.image)
      const image=result
      console.log("image",image)
      let deletefile=await commonHelper.deleteFile(image)
      console.log("deletefile",deletefile)
      return commonHelper.success(res, "file delete successfully", deletefile);
    } catch (error) {
      throw error
    }
  },
  feedBackSend:async(req,res)=>{
    try {
      const schema = Joi.object().keys({
        fullName: Joi.string().required(),
        email: Joi.string().email().required(),
        countryCode: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        message: Joi.string().required(),
        });

      let payload = await helper.validationJoi(req.body, schema);
      let objToSave={
        fullName:payload.fullName,
        email:payload.email,
        countryCode: payload.countryCode,
        phoneNumber:payload.phoneNumber,
        message:payload.message
      }
      let result = await Models.feedBackModel.create(objToSave)
      return commonHelper.success(res, Response.success_msg.feedBack_send_success, result);
    } catch (error) {
      console.log("error",error);
      throw error
    }
  }

}