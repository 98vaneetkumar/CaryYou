"use strict";
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const otpManager = require("node-twillo-otp-manager")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
  process.env.TWILIO_SERVICE_SID
);
const stripe = require("stripe")(process.env.STRIPE_SK);
const commonHelper = require("../helpers/commonHelper.js.js");
const helper = require("../helpers/validation.js");
const Models = require("../models/index");
const Response = require("../config/responses.js");

// const stripeReturnUrl="http://localhost:3000/users/stripe_return_url"
const stripeReturnUrl="https://example.com/reauth"
//Add the external bank account
async function addBankAccountToConnectedAccount(accountId, bankAccountDetails) {
    try {
      if (!accountId) {
        throw new Error("Account ID is required");
      }
  
      const bankAccount = await stripe.accounts.createExternalAccount(accountId, {
        external_account: {
          object: "bank_account",
          country: "US", // Change country if needed
          currency: "usd", // Change currency if needed
          account_holder_name: bankAccountDetails.accountHolderName,
          account_holder_type: "individual", // or 'company'
          routing_number: bankAccountDetails.routingNumber,
          account_number: bankAccountDetails.accountNumber,
        },
      });
      console.log("Bank Account Added:", bankAccount);
      return bankAccount;
    } catch (error) {
      console.error("Error adding bank account:", error.message);
      throw error;
    }
  }


module.exports = {
  signUp: async (req, res) => {
    try {
      const schema = Joi.object().keys({
        fullName: Joi.string().required(),
        email: Joi.string().email().required(),
        countryCode: Joi.string().required(),
        phoneNumber: Joi.string().required(),
        password: Joi.string().required(),
        profilePicture: Joi.string().optional(),
        deviceToken: Joi.string().optional(),
        deviceType: Joi.number().valid(1, 2).optional(),
      });

      let payload = await helper.validationJoi(req.body, schema);

      const hashedPassword = await commonHelper.bcryptData(
        payload.password,
        process.env.SALT
      );

      // Handle file upload using commonHelper
      let profilePicturePath = null;
      if (req.files && req.files.profilePicture) {
        profilePicturePath = await commonHelper.fileUpload(
          req.files.profilePicture
        );
      }
      const customer = await stripe.customers.create({
        description: "everything",
        email: payload.email,
      });
      let time = commonHelper.unixTimestamp();

      let objToSave = {
        fullName: payload.fullName,
        email: payload.email,
        countryCode: payload.countryCode,
        phoneNumber: payload.phoneNumber,
        password: hashedPassword,
        image: profilePicturePath ? profilePicturePath : null,
        deviceToken: payload.deviceToken,
        deviceType: payload.deviceType,
        customerId:customer.id,
        loginTime:time
      };

      let response = await Models.userModel.create(objToSave);
      const user= await Models.userModel.findOne({_id:response._id});
      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
        },
        process.env.SECRET_KEY
      );
      const userResponse = JSON.parse(JSON.stringify(user)); // Convert to plain object
      userResponse.token = token;
    
     return commonHelper.success(
        res,
        Response.success_msg.registered,
        userResponse
      );
    } catch (error) {
      console.error("Error during sign up:", error);
      return commonHelper.error(res, Response.error_msg.regUser, error.message);
    }
  },
  login: async (req, res) => {
    try {
      const schema = Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        deviceToken: Joi.string().optional(), // static data, will come from frontend
        deviceType: Joi.number().valid(1, 2).optional(),
      });
      let payload = await helper.validationJoi(req.body, schema);

      const { email, password, deviceToken, deviceType } = payload;

      const user = await Models.userModel.findOne({email: email});

      if (!user) {
        return commonHelper.failed(res, Response.failed_msg.userNotFound);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return commonHelper.failed(res, Response.failed_msg.invalidPassword);
      }

       if(user&&user.customerId==""||null){
        var customer = await stripe.customers.create({
            description: "everything",
            email: payload.email,
          });
       }
       let time = commonHelper.unixTimestamp();
      await Models.userModel.updateOne(
        { _id: user._id }, // Find the user by ID
        {
          $set: {
            deviceToken: deviceToken,
            deviceType: deviceType,
            loginTime: time,
            customerId:user&&user.customerId?user.customerId:customer.id
          },
        }
      );

      const token = jwt.sign(
        {
          _id: user._id,
          email: user.email,
        },
        process.env.SECRET_KEY
      );
      const userResponse = JSON.parse(JSON.stringify(user)); // Convert to plain object
      userResponse.token = token;     
     return commonHelper.success(res, Response.success_msg.login, userResponse);
    } catch (err) {
      console.error("Error during login:", err);
      return commonHelper.error(res, Response.error_msg.loguser, err.message);
    }
  },
  socialLogin: async (req, res) => {
    try {
        const schema = Joi.object().keys({
            socialId: Joi.string().required(),
            socialType: Joi.string().valid(1,2,3,4).required(),
            email: Joi.string().email().required(),
            name: Joi.string().optional(),
            deviceToken: Joi.string().optional(),
            deviceType: Joi.number().valid(1, 2).optional(),
          });
    
       let payload = await helper.validationJoi(req.body, schema);
       let time = await commonHelper.unixTimestamp();

      let emailcheck = await Models.userModel.findOne({
       email: payload.email, socialId: payload.socialId 
      });

      if (emailcheck) {
        let newData = await Models.userModel.findByIdAndUpdate({
             _id: emailcheck._id ,
             deviceToken:payload.deviceToken,
             deviceType:payload.deviceType
            },
            {
                $set: {  loginTime: time,}
            }, { new: true })

        let emailData = await Models.userModel.findOne({
         email: payload.email, socialId:payload.socialId 
        });

        const token = jwt.sign(
            {
              _id: emailcheck._id,
              email: emailcheck.email,
            },
            process.env.SECRET_KEY
          );

        const response = JSON.parse(JSON.stringify(emailData));
        response.token = token;
        response.allreadyExist = 1;
        return helper.success(res, Response.success_msg.alreadyExists, response);
      }else {
        let objToSave={}
        if (!payload.name) {
          let nameArr = email.split("@");
          objToSave.name = nameArr[0].replace(/^\d+|\d+$/g, '');
        }
         objToSave={
            email: payload.email,
            socialId: payload.socialId,
            socialType: payload.socialType,
            loginTime: time,
            deviceToken: payload.deviceToken,
            deviceType: payload.deviceType
          }
        let usedata = await Models.userModel.create(objToSave);
        let userData = await Models.userModel.findOne({
           _id: usedata._id 
        });
        const token = jwt.sign(
            {
              _id: userData._id,
              email: userData.email,
            },
            process.env.SECRET_KEY
          );
        let response= JSON.parse(JSON.stringify(userData));
        response.token = token;
        response.allreadyExist = 0;
        return helper.success(res, Response.success_msg.registered, response);
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  deleteAccount: async (req, res) => {
    try {
      await Models.userModel.deleteOne({ _id: req.user._id });
      return commonHelper.success(res, Response.success_msg.delete_account,);
    } catch (error) {
      console.log(error);
      throw error
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const schema = Joi.object().keys({
        email: Joi.string().email().payload(),
      });
      let payload = await helper.validationJoi(req.body, schema);
      const { email } = payload;
      const user = await Models.userModel.findOne({
       email: email ,
      });
      if (!user) {
        return commonHelper.failed(res, Response.failed_msg.noAccWEmail);
      }
      const resetToken = await commonHelper.randomStringGenerate(req, res);
      await Models.userModel.updateOne(
        { _id: user._id }, // Find the user by ID
        {
          $set: {
            resetToken: resetToken,
            resetTokenExpires: new Date(Date.now() + 3600000), // 1 hour
          },
        }
      );
      const resetUrl = `${req.protocol}://${await commonHelper.getHost(
        req,
        res
      )}/users/resetPassword?token=${resetToken}`; // Add your URL
      const transporter = await commonHelper.nodeMailer();
      const emailTamplate = await commonHelper.forgetPasswordLinkHTML(
        user,
        resetUrl
      );
      await transporter.sendMail(emailTamplate);
      return commonHelper.success(res, Response.success_msg.passwordLink);
    } catch (error) {
      console.error("Forgot password error:", error);
      return commonHelper.error(
        res,
        Response.error_msg.forgPwdErr,
        error.message
      );
    }
  },
  resetPassword: async (req, res) => {
    try {
      let data = req.user;
      res.render("changePassword", { data: data });
    } catch (error) {
      console.error("Reset password error:", error);
      return commonHelper.error(
        res,
        Response.error_msg.resetPwdErr,
        error.message
      );
    }
  },
  forgotChangePassword: async (req, res) => {
    try {
      const schema = Joi.object().keys({
        _id: Joi.string().required(),
        newPassword: Joi.string().required(),
        confirmPassword: Joi.string().required(),
      });

      let payload = await helper.validationJoi(req.body, schema);
      //Destructing the data
      const { _id, newPassword, confirmPassword } = payload;

      if (newPassword !== confirmPassword) {
        return res.render("passwordNotMatch");
      }

      const user = await Models.userModel.findOne({
         _id: _id 
      });
      if (!user) {
        return commonHelper.failed(res, Response.failed_msg.userNotFound);
      }

      const hashedNewPassword = await commonHelper.bcryptData(
        newPassword,
        process.env.SALT
      );

      await Models.userModel.updateOne(
        { _id: _id }, // Filter by the user's ID
        { $set: { password: hashedNewPassword } } // Update the password field
      );

      return res.render("successPassword", {
        message: Response.success_msg.passwordChange,
      });
    } catch (error) {
      console.error("Error while changing the password", error);
      return commonHelper.error(
        res,
        Response.error_msg.chngPwdErr,
        error.message
      );
    }
  },
  logout: async (req, res) => {
    try {
      const schema = Joi.object().keys({
        deviceToken: Joi.string().required(),
        deviceType: Joi.number().valid(1,2).optional(),
      });

      let payload = await helper.validationJoi(req.body, schema);
      await Models.userModel.updateOne(
        { _id: _id }, // Filter by the user's ID
        { $set: { deviceToken: payload.deviceToken,deviceType:payload.deviceType } } // Update the password field
      );
      return commonHelper.success(res, Response.success_msg.logout);
    } catch (error) {
      console.error("Logout error:", error);
      return commonHelper.error(
        res,
        Response.error_msg.logoutErr,
        error.message
      );
    }
  },
  updateProfile: async (req, res) => {
    try {
      const schema = Joi.object().keys({
        fullName: Joi.string().optional(),
        countryCode: Joi.string().optional()
,       phoneNumber: Joi.string().optional(),
      });

      let payload = await helper.validationJoi(req.body, schema);

        // Handle file upload using commonHelper
        let profilePicturePath = null;
        if (req.files && req.files.profilePicture) {
          profilePicturePath = await commonHelper.fileUpload(
            req.files.profilePicture
          );
        }
      let updateProfile = {
        fullName: payload.fullName,
        countryCode: payload.countryCode,
        phoneNumber: payload.phoneNumber,
        image:profilePicturePath?profilePicturePath:req.user.image
      };

      await Models.userModel.updateOne(
        { _id: _id }, // Filter by the user's ID
        { $set: updateProfile } // Update the  field
      );
    
      const response = await Models.userModel.findOne({
        _id: req.user._id 
     });

      return commonHelper.success(
        res,
        Response.success_msg.updateProfile,
        response
      );
    } catch (error) {
      console.error("Error while updating profile", error);
      return commonHelper.error(
        res,
        Response.error_msg.updPrfErr,
        error.message
      );
    }
  },
  changePassword: async (req, res) => {
    try {
      const schema = Joi.object().keys({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
      });
      let payload = await helper.validationJoi(req.body, schema);

      const { currentPassword, newPassword } = payload;

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        req.user.password
      );

      if (!isPasswordValid) {
        return commonHelper.failed(res, Response.failed_msg.incorrectCurrPwd);
      }

      const hashedNewPassword = await commonHelper.bcryptData(
        newPassword,
        process.env.SALT
      );

      await Models.userModel.updateOne(
        { _id: _id }, // Filter by the user's ID
        { $set: { password: hashedNewPassword } } // Update the password field
      );

      return commonHelper.success(res, Response.success_msg.passwordUpdate);
    } catch (error) {
      console.error("Error while changing password", error);
      return commonHelper.error(
        res,
        Response.error_msg.chngPwdErr,
        error.message
      );
    }
  },
  // sidId is only created once. not everytime
  sidIdGenerate: async (req, res) => {
    try {
      const serviceSid = await commonHelper.sidIdGenerateTwilio(req, res);
      if (!serviceSid) throw new Error("Service SID not generated");
      console.log("==>", serviceSid);
      res.send(serviceSid);
    } catch (error) {
      console.log("error");
      throw error;
    }
  },
  otpSend: async (req, res) => {
    try {
      // if phone number and country code is in different key. then concatinate it.

      //const phone = req.body.countryCode + req.body.phoneNumber;

      const { phoneNumber,countryCode } = req.body; // "+911010101010"; Replace with dynamic input
      const userExist = await Models.userModel.findOne({
          phoneNumber: phoneNumber,
          countryCode: countryCode
      });

      if (userExist) {
        const otpResponse = await otpManager.sendOTP(phone);
        console.log("OTP send status:", otpResponse);

        return commonHelper.success(
          res,
          Response.success_msg.otpSend,
          otpResponse
        );
      } else {
        console.log("User not found");

        return commonHelper.failed(res, Response.failed_msg.userNotFound);
      }
    } catch (error) {
      console.error("Error while sending the OTP:", error);
      return commonHelper.error(
        res,
        Response.error_msg.otpSendErr,
        error.message
      );
    }
  },
  otpVerify: async (req, res) => {
    try {
      const { phoneNumber,countryCode } = req.body; //"+911010101010"; // Replace with dynamic input
      const OTP = "YOUR OTP"; // Replace with dynamic input
      let phone=countryCode+phoneNumber; //
      const otpResponse = await otpManager.verifyOTP(phone, OTP);
      console.log("OTP verify status:", otpResponse);

      if (otpResponse.status === "approved") {
        await Models.userModel.updateOne(
            { _id: userId }, // Filter by the user's ID (_id in MongoDB)
            { $set: { is_otp_verify: 1 } } // Update the is_otp_verify field to 1
          );
        return commonHelper.success(res, Response.success_msg.otpVerify);
      } else {
        throw new Error("OTP verification failed");
      }
    } catch (error) {
      console.error("Error while verifying the OTP:", error);
      return commonHelper.error(
        res,
        Response.error_msg.otpVerErr,
        error.message
      );
    }
  },
  resendOtp: async (req, res) => {
    try {
        const { phoneNumber,countryCode } = req.body; // "+911010101010"; Replace with dynamic input
        const userExist = await Models.userModel.findOne({
            phoneNumber: phoneNumber,
            countryCode: countryCode
        });
      if (userExist) {
        const otpResponse = await otpManager.sendOTP(phone);
        console.log("OTP send status:", otpResponse);

        return commonHelper.success(
          res,
          Response.success_msg.otpSend,
          otpResponse
        );
      } else {
        console.log("User not found");

        return commonHelper.failed(res, Response.failed_msg.userNotFound);
      }
    } catch (error) {
      console.error("Error while resending the OTP:", error);
      return commonHelper.error(
        res,
        Response.error_msg.otpResErr,
        error.message
      );
    }
  },
  addAdddress:async(req,res)=>{
    try {
        const schema = Joi.object().keys({
            fullName: Joi.string().optional(),
            address: Joi.string().optional(),
            countryCode: Joi.string().optional(),
            phoneNumber: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            zipCode: Joi.string().optional(),
            type: Joi.number().valid(1, 2 ,3).optional(),
          });
    
          let payload = await helper.validationJoi(req.body, schema);
          let objToSave={
              fullName:payload.fullName,
              address: payload.address,
              countryCode: payload.countryCode,
              phoneNumber: payload.phoneNumber,
              city: payload.city,
              state: payload.state,
              zipCode: payload.zipCode,
              type: payload.type
          }
          const result = await Models.userModel.updateOne(
            { _id: req.user.id }, // Filter by the user's ID
            { $push: { address: objToSave } } // Add the new address to the address array
          );
        let response=await Models.userModel.findOne({_id: req.user._id})
          if (result.modifiedCount > 0) {
            return commonHelper.success(res,Response.success_msg.address_add_success,response);
          } else {
            return commonHelper.error(
                res,
                Response.error_msg.address_failed_add,
                error.message
              );
          }
    } catch (error) {
        console.log("ERROR:",error)
        throw error
    }
  },
  listOfAddresses:async(req,res)=>{
    try {
        let response=await Models.userModel.findOne({_id:req.user._id})
        return commonHelper.success(res,Response.success_msg.address_add_list,response);

    } catch (error) {
        console.log("error",error)
        throw error
    }
  },

  //Stripe logic

  stripeDetailReturn: async (req, res) => {
    try {
      let response = {
        SK: process.env.stripe_sk_test,
        PK: process.env.stripe_pk_test,
      };
      return commonHelper.success(
        res,
        Response.success_msg.stripe_sk_pk,
        response
      );
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },
  createCard: async (req, res) => {
    try {
      const {cardToken} =req.body
      const response = await stripe.customers.createSource(
        req.user.customerId,
        {
          source: cardToken,
        }
      );
      return commonHelper.success(res,Response.success_msg.card_add , response);
    } catch (err) {
      console.log("error", err); // Fixed: changed commonHelper.error to err
      throw err;
    }
  },
  deleteCard: async (req, res) => {
    try {
      const response = await stripe.customers.deleteSource(
        req.user.customerId,
        req.body.cardId
      );
      return commonHelper.success(res, Response.success_msg.delete_card, response);
    } catch (error) {
      console.log("error", commonHelper.error);
      throw error;
    }
  },
  cardsList: async (req, res) => {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: req.user.customerId,
        type: "card",
      });
      const customer = await stripe.customers.retrieve(req.user.customerId);
      const defaultPaymentMethodId = customer.invoice_settings.default_payment_method;
      // Map through payment methods to add a `isDefault` property
      const cardsWithDefaultFlag = paymentMethods.data.map((card) => {
        const isDefault = card.id === defaultPaymentMethodId;
        return {
          ...card,
          isDefault,
        };
      });

      return commonHelper.success(
        res,
        Response.success_msg.card_list,
        cardsWithDefaultFlag
      );
    } catch (error) {
      console.error("Error retrieving card list:", error);
      throw error;
    }
  },

  // Create payment using card
  createPaymentUsingCard: async (req, res) => {
    try {
      const { amount, cardId } = req.body;
      const response = await stripe.paymentIntents.create({
        amount: parseInt((amount * 100).toFixed(0)),
        currency: "usd",
        customer: req.user.customerId,
        payment_method: cardId,
        confirm: true,
        return_url: "http://localhost:3000/users/cmcUser",
      });
      if (response.status === "succeeded") {
        return commonHelper.success(res, Response.success_msg.payment_success, response);
      } else {
        return commonHelper.error(res, Response.error_msg.payment_failed, response);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      throw error;
    }
  },
  // add bank account first
  stripeConnect: async (req, res) => {
    try {
      let account;
      let accountLink;
      let msg;

      // Check if user has Stripe account associated
      if (req.user && req.user.stripeAccountHas === 0) {
        // Create a new Stripe Express account
        account = await stripe.accounts.create({
          country: "US",
          type: "custom",
          email: req.user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          business_type: "individual",
        });

        // Generate an account link for onboarding
        accountLink = await stripe.accountLinks.create({
          account: account.id,
          refresh_url: stripeReturnUrl, // Change this to your URL
          return_url: stripeReturnUrl, // Change this to your URL
          type: "account_onboarding",
        });

        // Set message for new account creation
        msg = "Account Added Successfully";
      } else {
        // Retrieve the existing Stripe account
        account = await stripe.accounts.retrieve(userDetail.stripeAccountId);

        // If the account is not yet fully onboarded
        if (account.charges_enabled === false) {
          accountLink = await stripe.accountLinks.create({
            account: account.id,
            refresh_url: stripeReturnUrl, // Change this to your URL
            return_url: stripeReturnUrl, // Change this to your URL
            type: "account_onboarding",
          });

          msg = "Account is being onboarded.";
          // Make sure stripeAccountHas is set to 0 for further processing
          const result = await Models.userModel.updateOne(
            { _id: req.user._id }, // Filter by the user's ID
            { $set: { stripeAccountHas: 0 } } // Update the stripeAccountHas field to 0
          );
        } else {
          msg = "Account has already been added.";
        }
      }

      // If accountLink is created, update the user's data
      if (accountLink && accountLink.url) {
        await Models.userModel.updateOne(
            { _id: userId }, // Filter: Find the user by their ID
            {
              $set: {
                stripeAccountId: account.id, // Save the Stripe Account ID
                stripeAccountHas: 1, // Indicate the account has been added
              },
            }
          );
      }

      // Send the response with the account link URL for user to complete onboarding
      return commonHelper.success(res, msg, {
        accountlink: accountLink ? accountLink.url : "",
      });
    } catch (error) {
      console.error("Error during Stripe account creation:", error);
      return commonHelper.error(
        res,
        "Error during account setup.",
        error.message
      );
    }
  },
  stripe_connect_return: async (req, res) => {
    try {
      let stripeAccountHas;
      let state = req.query.state;
      const userData = await Models.userModel.findOne({_id: state  });
      const responseData = await stripe.accounts.retrieve(
        userData.stripeAccountId
      );
      if (responseData?.charges_enabled == false) {
        stripeAccountHas = 0;
      } else {
        stripeAccountHas = 1;
      }

      await Models.userModel.updateOne(
        { _id: state }, // Filter: Find the user by their ID
        {
          $set: {
            stripeAccountId: responseData.id, // Save the Stripe Account ID
            stripeAccountHas: stripeAccountHas, // Indicate the account has been added
          },
        }
      );
      
      let msg = "ACCOUNT CONNECTED SUCCESSFULLY";
      return;
    } catch (err) {
      throw err;
    }
  },
  transfer_payment: async (req, res) => {
    try {
      let transfer = await stripe.transfers.create({
        amount: parseInt((amount * 100).toFixed(0)),
        currency: "usd",
        destination: recieverDetail.stripeAccountId,
      });
      if (transfer && transfer.id) {
        return commonHelper.success(res,Response.success_msg.fundTransfer,response);
      }
    } catch (err) {
      throw err;
    }
  },
  addExternalBankAccount: async (req, res) => {
    try {
      // Bank account details (replace with req.body if dynamic input is required)
      const bankAccountDetails = {
        // accountHolderName: "Test name",
        // routingNumber: "110000000",
        // accountNumber: "000123456789",
        accountHolderName: req.body.accountHolderName ,
        routingNumber: req.body.routingNumber ,
        accountNumber: req.body.accountNumber,
      };

      // Add the bank account
      const result = await addBankAccountToConnectedAccount(
        user.stripeAccountId,
        bankAccountDetails
      );
      return commonHelper.success(res, Response.success_msg.external_bank_success, result);
    } catch (error) {
      console.error("Error adding external bank account:", error.message);
      res.status(500).send({ message: error.message });
    }
  },
  makeDefaultBankAccount : async (req, res) => {
    try {
        const { bankAccountId } = req.body; // Pass the bank account ID in the request body
        // Update the bank account to make it the default
        const updatedBankAccount = await stripe.accounts.updateExternalAccount(
        user.stripeAccountId,
        bankAccountId,
        {
            default_for_currency: true, // Sets this bank account as default
        }
        );

        return commonHelper.success(res, Response.success_msg.default_bank_success, updatedBankAccount);

    } catch (error) {
        console.error("Error setting default bank account:", error.message);
        res.status(500).send({ message: error.message });
    }
  },
  bankAccountList: async (req, res) => {
    try {
      const bankAccounts = await stripe.accounts.listExternalAccounts(
        req.user.stripeAccountId,
        {
          object: "bank_account",
        }
      );
      return commonHelper.success(res, Response.success_msg.bankAccountList, bankAccounts);
    } catch (error) {
      console.error("Error fetching bank account list", error.message);
      res.status(500).send({ message: error.message });
    }
  },
  deleteExternalAccount: async (req, res) => {
    try {
      // Fetch the bank account ID to delete from the request body
      const { bankAccountId } = req.body;
      // Delete the selected external bank account from the Stripe account
      await stripe.accounts.deleteExternalAccount(
        user.stripeAccountId,
        bankAccountId
      );
      return commonHelper.success(res, Response.success_msg.external_bank_delete_success);
    } catch (error) {
      console.error("Error deleting external bank account:", error.message);
      res.status(500).send({ message: error.message });
    }
  },


// Rider account


};
