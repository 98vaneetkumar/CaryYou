const Models = require("../Models/index");

module.exports = {
  createOrder: async (req, res) => {
    try {
      // Define the title (only for response purposes)
      const title = "Create Demo Order";

      // Sample demo order data
      const demoOrder = {
        orderBy: "675449f250481a79e5d4ee95", // Replace with a valid user ID
        restaurant: "675479a8ba9c2d01336fb343", // Replace with a valid restaurant ID
        price: "79.99",
        item: "Pizza",
        status: 1, // 1 for Pending
        rider: "675150c86b2e0e72def70281", // Replace with a valid rider ID
        riderTip: 1.0,
        orderPickUpTime: new Date(),
        orderPickUpDate: new Date(),
        orderDeliveredTime: null,
        orderDeliveredDate: null,
      };

      // Save the demo order to the database
      const orderData = await Models.orderModel.create(demoOrder);

      // Return success response with title
      res.status(201).json({
        success: true,
        message: "Demo order created successfully",
        title: title, // Send the title
        order: orderData, // Send the created order data in the response
      });
    } catch (error) {
      console.error("Error creating demo order:", error);
      res.status(500).json({
        success: false,
        message: "Error creating demo order",
      });
    }
  },

  makeOrderActive: async (req, res) => {
    try {
      // Get the order ID (_id) from the request body
      const { _id } = req.body;

      // Find the order by ID using Mongoose's findById method
      const order = await Models.orderModel.findById(_id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Define the title (only for response purposes)
      const title = "Make Order Active";

      // Update the order status to 'active' (status code 2)
      order.status = 2; // 2 could represent 'Active'
      await order.save();

      // Return success response with title and updated order data
      res.status(200).json({
        success: true,
        message: "Order is now active",
        title: title, // Send the title
        order: order, // Send the updated order data
      });
    } catch (error) {
      console.error("Error making order active:", error);
      res.status(500).json({
        success: false,
        message: "Error making order active",
      });
    }
  },

  // Mark Order as Delivered
  markOrderDelivered: async (req, res) => {
    try {
      const { _id } = req.body; // Get order ID from request body

      // Find the order by ID using Mongoose's findById method
      const order = await Models.orderModel.findById(_id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Define the title (only for response purposes)
      const title = "Mark Order Delivered";

      // Update the order status to 'delivered' (status code 3)
      order.status = 3; // 3 could represent 'Delivered'
      order.orderDeliveredDate = new Date();
      order.orderDeliveredTime = new Date();
      await order.save();

      // Return success response with title and updated order data
      res.status(200).json({
        success: true,
        message: "Order marked as delivered",
        title: title, // Send the title
        order: order, // Send the updated order data
      });
    } catch (error) {
      console.error("Error marking order as delivered:", error);
      res.status(500).json({
        success: false,
        message: "Error marking order as delivered",
      });
    }
  },

  // Cancel Order with a Reason
  cancelOrder: async (req, res) => {
    try {
      const { _id, cancelReason } = req.body; // Get order ID and cancel reason from request body

      // Find the order by ID using Mongoose's findById method
      const order = await Models.orderModel.findById(_id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }

      // Define the title (only for response purposes)
      const title = "Cancel Order";

      // Update the order status to 'cancelled' (status code 4) and add cancel reason
      order.status = 4; // 4 could represent 'Cancelled'
      order.cancelReason = cancelReason || "Customer requested cancellation"; // Use provided cancel reason or default
      await order.save();

      // Return success response with title and updated order data
      res.status(200).json({
        success: true,
        message: "Order has been cancelled",
        title: title, // Send the title
        order: order, // Send the updated order data
      });
    } catch (error) {
      console.error("Error cancelling order:", error);
      res.status(500).json({
        success: false,
        message: "Error cancelling order",
      });
    }
  },

  createRestaurant: async (req, res) => {
    try {
      // Define the title (only for response purposes)
      const title = "Create Demo restaurant";

      const demoRes = {
        name: "3b2 restaurant",
      };

      const resData = await Models.restaurantModel.create(demoRes);

      // Return success response
      res.status(201).json({
        success: true,
        message: "Demo restaurant created successfully",
        order: resData,
      });
    } catch (error) {
      console.error("Error creating demo restaurant:", error);
      res.status(500).json({
        success: false,
        message: "Error creating demo restaurant",
      });
    }
  },
};
