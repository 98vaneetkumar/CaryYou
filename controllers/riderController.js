"use strict";
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const commonHelper = require("../helpers/commonHelper.js.js");
const helper = require("../helpers/validation.js");
const Models = require("../Models/index");
const Response = require("../config/responses.js");


module.exports = {
  riderDetails:async(req, res)=>{
    try {
        
    } catch (error) {
      console.error("Error during entering rider's details:", error);
      return commonHelper.error(res, Response.error_msg.riderData_failed, error.message);
    }
  },

}