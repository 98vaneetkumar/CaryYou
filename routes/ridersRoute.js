const express = require('express');
const router = express.Router();
const controller=require("../controllers/index")
const {authentication,forgotPasswordVerify} = require('../middlewares/authentication');



module.exports = (io)=>{
    //common user controller api call
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
     //Deriver details
    router.post("/licenseDetailsAdd",authentication, controller.riderController.licenseDetailsAdd);
    router.put("/licenseDetailsUpdate", authentication, controller.riderController.licenseDetailsUpdate)
    router.post("/feedBackSend", authentication, controller.riderController.feedBackSend)
    router.post("/deleteFile", controller.riderController.deleteFile)
    //stripe apis
    
    router.get("/stripeDetail",authentication,controller.userController.stripeDetailReturn)
    router.post("/stripeConnect",authentication,controller.userController.stripeConnect)
    router.post("/stripe_connect_return",authentication,controller.userController.stripe_connect_return)
    router.post("/addExternalBankAccount",authentication,controller.userController.addExternalBankAccount)
    router.post("/makeDefaultBankAccount",authentication,controller.userController.makeDefaultBankAccount)
    router.get("/bankAccountList",authentication, controller.userController.bankAccountList)
    router.post("/deleteExternalAccount",authentication,controller.userController.deleteExternalAccount)


    return router
}