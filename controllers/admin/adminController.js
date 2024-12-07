const Models = require("../../Models/index");
const bcrypt = require("bcrypt");
const helper = require("../../helpers/commonHelper.js");
const { trusted } = require("mongoose");

module.exports = {
  login_page: async (req, res) => {
    res.render("Admin/login_page", { layout: false, msg: req.flash("msg") });
  },

  Login: async (req, res) => {
    try {
      let findUser = await Models.userModel.findOne({
        role: 0,
        email: req.body.email,
      });
      if (!findUser) {
        console.log("Please enter valid email");
        req.flash("msg", "Incorrect email");
        res.redirect("/admin/login");
      }

      let checkPassword = await bcrypt.compare(
        req.body.password,
        findUser.password
      );
      if (!checkPassword) {
        req.flash("msg", "Incorrect password");
        res.redirect("/admin/login");
      } else {
        req.session.user = findUser;
        req.flash("msg", "Login Successfully");
        setTimeout(() => {
          res.redirect("/admin/dashboard");
        }, 500);
      }
    } catch (error) {
      console.log(error);
    }
  },
  logout: async (req, res) => {
    try {
      req.session.destroy((err) => {});
      res.redirect("/admin/login");
    } catch (error) {
      helper.error(res, error);
    }
  },
//<------------------Dashboard---------------->
  dashboard: async (req, res) => {
    try {
      let title = "dashboard";
      let user = await Models.userModel.countDocuments({ role: 1 });
      let provider = await Models.restaurantModel.countDocuments();
      let rider = await Models.userModel.countDocuments({ role: 3 });
      let vehicleType = await Models.vehicleTypeModel.countDocuments();
      const orders = await Models.orderModel.countDocuments();
      const feedbacks = await Models.feedBackModel.countDocuments();
      const activeOrders = await Models.orderModel.countDocuments({ status: 1 });
      const deliveredOrders = await Models.orderModel.countDocuments({ status: 2});
      const cancelledOrders = await Models.orderModel.countDocuments({ status: 3 });
      res.render("Admin/dashboard", {
        title,
        user,
        provider: provider,
        servicesData: 0,
        contactUs: 0,
        rider,
        orders: orders,
        vehicleType,
        payments: 2,
        feedbacks: feedbacks,
        activeOrders: activeOrders,
        deliveredOrders: deliveredOrders,
        cancelledOrders: cancelledOrders,
        session: req.session.user,
        msg: req.flash("msg") || "",
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  dashboardFilter: async (req, res) => {
    try {
      const title = "dashboard";
      const filter = req.body.filter || "all"; // Get the filter parameter from the query string
  
      // Calculate date range based on the filter
      const now = new Date();
      let startDate, endDate;
  
      switch (filter) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case "weekly":
          startDate = new Date(now.setDate(now.getDate() - 7));
          endDate = new Date();
          break;
        case "monthly":
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          endDate = new Date();
          break;
        case "3months":
          startDate = new Date(now.setMonth(now.getMonth() - 3));
          endDate = new Date();
          break;
        case "6months":
          startDate = new Date(now.setMonth(now.getMonth() - 6));
          endDate = new Date();
          break;
        case "1year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          endDate = new Date();
          break;
        case "5years":
          startDate = new Date(now.setFullYear(now.getFullYear() - 5));
          endDate = new Date();
          break;
        default:
          startDate = null; // No date filter
          endDate = null;
      }
  
      // Define the query object for date-based filtering
      const dateQuery = startDate && endDate ? { createdAt: { $gte: startDate, $lte: endDate } } : {};
  
      // Fetch filtered data
      const user = await Models.userModel.countDocuments({ role: 1, ...dateQuery });
      const provider = await Models.restaurantModel.countDocuments({ ...dateQuery });
      const rider = await Models.userModel.countDocuments({ role: 3, ...dateQuery });
      const vehicleType = await Models.vehicleTypeModel.countDocuments(dateQuery);
      const orders = await Models.orderModel.countDocuments(dateQuery);
      // const payments = await Models.paymentModel.countDocuments(dateQuery);
      const feedbacks = await Models.feedBackModel.countDocuments(dateQuery);
      const activeOrders = await Models.orderModel.countDocuments({ status: 1, ...dateQuery });
      const deliveredOrders = await Models.orderModel.countDocuments({ status: 2, ...dateQuery });
      const cancelledOrders = await Models.orderModel.countDocuments({ status: 3, ...dateQuery });
      // const contactUs = await Models.contactUsModel.countDocuments(dateQuery);
      // const servicesdata = await Models.serviceModel.countDocuments(dateQuery);
      console.log("user", user)

      res.json({
        user,
        provider,
        rider,
        vehicleType,
        orders,
        payments: 0,
        feedbacks,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        contactus: 0,
        servicesData: 0,
      });
      // Render the dashboard with the filtered data

     
    } catch (error) {
      console.error("Error in dashboard:", error);
      res.status(500).send("Internal Server Error");
    }
  },
//<----------------------User------------------->
  user_list: async (req, res) => {
    try {
      let title = "user_list";
      let userdata = await Models.userModel
        .find({ role: 1 })
        .sort({ createdAt: -1 });

      res.render("Admin/user/user_list", {
        title,
        userdata,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  view_user: async (req, res) => {
    try {
      let title = "user_list";
      let viewuser = await Models.userModel.findById({ _id: req.params.id });
      // console.log(viewuser,"viewuserviewuserviewuserviewuser");return
      res.render("Admin/user/view_user", {
        title,
        viewuser,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  delete_user: async (req, res) => {
    try {
      let userid = req.body.id;
      let remove = await Models.userModel.deleteOne({ _id: userid });
      res.redirect("/admin/user_list");
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  user_status: async (req, res) => {
    try {
      var check = await Models.userModel.updateOne(
        { _id: req.body.id },
        { status: req.body.value }
      );
      req.flash("msg", "Status update successfully");

      if (req.body.value == 0) res.send(false);
      if (req.body.value == 1) res.send(true);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },


  //<----------------------Restaurant------------------->
  restaurant_list: async (req, res) => {
    try {
      let title = "provider_list";
      let userdata = await Models.restaurantModel
        .find()
        .populate("userId")
        .sort({ createdAt: -1 });
      res.render("Admin/restaurant/restaurant_list", {
        title,
        userdata,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  view_restaurant: async (req, res) => {
    try {
      let title = "provider_list";
      let viewuser = await Models.restaurantModel.findById({ _id: req.params.id }).populate("userId");
      const orders = await Models.orderModel.countDocuments();
      const activeOrders = await Models.orderModel.countDocuments({ status: 1 ,restaurant:req.params.id });
      const deliveredOrders = await Models.orderModel.countDocuments({ status: 2,restaurant:req.params.id});
      const cancelledOrders = await Models.orderModel.countDocuments({ status: 3,restaurant:req.params.id });
      res.render("Admin/restaurant/restaurant_view", {
        title,
        viewuser,
        orders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  delete_restaurant: async (req, res) => {
    try {
      let userid = req.body.id;
      let remove = await Models.userModel.deleteOne({ _id: userid });
      res.redirect("/admin/user_list");
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  restaurant_status: async (req, res) => {
    try {
      var check = await Models.restaurantModel.updateOne(
        { _id: req.body.id },
        { status: req.body.value }
      );
      req.flash("msg", "Status update successfully");

      if (req.body.value == 0) res.send(false);
      if (req.body.value == 1) res.send(true);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  //---------riders list apis--------------

  rider_list: async (req, res) => {
    try {
      let title = "rider_list";
      let riderdata = await Models.userModel
        .find({ role: 3 })
        .sort({ createdAt: -1 });
      res.render("Admin/rider/rider_list", {
        title,
        riderdata,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  view_rider: async (req, res) => {
    try {
      let title = "rider_list";
      let viewrider = await Models.userModel.findById({ _id: req.params.id });
      // console.log(viewrider,"viewriderviewriderviewriderviewrider");return
      res.render("Admin/rider/view_rider", {
        title,
        viewrider,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  delete_rider: async (req, res) => {
    try {
      let riderid = req.body.id;
      let remove = await Models.userModel.deleteOne({ _id: riderid });
      res.redirect("/admin/rider_list");
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  rider_status: async (req, res) => {
    try {
      var check = await Models.userModel.updateOne(
        { _id: req.body.id },
        { status: req.body.value }
      );
      req.flash("msg", "Status update successfully");

      if (req.body.value == 0) res.send(false);
      if (req.body.value == 1) res.send(true);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  //---------------------------------------

  //---------vehicle type apis-------------

  // List Vehicle Types
  vehicleType_list: async (req, res) => {
    try {
      const title = "vehicleType_list";
      const vehicleTypes = await Models.vehicleTypeModel
        .find({})
        .sort({ createdAt: -1 });

      res.render("Admin/vehicleType/vehicleType_list", {
        title,
        vehicleTypes,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.error("Error fetching vehicle type list:", error);
      req.flash("msg", "Error fetching vehicle type list");
      res.redirect("/admin/dashboard");
    }
  },

  // View Vehicle Type Details
  edit_vehicleType: async (req, res) => {
    try {
      const title = "vehicleType_list";
      const editData = await Models.vehicleTypeModel.findById(req.params.id);

      if (!editData) {
        req.flash("msg", "Vehicle Type not found");
        return res.redirect("/admin/vehicleType_list");
      }

      res.render("Admin/vehicleType/edit_vehicleType", {
        title,
        editData,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.error("Error fetching vehicle type details:", error);
      req.flash("msg", "Error fetching vehicle type details");
      res.redirect("/admin/vehicleType_list");
    }
  },

  // Delete Vehicle Type
  delete_vehicleType: async (req, res) => {
    try {
      const { id } = req.body;

      const deleteResult = await Models.vehicleTypeModel.deleteOne({ _id: id });

      if (deleteResult.deletedCount === 0) {
        req.flash("msg", "Vehicle Type not found or already deleted");
        return res.redirect("/admin/vehicleType_list");
      }

      const title = "vehicleType_list";
      const vehicleTypes = await Models.vehicleTypeModel
        .find({})
        .sort({ createdAt: -1 });

      res.render("Admin/vehicleType/vehicleType_list", {
        title,
        vehicleTypes,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.error("Error deleting vehicle type:", error);
      req.flash("msg", "Error deleting Vehicle Type");
      res.redirect("/admin/vehicleType_list");
    }
  },

  // Update Vehicle Type Status
  vehicleType_status: async (req, res) => {
    try {
      const { id, value } = req.body;

      const updated = await Models.vehicleTypeModel.updateOne(
        { _id: id },
        { status: value }
      );

      if (updated.modifiedCount === 0) {
        req.flash("msg", "Error updating status");
        return res.status(400).send(false);
      }
      const vehicleTypes = await Models.vehicleTypeModel
        .find({})
        .sort({ createdAt: -1 });

      const title = "vehicleType_list";
      req.flash("msg", "Status updated successfully");
      res.render("Admin/vehicleType/vehicleType_list", {
        title,
        vehicleTypes,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.error("Error updating vehicle type status:", error);
      req.flash("msg", "Error updating status");
      res.status(500).send(false);
    }
  },

  add_vehicleType: async (req, res) => {
    try {
      let title = "vehicleType_list";
      let msg = req.flash("msg");
      let session = req.session.user;
      res.render("Admin/vehicleType/add_vehicleType", { title, msg, session });
    } catch (error) {
      console.log(error);
      // throw error
    }
  },

  // Add Vehicle Type (Create Vehicle Type)
  create_vehicleType: async (req, res) => {
    try {
      const { name, category, fuelType } = req.body;

      const newVehicleType = new Models.vehicleTypeModel({
        name,
        category,
        fuelType,
      });

      await newVehicleType.save();

      req.flash("msg", "Vehicle Type created successfully");
      res.redirect("/admin/vehicleType_list");
    } catch (error) {
      console.error("Error creating vehicle type:", error);
      req.flash("msg", "Error creating Vehicle Type");
      res.redirect("/admin/vehicleType_list");
    }
  },

  // Update Vehicle Type (Post edited details)
  update_vehicleType: async (req, res) => {
    try {
      const { id } = req.body;
      const { name, category, fuelType } = req.body;
      const title = "vehicleType_list";

      const updatedVehicleType =
        await Models.vehicleTypeModel.findByIdAndUpdate(
          { _id: id },
          { name, category, fuelType },
          { new: true }
        );

      if (!updatedVehicleType) {
        req.flash("msg", "Vehicle Type not found");
        return res.redirect("/admin/vehicleType_list");
      }
      const vehicleTypes = await Models.vehicleTypeModel
        .find({})
        .sort({ createdAt: -1 });

      req.flash("msg", "Vehicle Type updated successfully");
      res.render("Admin/vehicleType/vehicleType_list", {
        title,
        vehicleTypes,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.error("Error updating vehicle type:", error);
      req.flash("msg", "Error updating Vehicle Type");
      res.redirect("/admin/vehicleType_list");
    }
  },


  //----------------order api-----------------------


  order_list: async (req, res) => {
    try {
      const title = "order_list";
      
      // Fetch orders and populate references
      const orders = await Models.orderModel
        .find({})
        .populate("orderBy", "fullName") // Fetching only the 'fullName' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });
      
      // Format orders to include all necessary data for rendering
      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt ? order.createdAt.toLocaleString() : "N/A",
        status: order.status || 0, // Default to 0 if status is missing
        id: order._id,
      }));
  
      // Render the EJS view with formatted order data
      res.render("Admin/orders/order_list", {
        title,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || '', // Flash message
      });
      
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  
  

  view_order: async (req, res) => {
    try {
      let title = "order_list";
      // Fetch the order details by its ID from the database
      const order = await Models.orderModel
        .findById(req.params._id )
        .populate("orderBy", "fullName") // Populate with fullName for the user
        .populate("restaurant", "name") // Populate with name for the restaurant
        .populate("rider", "fullName"); // Populate with fullName for the rider
      // If the order is not found, return a 404 error
      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found",
        });
      }
  
      // Function to map order status to a readable format
      function getOrderStatus(status) {
        const statuses = {
          1: "Pending",  // Order is pending
          2: "Success",  // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing",  // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }
      // Render the view with order details
      res.render("Admin/orders/view_order", {
        title, // Pass the title to the view
        order, // Pass the order details to the view
        orderStatus: getOrderStatus(order.status), // Pass the order status
        session: req.session.user, // Pass session details (if needed)
        msg: req.flash("msg"), // Pass any flash messages (if needed)
      });
    } catch (error) {
      // Log any errors and send a 500 response in case of an internal server error
      console.error("Error fetching order details:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  },
  
  
  

    //----------------Active order api-----------------------


    active_order_list: async (req, res) => {
      try {
        const title = "activeorders";
        const orders = await Models.orderModel
          .find({status:4})
          .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
          .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
          .sort({ createdAt: -1 });
    
        const formattedOrders = orders.map((order, index) => ({
          sNo: index + 1,
          orderBy: order.orderBy?.fullName || "N/A",
          restaurant: order.restaurant?.name || "N/A",
          item: order.item || "N/A",
          orderDateTime: order.createdAt ? order.createdAt.toLocaleString() : "N/A",
          id: order._id,
        }));
      
        res.render("Admin/orders/active_order_list", {
          title,
          orderdata: formattedOrders,
          session: req.session.user, // Ensure session data is passed here
          msg: req.flash("msg") || '', // Flash message
        });
    
      } catch (error) {
        console.error("Error fetching order list:", error);
        req.flash("msg", "Error fetching order list");
        res.redirect("/admin/dashboard");
      }
    },
    active_view_order: async (req, res) => {
      try {
        let title = "activeorders";
        // Fetch the order details by its ID from the database
        const order = await Models.orderModel
          .findById(req.params._id)
          .populate("orderBy", "fullName") // Populate the orderBy field with only the name of the user
          .populate("restaurant", "name") // Populate the restaurant field with only the name of the restaurant
          .populate("rider", "name"); // Populate the rider field with only the name of the rider
    
        // If the order is not found, return a 404 error
        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }
    
        // Function to map order status to a readable format
        function getOrderStatus(status) {
          const statuses = {
            1: "Pending",  // Order is pending
            2: "Success",  // Order is successful
            3: "Rejected", // Order was rejected
            4: "Ongoing",  // Order is ongoing
            5: "Returned", // Order has been returned
          };
          return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
        }
    

         // Render the view with order details
          res.render("Admin/orders/active_order_view", {
            title, // Pass the title to the view
            order, // Pass the order details to the view
            orderStatus: getOrderStatus(order.status), // Pass the order status
            session: req.session.user, // Pass session details (if needed)
            msg: req.flash("msg"), // Pass any flash messages (if needed)
          });
      } catch (error) {
        // Log any errors and send a 500 response in case of an internal server error
        console.error("Error fetching order details:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    },
    
  
    delivered_order_list: async (req, res) => {
      try {
        const title = "deliveredorders";
        const orders = await Models.orderModel
          .find({status:2})
          .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
          .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
          .sort({ createdAt: -1 });
    
        const formattedOrders = orders.map((order, index) => ({
          sNo: index + 1,
          orderBy: order.orderBy?.fullName || "N/A",
          restaurant: order.restaurant?.name || "N/A",
          item: order.item || "N/A",
          orderDateTime: order.createdAt ? order.createdAt.toLocaleString() : "N/A",
          id: order._id,
        }));
      
        res.render("Admin/orders/delivered_order_list", {
          title,
          orderdata: formattedOrders,
          session: req.session.user, // Ensure session data is passed here
          msg: req.flash("msg") || '', // Flash message
        });
    
      } catch (error) {
        console.error("Error fetching order list:", error);
        req.flash("msg", "Error fetching order list");
        res.redirect("/admin/dashboard");
      }
    },
    delivered_view_order: async (req, res) => {
      try {
        let title = "deliveredorders";
        // Fetch the order details by its ID from the database
        const order = await Models.orderModel
          .findById(req.params._id)
          .populate("orderBy", "fullName") // Populate the orderBy field with only the name of the user
          .populate("restaurant", "name") // Populate the restaurant field with only the name of the restaurant
          .populate("rider", "name"); // Populate the rider field with only the name of the rider
    console.log("order",order)
        // If the order is not found, return a 404 error
        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }
    
        // Function to map order status to a readable format
        function getOrderStatus(status) {
          const statuses = {
            1: "Pending",  // Order is pending
            2: "Success",  // Order is successful
            3: "Rejected", // Order was rejected
            4: "Ongoing",  // Order is ongoing
            5: "Returned", // Order has been returned
          };
          return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
        }
    

         // Render the view with order details
          res.render("Admin/orders/delivered_order_view", {
            title, // Pass the title to the view
            order, // Pass the order details to the view
            orderStatus: getOrderStatus(order.status), // Pass the order status
            session: req.session.user, // Pass session details (if needed)
            msg: req.flash("msg"), // Pass any flash messages (if needed)
          });
      } catch (error) {
        // Log any errors and send a 500 response in case of an internal server error
        console.error("Error fetching order details:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    },
    cancel_order_list: async (req, res) => {
      try {
        const title = "cancelledorders";
        const orders = await Models.orderModel
          .find({status:3})
          .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
          .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
          .sort({ createdAt: -1 });
    
        const formattedOrders = orders.map((order, index) => ({
          sNo: index + 1,
          orderBy: order.orderBy?.fullName || "N/A",
          restaurant: order.restaurant?.name || "N/A",
          item: order.item || "N/A",
          orderDateTime: order.createdAt ? order.createdAt.toLocaleString() : "N/A",
          id: order._id,
        }));
      
        res.render("Admin/orders/cancel_order_list", {
          title,
          orderdata: formattedOrders,
          session: req.session.user, // Ensure session data is passed here
          msg: req.flash("msg") || '', // Flash message
        });
    
      } catch (error) {
        console.error("Error fetching order list:", error);
        req.flash("msg", "Error fetching order list");
        res.redirect("/admin/dashboard");
      }
    },
    cancel_view_order: async (req, res) => {
      try {
        let title = "cancelledorders";
        // Fetch the order details by its ID from the database
        const order = await Models.orderModel
          .findById(req.params._id)
          .populate("orderBy", "fullName") // Populate the orderBy field with only the name of the user
          .populate("restaurant", "name") // Populate the restaurant field with only the name of the restaurant
          .populate("rider", "name"); // Populate the rider field with only the name of the rider
    
        // If the order is not found, return a 404 error
        if (!order) {
          return res.status(404).json({
            success: false,
            message: "Order not found",
          });
        }
    
        // Function to map order status to a readable format
        function getOrderStatus(status) {
          const statuses = {
            1: "Pending",  // Order is pending
            2: "Success",  // Order is successful
            3: "Rejected", // Order was rejected
            4: "Ongoing",  // Order is ongoing
            5: "Returned", // Order has been returned
          };
          return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
        }
    

         // Render the view with order details
          res.render("Admin/orders/cancel_order_view", {
            title, // Pass the title to the view
            order, // Pass the order details to the view
            orderStatus: getOrderStatus(order.status), // Pass the order status
            session: req.session.user, // Pass session details (if needed)
            msg: req.flash("msg"), // Pass any flash messages (if needed)
          });
      } catch (error) {
        // Log any errors and send a 500 response in case of an internal server error
        console.error("Error fetching order details:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    },
  //---------------------------------------

  admin_profile: async (req, res) => {
    try {
      let title = "admin_profile";
      res.render("Admin/admin/admin_profile", {
        title,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  update_admin_profile: async (req, res) => {
    try {
      if (req.files && req.files.image) {
        var image = req.files.image;
        if (image) {
          req.body.image = await helper.fileUpload(image, "images");
        }
      }
      console.log(req.session.user._id);
      const userData = await Models.userModel.findByIdAndUpdate(
        { _id: req.session.user._id },
        {
          name: req.body.name,
          image: req.body.image,
          phoneNumber: req.body.phone,
        }
      );
      let data = await Models.userModel.findById({ _id: req.session.user._id });
      req.session.user = data;
      req.flash("msg", "Profile updated successfully");
      if (userData) {
        res.redirect("back");
      } else {
        res.redirect("back");
      }
    } catch (error) {
      console.log(error);
    }
  },

  change_password: async (req, res) => {
    try {
      let title = "change_password";
      res.render("Admin/admin/change_password", {
        title,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  Update_password: async function (req, res) {
    try {
      const schema = Joi.object().keys({
        oldPassword: Joi.string().required(),
        newPassword: Joi.string().required(),
        confirm_password: Joi.string().required(),
      });

      let payload = await helper.validationJoi(req.body, schema);
      let data = req.session.user;

      if (data) {
        let comp = await bcrypt.compare(payload.oldPassword, data.password);

        if (comp) {
          const bcryptPassword = await bcrypt.hash(req.body.newPassword, 10);
          let create = await Models.userModel.updateOne(
            { _id: data._id },
            { password: bcryptPassword }
          );
          req.session.user = create;
          req.flash("msg", "Update password successfully");
          res.redirect("/admin/login");
        } else {
          req.flash("msg", "Old password do not match");
          res.redirect("/admin/change_password");
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  admin_commission: async (req, res) => {
    try {
      let title = "commission";
      let users = await Models.userModel.findOne({ _id: req.session.user._id });
      res.render("Admin/commission/commission", {
        title,
        users,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  update_commission: async (req, res) => {
    try {
      await Models.userModel.updateOne(
        { _id: req.session.user._id },
        {
          admincommission: req.body.admincommission,
        }
      );
      let users = await Models.userModel.findOne({ _id: req.session.user._id });
      req.flash("msg", "Updated successfully");
      res.redirect("/admin/admin_commission");
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
};
