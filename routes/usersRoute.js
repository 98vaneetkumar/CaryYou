var express = require('express');
var router = express.Router();
const controller=require("../controllers/index")
const {authentication,forgotPasswordVerify} = require('../middlewares/authentication');



module.exports = function(io){
   router.post("/signUp",controller.userController.signUp);
   router.post('/login', controller.userController.login);
   router.post("/socialLogin", controller.userController.socialLogin);
   router.post("/deleteAccount",authentication,controller.userController.deleteAccount);
   router.post('/logout', authentication, controller.userController.logout);
   router.patch('/updateProfile', authentication, controller.userController.updateProfile);
   router.post('/forgotPassword', controller.userController.forgotPassword);
   router.get('/resetPassword', forgotPasswordVerify, controller.userController.resetPassword);
   router.post('/forgotChangePassword', controller.userController.forgotChangePassword);
   router.post('/changePassword', authentication, controller.userController.changePassword);
   router.get('/sidIdGenerate', controller.userController.sidIdGenerate);
   router.post('/otpSend', controller.userController.otpSend);
   router.post('/otpVerify', controller.userController.otpVerify);
   router.post('/resendOtp', controller.userController.resendOtp);
   router.post("/addAddress",authentication,controller.userController.addAdddress)
   router.get("/addressList",authentication,controller.userController.listOfAddresses)

   //Stripe api's
   router.get("/stripeDetail",authentication,controller.userController.stripeDetailReturn)
   router.post("/createCard",authentication,controller.userController.createCard)
   router.post("/deleteCard",authentication,controller.userController.deleteCard)
   router.get("/cardsList",authentication,controller.userController.cardsList)
   router.post("/createPaymentUsingCard",authentication,controller.userController.createPaymentUsingCard)
   router.post("/transfer_payment",authentication,controller.userController.transfer_payment)
   router.post("/stripeConnect",authentication,controller.userController.stripeConnect)
   router.post("/stripe_connect_return",authentication,controller.userController.stripe_connect_return)
   router.post("/addExternalBankAccount",authentication,controller.userController.addExternalBankAccount)
   router.post("/makeDefaultBankAccount",authentication,controller.userController.makeDefaultBankAccount)
   router.get("/bankAccountList",authentication, controller.userController.bankAccountList)
   router.post("/deleteExternalAccount",authentication,controller.userController.deleteExternalAccount)


   // Rider routers



  return router
};
