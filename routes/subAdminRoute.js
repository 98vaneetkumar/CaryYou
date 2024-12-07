var express = require('express');
var router = express.Router();
const controllers = require('../controllers/index.js')
const { sessionSubAdmin } = require('../helpers/commonHelper.js')

module.exports=function(io){
    // router.get('*', subAdminController.login_page)
    router.get('/login',controllers.subAdminController.login_page)
    router.post('/Login', controllers.subAdminController.Login)
    router.get('/dashboard', sessionSubAdmin, controllers.subAdminController.dashboard)
    router.get("/logout", controllers.subAdminController.logout)

    router.get('/user_list', sessionSubAdmin, controllers.subAdminController.user_list)
    router.get('/view_user/:id', sessionSubAdmin, controllers.subAdminController.view_user)
    router.delete('/delete_user/:id', controllers.subAdminController.delete_user)
    router.post('/user_status', controllers.subAdminController.user_status)


    //<------------------------------ subAdmin ------------------------->
    router.get('/subAdmin_profile', sessionSubAdmin, controllers.subAdminController.subAdmin_profile)
    router.post('/update_subAdmin_profile', controllers.subAdminController.update_subAdmin_profile)
    router.get('/change_password', sessionSubAdmin, controllers.subAdminController.change_password)
    router.post('/Update_password', controllers.subAdminController.Update_password)

    router.post('/update_commission',sessionSubAdmin,controllers.subAdminController.update_commission)
    router.get('/subAdmin_commission', sessionSubAdmin, controllers.subAdminController.subAdmin_commission)
    // //CMS//
    // router.post('/Create', controllers.cmsController.Create)
    router.get('/Aboutus', sessionSubAdmin,  controllers.cmsController.Aboutus)
    router.post('/Update_aboutus',  controllers.cmsController.Update_aboutus)
    router.get('/terms_condition', sessionSubAdmin,  controllers.cmsController.terms_condition)
    router.post('/Update_terms',  controllers.cmsController.Update_terms)
    router.get('/privacy_policy', sessionSubAdmin,  controllers.cmsController.privacy_policy)

    return router
}



