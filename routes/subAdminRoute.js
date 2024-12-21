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


    //<------------------------------ subAdmin ------------------------->
    router.get('/subAdmin_profile', sessionSubAdmin, controllers.subAdminController.subAdmin_profile)
    router.post('/update_subAdmin_profile', controllers.subAdminController.update_subAdmin_profile)
    router.get('/change_password', sessionSubAdmin, controllers.subAdminController.change_password)
    router.post('/Update_password', controllers.subAdminController.Update_password)

    router.post('/update_commission',sessionSubAdmin,controllers.subAdminController.update_commission)
    router.get('/subAdmin_commission', sessionSubAdmin, controllers.subAdminController.subAdmin_commission)

    // router.post('/Create', controllers.cmsController.Create)
    // router.get('/Aboutus', sessionSubAdmin,  controllers.cmsController.Aboutus_user)
    // router.post('/Update_aboutus',  controllers.cmsController.Update_aboutus)
    // router.get('/terms_condition', sessionSubAdmin,  controllers.cmsController.terms_condition_user)
    // router.post('/Update_terms',  controllers.cmsController.Update_terms)
    // router.get('/privacy_policy', sessionSubAdmin,  controllers.cmsController.privacy_policy_user)

    router.get("/bannerList/:_id",sessionSubAdmin, controllers.subAdminController.bannerList);
    router.post("/addBanner_view",sessionSubAdmin, controllers.subAdminController.addBanner_view)
    router.post("/delete_banner",sessionSubAdmin, controllers.subAdminController.deleteBanner)

    router.post("/restaurantDashboardFilter",sessionSubAdmin, controllers.subAdminController.restaurant_dashboard_filter)
    router.post('/restaurant_status', controllers.subAdminController.restaurant_status)


    router.get("/restaurant_category/:_id",sessionSubAdmin, controllers.subAdminController.restaurant_category)
    router.get("/add_category/:_id",sessionSubAdmin, controllers.subAdminController.add_category)
    router.post("/Create_category",sessionSubAdmin, controllers.subAdminController.Create_category)
    router.get("/edit_category/:resturantId/:_id",sessionSubAdmin, controllers.subAdminController.edit_category)
    router.post("/update_category",sessionSubAdmin, controllers.subAdminController.update_category)
    router.get("/restaurant_subCategory/:_id",sessionSubAdmin, controllers.subAdminController.restaurant_subCategory)
    router.get("/restaurant_product/:_id",sessionSubAdmin, controllers.subAdminController.restaurant_product)
    router.get("/restaurant_product_view/:restaurantId/:_id",sessionSubAdmin, controllers.subAdminController.restaurant_product_view)


    //<------------------------------ Orders ------------------------->
    router.get('/order_list/:_id', sessionSubAdmin, controllers.subAdminController.order_list);
    router.get('/view_order/:_id', sessionSubAdmin, controllers.subAdminController.view_order);

    router.get('/active_order_list/:_id', sessionSubAdmin, controllers.subAdminController.active_order_list);
    router.get('/active_view_order/:_id', sessionSubAdmin, controllers.subAdminController.active_view_order);

    router.get('/delivered_order_list/:_id', sessionSubAdmin, controllers.subAdminController.delivered_order_list);
    router.get('/delivered_view_order/:_id', sessionSubAdmin, controllers.subAdminController.delivered_view_order);

    router.get('/cancel_order_list/:_id', sessionSubAdmin, controllers.subAdminController.cancel_order_list);
    router.get('/cancel_view_order/:_id', sessionSubAdmin, controllers.subAdminController.cancel_view_order);


    router.get('/pending_order_list/:_id', sessionSubAdmin, controllers.subAdminController.pending_order_list);
    router.get('/pending_view_order/:_id', sessionSubAdmin, controllers.subAdminController.pending_view_order);


    return router
}



