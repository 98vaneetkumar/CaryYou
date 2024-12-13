
var express = require('express');
var router = express.Router();
const controller=require("../controllers/index")




router.post('/createOrder', controller.testController.createOrder);


// Route to make an order active
router.post('/active', controller.testController.makeOrderActive);

// Route to mark an order as delivered
router.post('/delivered', controller.testController.markOrderDelivered);

// Route to cancel an order
router.post('/cancel', controller.testController.cancelOrder);





router.post('/createRestaurant', controller.testController.createRestaurant);

router.post('/updateRestaurant', controller.testController.updateRestaurant);


router.post('/createCategory', controller.testController.createCategory);

router.post('/createSubCategory', controller.testController.createSubCategory);

router.get("/restaurantProduct",controller.testController.restaurantProduct);



module.exports = router



