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
      // Find user by email and role
      let findUser = await Models.userModel.findOne({
        role: 0, // Assuming 0 is the admin role
        email: req.body.email,
      });

      // If user not found, send error message
      if (!findUser) {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect email" });
      }

      // Compare password
      let checkPassword = await bcrypt.compare(
        req.body.password,
        findUser.password
      );
      if (!checkPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Incorrect password" });
      } else {
        // Update device token if provided
        if (req.body.deviceToken) {
          await Models.userModel.updateOne(
            { deviceToken: req.body.deviceToken },
            { _id: findUser._id }
          );
        }

        // Store user session
        req.session.user = findUser;

        // Send success response
        return res
          .status(200)
          .json({ success: true, message: "Login successful" });
      }
    } catch (error) {
      console.log(error);
      return res
        .status(500)
        .json({
          success: false,
          message: "An error occurred. Please try again later.",
        });
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
      const feedbacks = await Models.feedBackModel.countDocuments();
      const orders = await Models.orderModel.countDocuments();
      const pendingOrders = await Models.orderModel.countDocuments({
        status: 1,
      });
      const deliveredOrders = await Models.orderModel.countDocuments({
        status: 2,
      });
      const cancelledOrders = await Models.orderModel.countDocuments({
        status: 3,
      });
      const activeOrders = await Models.orderModel.countDocuments({
        status: 4,
      });
      const returnOrders = await Models.orderModel.countDocuments({
        status: 5,
      });
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
        pendingOrders: pendingOrders,
        returnOrders: returnOrders,
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
      console.log("object", req.body.filter);
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
      const dateQuery =
        startDate && endDate
          ? { createdAt: { $gte: startDate, $lte: endDate } }
          : {};

      // Fetch filtered data
      const user = await Models.userModel.countDocuments({
        role: 1,
        ...dateQuery,
      });
      const provider = await Models.restaurantModel.countDocuments({
        ...dateQuery,
      });
      const rider = await Models.userModel.countDocuments({
        role: 3,
        ...dateQuery,
      });
      const vehicleType = await Models.vehicleTypeModel.countDocuments(
        dateQuery
      );
      const orders = await Models.orderModel.countDocuments(dateQuery);
      // const payments = await Models.paymentModel.countDocuments(dateQuery);
      const feedbacks = await Models.feedBackModel.countDocuments(dateQuery);
      const pendingOrders = await Models.orderModel.countDocuments({
        status: 1,
        ...dateQuery,
      });
      const deliveredOrders = await Models.orderModel.countDocuments({
        status: 2,
        ...dateQuery,
      });
      const cancelledOrders = await Models.orderModel.countDocuments({
        status: 3,
        ...dateQuery,
      });
      const activeOrders = await Models.orderModel.countDocuments({
        status: 4,
        ...dateQuery,
      });
      const returnOrders = await Models.orderModel.countDocuments({
        status: 5,
        ...dateQuery,
      });

      // const contactUs = await Models.contactUsModel.countDocuments(dateQuery);
      // const servicesdata = await Models.serviceModel.countDocuments(dateQuery);
      console.log("user", user);

      res.json({
        user,
        provider,
        rider,
        vehicleType,
        orders,
        payments: 0,
        feedbacks,
        pendingOrders,
        returnOrders,
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
      let orders = await Models.orderModel.countDocuments({
        orderBy: req.params.id,
      });
      let successOrders = await Models.orderModel.countDocuments({
        orderBy: req.params.id,
        status: 2,
      });
      let pendingOrders = await Models.orderModel.countDocuments({
        orderBy: req.params.id,
        status: 1,
      });
      let cancelledOrders = await Models.orderModel.countDocuments({
        orderBy: req.params.id,
        status: 3,
      });
      let totalRides = await Models.rideBookingModel.countDocuments({
        userId: req.params.id,
      });
      res.render("Admin/user/view_user", {
        title,
        userId: req.params.id,
        viewuser,
        orders,
        successOrders,
        pendingOrders,
        cancelledOrders,
        totalRides,
        totalSpend: 0,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  user_dashboardFilter: async (req, res) => {
    try {
      let title = "user_list";
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
      const dateQuery =
        startDate && endDate
          ? { createdAt: { $gte: startDate, $lte: endDate } }
          : {};
      let viewuser = await Models.userModel.findById({
        _id: req.body.id,
        ...dateQuery,
      });
      let orders = await Models.orderModel.countDocuments({
        orderBy: req.body.id,
        ...dateQuery,
      });
      let successOrders = await Models.orderModel.countDocuments({
        orderBy: req.body.id,
        status: 2,
        ...dateQuery,
      });
      let pendingOrders = await Models.orderModel.countDocuments({
        orderBy: req.body.id,
        status: 1,
        ...dateQuery,
      });
      let cancelledOrders = await Models.orderModel.countDocuments({
        orderBy: req.body.id,
        status: 3,
        ...dateQuery,
      });
      let totalRides = await Models.rideBookingModel.countDocuments({
        userId: req.body.id,
        ...dateQuery,
      });
      res.json({
        title,
        userId: req.body.id,
        viewuser,
        orders,
        successOrders,
        pendingOrders,
        cancelledOrders,
        totalRides,
        totalSpend: 0,
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
      // let remove = await Models.userModel.deleteOne({ _id: userid });
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
      // req.flash("msg", "Status update successfully");

      if (req.body.value == 0) res.send(false);
      if (req.body.value == 1) res.send(true);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  total_user_order_list: async (req, res) => {
    try {
      const title = "user_list";
      const orders = await Models.orderModel
        .find({ orderBy: req.params.userId })
        .populate("orderBy", "fullName")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        status: order.status || 0, // Default to 0 if status is missing
        id: order._id,
      }));

      res.render("Admin/user/userOrders/total_orders_list", {
        title,
        userId: req.params.userId,
        userName: orders[0].orderBy.fullName,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  total_user_view_order: async (req, res) => {
    try {
      let title = "user_list";
      // Fetch the order details by its ID from the database
      const order = await Models.orderModel
        .findById(req.params._id)
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }
      // Render the view with order details
      res.render("Admin/user/userOrders/total_orders_view", {
        title, // Pass the title to the view
        orderId: order.orderBy._id,
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
  user_success_order_list: async (req, res) => {
    try {
      const title = "user_list";
      const orders = await Models.orderModel
        .find({ orderBy: req.params.userId, status: 2 })
        .populate("orderBy", "fullName")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        status: order.status || 0, // Default to 0 if status is missing
        id: order._id,
      }));

      res.render("Admin/user/userOrders/success_orders_list", {
        title,
        userId: req.params.userId,
        userName: orders[0].orderBy.fullName,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  user_success_view_order: async (req, res) => {
    try {
      let title = "user_list";
      // Fetch the order details by its ID from the database
      const order = await Models.orderModel
        .findById(req.params._id)
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }
      // Render the view with order details
      res.render("Admin/user/userOrders/success_orders_view", {
        title, // Pass the title to the view
        orderId: order.orderBy._id,
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

  user_pending_order_list: async (req, res) => {
    try {
      const title = "user_list";
      const orders = await Models.orderModel
        .find({ orderBy: req.params.userId, status: 1 })
        .populate("orderBy", "fullName")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        status: order.status || 0, // Default to 0 if status is missing
        id: order._id,
      }));

      res.render("Admin/user/userOrders/pending_orders_list", {
        title,
        userId: req.params.userId,
        userName: orders[0].orderBy.fullName,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  user_pending_view_order: async (req, res) => {
    try {
      let title = "user_list";
      // Fetch the order details by its ID from the database
      const order = await Models.orderModel
        .findById(req.params._id)
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }
      // Render the view with order details
      res.render("Admin/user/userOrders/pending_orders_view", {
        title, // Pass the title to the view
        orderId: order.orderBy._id,
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

  user_cancel_order_list: async (req, res) => {
    try {
      const title = "user_list";
      const orders = await Models.orderModel
        .find({ orderBy: req.params.userId, status: 3 })
        .populate("orderBy", "fullName")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        status: order.status || 0, // Default to 0 if status is missing
        id: order._id,
      }));

      res.render("Admin/user/userOrders/cancel_orders_list", {
        title,
        userId: req.params.userId,
        userName: orders[0].orderBy.fullName,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  user_cancel_view_order: async (req, res) => {
    try {
      let title = "user_list";
      // Fetch the order details by its ID from the database
      const order = await Models.orderModel
        .findById(req.params._id)
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }
      // Render the view with order details
      res.render("Admin/user/userOrders/cancel_orders_view", {
        title, // Pass the title to the view
        orderId: order.orderBy._id,
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

  //<----------------------Restaurant------------------->
  restaurant_list: async (req, res) => {
    try {
      let title = "provider_list";
      let userdata = await Models.restaurantModel
        .find()
        .populate("userId") // Populating the user details based on userId
        .sort({ createdAt: -1 }); // Sorting by creation date, most recent first
      res.render("Admin/restaurant/restaurant_list", {
        title,
        userdata, // Passing the list of restaurants to the view
        session: req.session.user, // Passing the session data for authentication purposes
        msg: req.flash("msg"), // Flash message, if any
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  view_restaurant: async (req, res) => {
    try {
      let title = "provider_list";
  
      const currentDate = new Date();
      const startOfMonth = currentDate.getMonth() + 1;
      const endOfMonth = currentDate.getFullYear();
  
      // Populate subCategory if it's a reference
      let viewuser = await Models.restaurantModel
        .findById({ _id: req.params.id })
        .populate("userId")
        .populate("subCategory"); // Ensure subCategory is populated
  
      const orders = await Models.orderModel.countDocuments({
        restaurant: req.params.id,
      });
      const pendingOrders = await Models.orderModel.countDocuments({
        status: 1,
        restaurant: req.params.id,
      });
      const activeOrders = await Models.orderModel.countDocuments({
        status: 4,
        restaurant: req.params.id,
      });
      const deliveredOrders = await Models.orderModel.countDocuments({
        status: 2,
        restaurant: req.params.id,
      });
      const cancelledOrders = await Models.orderModel.countDocuments({
        status: 3,
        restaurant: req.params.id,
      });
      const revenueData = await Models.transactionModel.find({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      });
  
      const labels = revenueData.map((entry) => entry.day);
      const revenue = revenueData.map((entry) => entry.amount);
  
      res.render("Admin/restaurant/restaurant_view", {
        title,
        viewuser,
        category: viewuser?.category?.length || 0,
        subCategory: viewuser?.subCategory?.length,
        products: viewuser?.products?.length || 0,
        orders,
        pendingOrders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        labels,
        revenue,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  
  restaurant_dashboard_filter: async (req, res) => {
    try {
      const title = "provider_list";
      const filter = req.body.filter || "all"; // Get the filter parameter from the request body
      const _id = req.body.id;
      const { year, month } = req.body;
      // Calculate date range based on the filter
      const now = new Date();
      let startDate, endDate;
      // Query the database for revenue data
      const startOfMonth = new Date(year, month - 1, 1); // Start date
      const endOfMonth = new Date(year, month, 0); // End date
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
      const dateQuery =
        startDate && endDate
          ? {
              createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            }
          : {};
      // Fetch filtered restaurant data
      const userdata = await Models.restaurantModel
        .findById({ _id, ...dateQuery })
        .populate("userId") // Populating the user details based on userId
        .sort({ createdAt: -1 }); // Sorting by creation date, most recent first
      const orders = await Models.orderModel.countDocuments({
        restaurant: req.body.id,
        ...dateQuery,
      });
      const pendingOrders = await Models.orderModel.countDocuments({
        status: 1,
        restaurant: req.body.id,
        ...dateQuery,
      });
      const activeOrders = await Models.orderModel.countDocuments({
        status: 4,
        restaurant: req.body.id,
        ...dateQuery,
      });
      const deliveredOrders = await Models.orderModel.countDocuments({
        status: 2,
        restaurant: req.body.id,
        ...dateQuery,
      });
      const cancelledOrders = await Models.orderModel.countDocuments({
        status: 3,
        restaurant: req.body.id,
        ...dateQuery,
      });

      // const revenueData = await Models.transactionModel.find({
      //   createdAt: { $gte: startOfMonth, $lte: endOfMonth },
      // });

      // // Format the response
      // const labels = revenueData.map((entry) => entry.day); // e.g., [1, 2, 3, ...]
      // const revenue = revenueData.map((entry) => entry.amount); // e.g., [100, 200, ...]

      return res.json({
        userdata,
        category: userdata?.category?.length || 0,
        subCategory: userdata?.subCategory?.length || 0,
        products: userdata?.products?.length || 0,
        orders,
        pendingOrders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        // labels,
        // revenue
      });
    } catch (error) {
      console.error("Error in restaurant_view:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  delete_restaurant: async (req, res) => {
    try {
      let userid = req.body.id;
      // let remove = await Models.userModel.deleteOne({ _id: userid });
      res.redirect("/admin/user_list");
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  restaurant_status: async (req, res) => {
    try {
      const { id, value } = req.body;
  
      // Validate input
      if (!id || value === undefined) {
        return res.status(400).send({ error: "Invalid input data." });
      }
  
      // Update the restaurant status
      const updateRestaurant = await Models.restaurantModel.updateOne(
        { _id: id },
        { status: value }
      );
  
      // Check if the restaurant status was modified
      if (updateRestaurant.modifiedCount > 0) {
        const restaurant = await Models.restaurantModel.findById(id);
  
        if (restaurant && restaurant.userId) {
          await Models.userModel.updateOne(
            { _id: restaurant.userId },
            { status: value }
          );
        }
  
        // Return success response with the updated status
        return res.status(200).send({ success: true, status: value == 1 });
      } else {
        // No modification occurred (already in the desired state or not found)
        return res.status(404).send({
          error: "No changes made. Restaurant not found or already updated.",
        });
      }
    } catch (error) {
      console.error("Error updating restaurant status:", error);
  
      // Return a 500 Internal Server Error for any other exceptions
      return res.status(500).send({ error: "Internal Server Error" });
    }
  },


  //----------------Dashboard order api-----------------------

  restaurant_order_list: async (req, res) => {
    try {
      const title = "provider_list";
      const orders = await Models.orderModel
        .find({ restaurant: req.params._id })
        .populate("orderBy", "fullName")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        status: order.status || 0, // Default to 0 if status is missing
        id: order._id,
      }));

      res.render("Admin/restaurant/restaurantOrders/order_list", {
        title,
        restaurant: req.params._id,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  restaurant_view_order: async (req, res) => {
    try {
      let title = "provider_list";
      // Fetch the order details by its ID from the database
      const order = await Models.orderModel
        .findById(req.params._id)
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }
      // Render the view with order details
      res.render("Admin/restaurant/restaurantOrders/view_order", {
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

  restaurant_active_order_list: async (req, res) => {
    try {
      const title = "provider_list";
      const orders = await Models.orderModel
        .find({ status: 4, restaurant: req.params._id })
        .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        id: order._id,
      }));

      res.render("Admin/restaurant/restaurantOrders/active_order_list", {
        title,
        restaurant: req.params._id,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  restaurant_active_view_order: async (req, res) => {
    try {
      let title = "provider_list";
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }

      // Render the view with order details
      res.render("Admin/restaurant/restaurantOrders/active_order_view", {
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

  restaurant_delivered_order_list: async (req, res) => {
    try {
      const title = "provider_list";
      const orders = await Models.orderModel
        .find({ status: 2, restaurant: req.params._id })
        .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        id: order._id,
      }));

      res.render("Admin/restaurant/restaurantOrders/delivered_order_list", {
        title,
        restaurant: req.params._id,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  restaurant_delivered_view_order: async (req, res) => {
    try {
      let title = "provider_list";
      // Fetch the order details by its ID from the database
      const order = await Models.orderModel
        .findById(req.params._id)
        .populate("orderBy", "fullName") // Populate the orderBy field with only the name of the user
        .populate("restaurant", "name") // Populate the restaurant field with only the name of the restaurant
        .populate("rider", "name"); // Populate the rider field with only the name of the rider
      console.log("order", order);
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }

      // Render the view with order details
      res.render("Admin/restaurant/restaurantOrders/delivered_order_view", {
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
  restaurant_cancel_order_list: async (req, res) => {
    try {
      const title = "provider_list";
      const orders = await Models.orderModel
        .find({ status: 3, restaurant: req.params._id })
        .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        id: order._id,
      }));

      res.render("Admin/restaurant/restaurantOrders/cancel_order_list", {
        title,
        restaurant: req.params._id,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  restaurant_cancel_view_order: async (req, res) => {
    try {
      let title = "provider_list";
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }

      // Render the view with order details
      res.render("Admin/restaurant/restaurantOrders/cancel_order_view", {
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

  restaurant_pending_order_list: async (req, res) => {
    try {
      const title = "provider_list";
      const orders = await Models.orderModel
        .find({ status: 1, restaurant: req.params._id })
        .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        id: order._id,
      }));

      res.render("Admin/restaurant/restaurantOrders/pending_order_list", {
        title,
        restaurant: req.params._id,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  restaurant_pending_view_order: async (req, res) => {
    try {
      let title = "provider_list";
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }

      // Render the view with order details
      res.render("Admin/restaurant/restaurantOrders/pending_order_view", {
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

  restaurant_return_order_list: async (req, res) => {
    try {
      const title = "provider_list";
      const orders = await Models.orderModel
        .find({ status: 5, restaurant: req.params._id })
        .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        id: order._id,
      }));

      res.render("Admin/restaurant/restaurantOrders/pending_order_list", {
        title,
        restaurant: req.params._id,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  restaurant_return_view_order: async (req, res) => {
    try {
      let title = "provider_list";
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }

      // Render the view with order details
      res.render("Admin/restaurant/restaurantOrders/pending_order_view", {
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
  restaurant_category: async (req, res) => {
    try {
      let title = "provider_list";
      let viewuser = await Models.restaurantModel
        .findById({ _id: req.params._id })
        .populate("userId");

      res.render(
        "Admin/restaurant/restaurantCatSubCatProduct/restaurant_category_list",
        {
          title,
          viewuser,
          restaurant: req.params._id,
          session: req.session.user,
          msg: req.flash("msg"),
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  restaurant_subCategory: async (req, res) => {
    try {
      let title = "provider_list";
      const viewuser = await Models.restaurantModel
        .findById(req.params._id)
        .populate("userId") // Populate user information
        .lean(); // Use `.lean()` to get a plain JavaScript object

      if (viewuser) {
        // Map subCategories with corresponding category data
        viewuser.subCategory = viewuser.subCategory.map((subCat) => {
          const matchedCategory = viewuser.category.find(
            (cat) => cat._id.toString() === subCat.categoryId.toString()
          );

          return {
            ...subCat,
            categoryName: matchedCategory ? matchedCategory.name : null,
            categoryImage: matchedCategory ? matchedCategory.image : null,
          };
        });
      }

      res.render(
        "Admin/restaurant/restaurantCatSubCatProduct/restaurant_subCategory_list",
        {
          title,
          viewuser,
          restaurant: req.params._id,
          session: req.session.user,
          msg: req.flash("msg"),
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  restaurant_product: async (req, res) => {
    try {
      const restaurantId = req.params._id;
      // Fetch restaurant data
      const restaurant = await Models.restaurantModel
        .findById(restaurantId)
        .populate("userId")
        .lean();

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      // Process products
      restaurant.products = restaurant.products.map((product) => {
        const matchedSubCategory = restaurant.subCategory.find(
          (subCat) => subCat._id.toString() === product.subCategoryId.toString()
        );

        return {
          ...product,
          subCategoryName: matchedSubCategory ? matchedSubCategory.name : null,
          subCategoryImage: matchedSubCategory
            ? matchedSubCategory.image
            : null,
        };
      });

      res.render(
        "Admin/restaurant/restaurantCatSubCatProduct/restaurant_product_list",
        {
          title: "provider_list",
          restaurantId,
          viewuser: restaurant,
          session: req.session.user,
          msg: req.flash("msg"),
        }
      );
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  restaurant_product_view: async (req, res) => {
    try {
      let title="provider_list"
      const restaurantId = req.params.restaurantId; // Restaurant ID from the request
      const productId = req.params._id;       // Product ID from the request
  
      // Fetch the restaurant data by restaurantId
      const restaurant = await Models.restaurantModel
          .findById(restaurantId)
          .lean(); // Fetch the restaurant document as a plain JS object
  
      if (!restaurant) {
          return res.status(404).json({ message: "Restaurant not found" });
      }
  
      // Find the product within the restaurant's products array by productId
      let product = restaurant.products.find(
          (prod) => prod._id.toString() === productId.toString()
      );
  
      if (!product) {
          return res.status(404).json({ message: "Product not found" });
      }
  
      // Find the corresponding subcategory for the product
      const matchedSubCategory = restaurant.subCategory.find(
          (subCat) => subCat._id.toString() === product.subCategoryId.toString()
      );
  
      // Find the corresponding category for the subcategory (if subcategory exists)
      const matchedCategory = matchedSubCategory
          ? restaurant.category.find(
                (cat) => cat._id.toString() === matchedSubCategory.categoryId.toString()
            )
          : null;
  
      // Enrich the product with category and subcategory details
       product = {
          ...product,
          subCategoryName: matchedSubCategory ? matchedSubCategory.name : null,
          subCategoryImage: matchedSubCategory ? matchedSubCategory.image : null,
          categoryName: matchedCategory ? matchedCategory.name : null,
          categoryImage: matchedCategory ? matchedCategory.image : null,
      };
      res.render("Admin/restaurant/restaurantCatSubCatProduct/restaurant_product_view", {
        title,
        productId,
        restaurantName:restaurant.name,
        restaurantId,
        product,
        session: req.session.user,
        msg: req.flash("msg"),
    });
  } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Internal server error" });
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
      let riderHistory = await Models.rideBookingModel
        .find({ riderId: req.params.id })
        .populate("userId");
      res.render("Admin/rider/view_rider", {
        title,
        viewrider,
        riderHistory,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  view_ride_detial: async (req, res) => {
    try {
      let title = "rider_list";
      let viewrider = await Models.rideBookingModel
        .findById({ _id: req.params.id })
        .populate("userId")
        .populate("riderId");
      res.render("Admin/rider/view_ride_user_detail", {
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
      // let remove = await Models.userModel.deleteOne({ _id: riderid });
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
      // req.flash("msg", "Status update successfully");

      if (req.body.value == 0) res.send(false);
      if (req.body.value == 1) res.send(true);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
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

      // const deleteResult = await Models.vehicleTypeModel.deleteOne({ _id: id });

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
      // req.flash("msg", "Status updated successfully");
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

  //----------------Dashboard order api-----------------------

  order_list: async (req, res) => {
    try {
      const title = "order_list";
      const orders = await Models.orderModel
        .find({})
        .populate("orderBy", "fullName")
        .populate("restaurant", "name")
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        status: order.status || 0, // Default to 0 if status is missing
        id: order._id,
      }));

      res.render("Admin/orders/order_list", {
        title,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
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
        .findById(req.params._id)
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
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

  active_order_list: async (req, res) => {
    try {
      const title = "activeorders";
      const orders = await Models.orderModel
        .find({ status: 4 })
        .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        id: order._id,
      }));

      res.render("Admin/orders/active_order_list", {
        title,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
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
        .find({ status: 2 })
        .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        id: order._id,
      }));

      res.render("Admin/orders/delivered_order_list", {
        title,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
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
      console.log("order", order);
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
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
        .find({ status: 3 })
        .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        id: order._id,
      }));

      res.render("Admin/orders/cancel_order_list", {
        title,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
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

  pending_order_list: async (req, res) => {
    try {
      const title = "pending_orders";
      const orders = await Models.orderModel
        .find({ status: 1 })
        .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        id: order._id,
      }));

      res.render("Admin/orders/pending_order_list", {
        title,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  pending_view_order: async (req, res) => {
    try {
      let title = "pending_orders";
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }

      // Render the view with order details
      res.render("Admin/orders/pending_order_view", {
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

  return_order_list: async (req, res) => {
    try {
      const title = "return_orders";
      const orders = await Models.orderModel
        .find({ status: 5 })
        .populate("orderBy", "fullName") // Fetching only the 'name' field of the user
        .populate("restaurant", "name") // Fetching only the 'name' field of the restaurant
        .sort({ createdAt: -1 });

      const formattedOrders = orders.map((order, index) => ({
        sNo: index + 1,
        orderBy: order.orderBy?.fullName || "N/A",
        restaurant: order.restaurant?.name || "N/A",
        item: order.item || "N/A",
        orderDateTime: order.createdAt
          ? order.createdAt.toLocaleString()
          : "N/A",
        id: order._id,
      }));

      res.render("Admin/orders/pending_order_list", {
        title,
        orderdata: formattedOrders,
        session: req.session.user, // Ensure session data is passed here
        msg: req.flash("msg") || "", // Flash message
      });
    } catch (error) {
      console.error("Error fetching order list:", error);
      req.flash("msg", "Error fetching order list");
      res.redirect("/admin/dashboard");
    }
  },
  return_view_order: async (req, res) => {
    try {
      let title = "return_orders";
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
          1: "Pending", // Order is pending
          2: "Success", // Order is successful
          3: "Rejected", // Order was rejected
          4: "Ongoing", // Order is ongoing
          5: "Returned", // Order has been returned
        };
        return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
      }

      // Render the view with order details
      res.render("Admin/orders/pending_order_view", {
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

  create_subadmin: async (req, res) => {
    try {
      let title = "create_subadmin";
      res.render("Admin/admin/create_subadmin", {
        title,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

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
