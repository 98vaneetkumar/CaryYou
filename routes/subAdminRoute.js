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

    router.get("/bannerList",sessionSubAdmin, controllers.subAdminController.bannerList);
    router.get("/addBanner_view",sessionSubAdmin, controllers.subAdminController.addBanner_view)
    router.post("/addBanner",sessionSubAdmin, controllers.subAdminController.create_Bannner)
    router.post("/delete_banner",sessionSubAdmin, controllers.subAdminController.deleteBanner)

    router.post("/restaurantDashboardFilter",sessionSubAdmin, controllers.subAdminController.restaurant_dashboard_filter)
    router.post('/restaurant_status', controllers.subAdminController.restaurant_status)


    router.get("/restaurant_category",sessionSubAdmin, controllers.subAdminController.restaurant_category)
    router.get("/add_category",sessionSubAdmin, controllers.subAdminController.add_category)
    router.post("/Create_category",sessionSubAdmin, controllers.subAdminController.Create_category)
    router.get("/edit_category/:_id",sessionSubAdmin, controllers.subAdminController.edit_category)
    router.post("/update_category",sessionSubAdmin, controllers.subAdminController.update_category)


    router.get("/restaurant_subCategory",sessionSubAdmin, controllers.subAdminController.restaurant_subCategory)
    router.get("/add_subCategory",sessionSubAdmin, controllers.subAdminController.add_subCategory)
    router.post("/Create_subCategory",sessionSubAdmin, controllers.subAdminController.Create_subCategory)
    router.get("/edit_subCategory/:_id",sessionSubAdmin, controllers.subAdminController.edit_subCategory)
    router.post("/update_subCategory",sessionSubAdmin, controllers.subAdminController.update_subCategory)
    

    router.get("/restaurant_product",sessionSubAdmin, controllers.subAdminController.restaurant_product)
    router.get("/add_product",sessionSubAdmin, controllers.subAdminController.add_product)
    router.post("/Create_product",sessionSubAdmin, controllers.subAdminController.Create_product)
    router.get("/edit_product/:_id",sessionSubAdmin, controllers.subAdminController.edit_product)
    router.post("/update_product",sessionSubAdmin, controllers.subAdminController.update_product)
    router.post("/delete_product",sessionSubAdmin, controllers.subAdminController.delete_product)
    router.post("/product_status",sessionSubAdmin, controllers.subAdminController.product_status)
    router.get("/restaurant_product_view/:_id",sessionSubAdmin, controllers.subAdminController.restaurant_product_view)


    //<------------------------------ Orders ------------------------->
    router.get('/order_list', sessionSubAdmin, controllers.subAdminController.order_list);
    router.get('/view_order/:_id', sessionSubAdmin, controllers.subAdminController.view_order);

    router.get('/active_order_list', sessionSubAdmin, controllers.subAdminController.active_order_list);
    router.get('/active_view_order/:_id', sessionSubAdmin, controllers.subAdminController.active_view_order);

    router.get('/delivered_order_list', sessionSubAdmin, controllers.subAdminController.delivered_order_list);
    router.get('/delivered_view_order/:_id', sessionSubAdmin, controllers.subAdminController.delivered_view_order);

    router.get('/cancel_order_list', sessionSubAdmin, controllers.subAdminController.cancel_order_list);
    router.get('/cancel_view_order/:_id', sessionSubAdmin, controllers.subAdminController.cancel_view_order);


    router.get('/pending_order_list', sessionSubAdmin, controllers.subAdminController.pending_order_list);
    router.get('/pending_view_order/:_id', sessionSubAdmin, controllers.subAdminController.pending_view_order);


    return router
}



