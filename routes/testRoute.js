
var express = require('express');
var router = express.Router();
const controller=require("../controllers/index")






router.post('/createOrder', controller.testController.createOrder);
router.post('/createRestaurant', controller.testController.createRestaurant);


// Route to make an order active
router.post('/active', controller.testController.makeOrderActive);

// Route to mark an order as delivered
router.post('/delivered', controller.testController.markOrderDelivered);

// Route to cancel an order
router.post('/cancel', controller.testController.cancelOrder);


module.exports = router



