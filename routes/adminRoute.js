var express = require('express');
var router = express.Router();
const controllers = require('../controllers/index.js')
const { session } = require('../helpers/commonHelper.js')


module.exports=function(io){
// router.get('*', adminController.login_page)
router.get('/login',controllers.adminController.login_page)
router.post('/Login', controllers.adminController.Login)
router.get('/dashboard', session, controllers.adminController.dashboard)
router.post('/dashboardFilter', session, controllers.adminController.dashboardFilter)
router.get("/logout", controllers.adminController.logout)
//<------------------------------ User ------------------------->
router.get('/user_list', session, controllers.adminController.user_list)
router.get('/view_user/:id', session, controllers.adminController.view_user)
router.delete('/delete_user/:id', controllers.adminController.delete_user)
router.post('/user_status', controllers.adminController.user_status)

//<------------------------------ User Orders------------------------->
router.post('/user_dashboardFilter', session, controllers.adminController.user_dashboardFilter)

router.get("/user_order_list/:userId",session, controllers.adminController.total_user_order_list);
router.get('/user_view_order/:_id', session, controllers.adminController.total_user_view_order);

router.get("/user_success_order_list/:userId",session, controllers.adminController.user_success_order_list)
router.get('/user_success_view_order/:_id', session, controllers.adminController.user_success_view_order);

router.get("/user_pending_order_list/:userId",session, controllers.adminController.user_pending_order_list)
router.get('/user_pending_view_order/:_id', session, controllers.adminController.user_pending_view_order);


router.get("/user_cancel_order_list/:userId",session, controllers.adminController.user_cancel_order_list)
router.get('/user_cancel_view_order/:_id', session, controllers.adminController.user_cancel_view_order);

//<------------------------------ Restaurant ------------------------->
router.get('/restaurant_list', session, controllers.adminController.restaurant_list)
router.get('/view_restaurant/:id', session, controllers.adminController.view_restaurant)
router.post("/restaurantDashboardFilter",session, controllers.adminController.restaurant_dashboard_filter)
router.delete('/delete_rastaurant/:id', controllers.adminController.delete_restaurant)
router.post('/restaurant_status', controllers.adminController.restaurant_status)


//<------------------------------ Restaurant Orders ------------------------->

router.get('/restaurant_order_list/:_id', session, controllers.adminController.restaurant_order_list);
router.get('/restaurant_view_order/:_id', session, controllers.adminController.restaurant_view_order);

router.get('/restaurant_active_order_list/:_id', session, controllers.adminController.restaurant_active_order_list);
router.get('/restaurant_active_view_order/:_id', session, controllers.adminController.restaurant_active_view_order);

router.get('/restaurant_delivered_order_list/:_id', session, controllers.adminController.restaurant_delivered_order_list);
router.get('/restaurant_delivered_view_order/:_id', session, controllers.adminController.restaurant_delivered_view_order);

router.get('/restaurant_cancel_order_list/:_id', session, controllers.adminController.restaurant_cancel_order_list);
router.get('/restaurant_cancel_view_order/:_id', session, controllers.adminController.restaurant_cancel_view_order);


router.get('/restaurant_pending_order_list/:_id', session, controllers.adminController.restaurant_pending_order_list);
router.get('/restaurant_pending_view_order/:_id', session, controllers.adminController.restaurant_pending_view_order);


router.get('/restaurant_return_order_list/:_id', session, controllers.adminController.restaurant_return_order_list);
router.get('/restaurant_return_view_order/:_id', session, controllers.adminController.restaurant_return_view_order);


router.get("/restaurant_category/:_id",session, controllers.adminController.restaurant_category)
router.get("/restaurant_subCategory/:_id",session, controllers.adminController.restaurant_subCategory)
router.get("/restaurant_product/:_id",session, controllers.adminController.restaurant_product)
router.get("/restaurant_product_view/:restaurantId/:_id",session, controllers.adminController.restaurant_product_view)

//<------------------------------ Rider ------------------------->
router.get('/rider_list', session, controllers.adminController.rider_list)
router.get('/view_rider/:id', session, controllers.adminController.view_rider)
router.get('/view_ride_detail/:id', session, controllers.adminController.view_ride_detial)

router.delete('/delete_rider/:id', controllers.adminController.delete_rider)
router.post('/rider_status', controllers.adminController.rider_status)

//<------------------------------ Vechicle ------------------------->
router.get('/vehicleType_list', session, controllers.adminController.vehicleType_list);
router.get('/edit_vehicleType/:id', session, controllers.adminController.edit_vehicleType);
router.post('/delete_vehicleType', session, controllers.adminController.delete_vehicleType);
router.post('/vehicleType_status', session, controllers.adminController.vehicleType_status);
router.get('/add_vehicleType', session, controllers.adminController.add_vehicleType);
router.post('/create_vehicleType', session, controllers.adminController.create_vehicleType);
router.post('/update_vehicleType', session, controllers.adminController.update_vehicleType);

//<------------------------------ Orders ------------------------->
router.get('/order_list', session, controllers.adminController.order_list);
router.get('/view_order/:_id', session, controllers.adminController.view_order);

router.get('/active_order_list', session, controllers.adminController.active_order_list);
router.get('/active_view_order/:_id', session, controllers.adminController.active_view_order);

router.get('/delivered_order_list', session, controllers.adminController.delivered_order_list);
router.get('/delivered_view_order/:_id', session, controllers.adminController.delivered_view_order);

router.get('/cancel_order_list', session, controllers.adminController.cancel_order_list);
router.get('/cancel_view_order/:_id', session, controllers.adminController.cancel_view_order);


router.get('/pending_order_list', session, controllers.adminController.pending_order_list);
router.get('/pending_view_order/:_id', session, controllers.adminController.pending_view_order);


router.get('/return_order_list', session, controllers.adminController.return_order_list);
router.get('/return_view_order/:_id', session, controllers.adminController.return_view_order);

//<------------------------------ ADMIN ------------------------->
router.get('/create_subadmin', session, controllers.adminController.create_subadmin)
router.get('/admin_profile', session, controllers.adminController.admin_profile)
router.post('/update_admin_profile', controllers.adminController.update_admin_profile)
router.get('/change_password', session, controllers.adminController.change_password)
router.post('/Update_password', controllers.adminController.Update_password)

router.post('/update_commission',session,controllers.adminController.update_commission)
router.get('/admin_commission', session, controllers.adminController.admin_commission)

//CMS User// 

router.post('/Create', controllers.cmsController.Create)
router.post('/Update_aboutus',  controllers.cmsController.Update_aboutus)
router.post('/Update_terms',  controllers.cmsController.Update_terms)

router.get('/user/privacy_policy', session,  controllers.cmsController.privacy_policy_user)
router.get('/user/terms_condition', session,  controllers.cmsController.terms_condition_user)
router.get('/user/Aboutus', session,  controllers.cmsController.Aboutus_user)

//restaurant cms
router.get('/restaurant/privacy_policy', session,  controllers.cmsController.privacy_policy_restaurant)
router.get('/restaurant/terms_condition', session,  controllers.cmsController.terms_condition_restaurant)
router.get('/restaurant/Aboutus', session,  controllers.cmsController.Aboutus_restaurant)

//rider cms
router.get('/rider/privacy_policy', session,  controllers.cmsController.privacy_policy_rider)
router.get('/rider/terms_condition', session,  controllers.cmsController.terms_condition_rider)
router.get('/rider/Aboutus', session,  controllers.cmsController.Aboutus_rider)
return router;
}

// module.exports = router;