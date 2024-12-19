const Models = require("../../Models/index");
const bcrypt = require("bcrypt");
const helper = require("../../helpers/commonHelper.js");

module.exports = {
  login_page: async (req, res) => {
    res.render("SubAdmin/login_page", { layout: false, msg: req.flash("msg") });
  },

  Login: async (req, res) => {
    try {
      // Step 1: Find user by email and role
      let findUser = await Models.userModel.findOne({
        role: 1,
        email: req.body.email,
      });
  
      // Step 2: If user not found, send a flash message and redirect
      if (!findUser) {
        console.log("Please enter a valid email");
        req.flash("msg", "Incorrect email");
        return res.redirect("/subadmin/login");  // Use return to exit the function early
      }
  
      // Step 3: Check if the password is correct
      let checkPassword = await bcrypt.compare(req.body.password, findUser.password);
      if (!checkPassword) {
        req.flash("msg", "Incorrect password");
        return res.redirect("/subadmin/login");  // Again, use return to exit early
      }
  
      let restaurantDetail = await Models.restaurantModel.findOne({ userId: findUser._id })
        .populate('userId')
        .exec();

        console.log('=====', restaurantDetail)
  
      req.session.subAdmin = findUser;
      if(restaurantDetail) {
        req.session.restaurant = restaurantDetail
      }
      req.flash("msg", "Login Successfully");
  
      setTimeout(() => {
        res.redirect("/subadmin/dashboard");
      }, 500);
    } catch (error) {
      console.error(error);
      req.flash("msg", "An error occurred, please try again later.");
      res.redirect("/subadmin/login");  // Redirect to login in case of error
    }
  },
  
  logout: async (req, res) => {
    try {
      delete req.session.subAdmin
      res.redirect("/subadmin/login");
    } catch (error) {
      helper.error(res, error);
    }
  },

  dashboard: async (req, res) => {
    try {
      console.log("Session Data:", req.session);
      let title = "dashboard";
      let user = await Models.userModel.countDocuments({ role: 1 });
      let provider = await Models.userModel.countDocuments({ role: 2 });
      const orders = await Models.orderModel.countDocuments();
      const pendingorders = await Models.orderModel.countDocuments({
        status: 1,
      });
      const deliveredorders = await Models.orderModel.countDocuments({
        status: 2,
      });
      const cancelledorders = await Models.orderModel.countDocuments({
        status: 3,
      });
      const activeorders = await Models.orderModel.countDocuments({
        status: 4,
      });
      res.render("SubAdmin/dashboard", {
        title,
        user,
        provider,
        servicesdata: 0,
        contactus: 0,
        orders,
        pendingorders,
        deliveredorders,
        cancelledorders,
        activeorders,
        vendors: 0,
        categories: 0,
        subcategories: 0,
        products: 0,
        returnrequests: 0,
        session: req.session.subAdmin,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  user_list: async (req, res) => {
    try {
      let title = "user_list";
      let userdata = await Models.userModel
        .find({ role: 1 })
        .sort({ createdAt: -1 });

      res.render("SubAdmin/user/user_list", {
        title,
        userdata,
        session: req.session.subAdmin,
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
      res.render("SubAdmin/user/view_user", {
        title,
        viewuser,
        session: req.session.subAdmin,
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
      res.redirect("/subadmin/user_list");
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

  subAdmin_profile: async (req, res) => {
    try {
      let title = "subAdmin_profile";
      res.render("SubAdmin/SubAdmin/SubAdmin_profile", {
        title,
        session: req.session,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  update_subAdmin_profile: async (req, res) => {
    try {
      if (req.files && req.files.image) {
        var image = req.files.image;
        if (image) {
          req.body.image = await helper.fileUpload(image, "images");
        }
      }
      console.log(req.session.subAdmin._id);
      const userData = await Models.userModel.findByIdAndUpdate(
        { _id: req.session.subAdmin._id },
        {
          name: req.body.name,
          image: req.body.image,
          phoneNumber: req.body.phone,
        }
      );
      let data = await Models.userModel.findById({ _id: req.session.subAdmin._id });
      req.session.subAdmin = data;
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
      res.render("SubAdmin/SubAdmin/change_password", {
        title,
        session: req.session.subAdmin,
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
      let data = req.session.subAdmin;

      if (data) {
        let comp = await bcrypt.compare(payload.oldPassword, data.password);

        if (comp) {
          const bcryptPassword = await bcrypt.hash(req.body.newPassword, 10);
          let create = await Models.userModel.updateOne(
            { _id: data._id },
            { password: bcryptPassword }
          );
          req.session.subAdmin = create;
          req.flash("msg", "Update password successfully");
          res.redirect("/subadmin/login");
        } else {
          req.flash("msg", "Old password do not match");
          res.redirect("/subadmin/change_password");
        }
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  subAdmin_commission: async (req, res) => {
    try {
      let title = "commission";
      let users = await Models.userModel.findOne({ _id: req.session.subAdmin._id });
      res.render("SubAdmin/commission/commission", {
        title,
        users,
        session: req.session.subAdmin,
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
        { _id: req.session.subAdmin._id },
        {
          subAdmincommission: req.body.subAdmincommission,
        }
      );
      let users = await Models.userModel.findOne({ _id: req.session.subAdmin._id });
      req.flash("msg", "Updated successfully");
      res.redirect("/subadmin/SubAdmin_commission");
    } catch (error) {
      console.log(error);
      throw error;
    }
  },





  //---------------restaurant apis-------------------

  restaurant_list: async (req, res) => {
    try {
      let title = "provider_list";
      let userdata = await Models.restaurantModel
        .find()
        .populate("userId") // Populating the user details based on userId
        .sort({ createdAt: -1 }); // Sorting by creation date, most recent first
      res.render("subAdmin/restaurant/restaurant_list", {
        title,
        userdata, // Passing the list of restaurants to the view
        session: req.session.subAdmin, // Passing the session data for authentication purposes
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
      let viewuser = await Models.restaurantModel
        .findById({ _id: req.params.id })
        .populate("userId");
      const orders = await Models.orderModel.countDocuments({restaurant: req.params.id,});
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

      res.render("subAdmin/restaurant/restaurant_view", {
        title,
        viewuser,
        category: viewuser?.category?.length || 0,
        subCategory: viewuser?.subCategory?.length || 0,
        products: viewuser?.products?.length || 0,
        orders,
        pendingOrders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        session: req.session.subAdmin,
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
      const _id=req.body.id
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
          ? { createdAt: { $gte: new Date(startDate) , $lte: new Date(endDate) } }
          : {};
      // Fetch filtered restaurant data
      const userdata = await Models.restaurantModel
        .findById({_id, ...dateQuery })
        .populate("userId") // Populating the user details based on userId
        .sort({ createdAt: -1 }); // Sorting by creation date, most recent first
        const orders = await Models.orderModel.countDocuments({restaurant: req.params.id,...dateQuery});
        const pendingOrders = await Models.orderModel.countDocuments({
        status: 1,
        restaurant: req.params.id,
        ...dateQuery
      });
      const activeOrders = await Models.orderModel.countDocuments({
        status: 4,
        restaurant: req.params.id,
        ...dateQuery
      });
      const deliveredOrders = await Models.orderModel.countDocuments({
        status: 2,
        restaurant: req.params.id,
        ...dateQuery
      });
      const cancelledOrders = await Models.orderModel.countDocuments({
        status: 3,
        restaurant: req.params.id,
        ...dateQuery
      });
  console.log("userdata",userdata)

       return res.json({
          userdata,
          category: userdata?.category?.length || 0,
          subCategory: userdata?.subcategory?.length || 0,
          products: userdata?.products?.length || 0,
          orders,
          pendingOrders,
          activeOrders,
          deliveredOrders,
          cancelledOrders,
        })
    } catch (error) {
      console.error("Error in restaurant_view:", error);
      res.status(500).send("Internal Server Error");
    }
  },
  delete_restaurant: async (req, res) => {
    try {
      let userid = req.body.id;
      let remove = await Models.userModel.deleteOne({ _id: userid });
      res.redirect("/subAdmin/user_list");
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  restaurant_status: async (req, res) => {
    try {
      // Update the restaurant status
      const updateRestaurant = await Models.restaurantModel.updateOne(
        { _id: req.body.id },
        { status: req.body.value }
      );
  
      if (updateRestaurant.nModified > 0) {
        const restaurant = await Models.restaurantModel.findById(req.body.id);
  
        if (restaurant && restaurant.userId) {
          await Models.userModel.updateOne(
            { _id: restaurant.userId },
            { status: req.body.value }
          );
        }
  
        req.flash("msg", "Status updated successfully");
        
        // Send explicit boolean based on the updated status
        return res.status(200).send(req.body.value == 1); // `true` for active, `false` for inactive
      } else {
        // Handle no modification
        return res.status(404).send({ error: "No changes made or restaurant not found." });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  },



    //<----------------------order apis------------------->
    restaurant_order_list: async (req, res) => {
      try {
        const title = "provider_list";
        const orders = await Models.orderModel
          .find({restaurant:req.params._id})
          .populate("orderBy", "fullName") 
          .populate("restaurant", "name")
          .sort({ createdAt: -1 });
        
        const formattedOrders = orders.map((order, index) => ({
          sNo: index + 1,
          orderBy: order.orderBy?.fullName || "N/A",
          restaurant: order.restaurant?.name || "N/A",
          item: order.item || "N/A",
          orderDateTime: order.createdAt ? order.createdAt.toLocaleString() : "N/A",
          status: order.status || 0, // Default to 0 if status is missing
          id: order._id,
        }));
    
        res.render("subAdmin/restaurant/restaurantOrders/order_list", {
          title,
          restaurant:req.params._id,
          orderdata: formattedOrders,
          session: req.session.subAdmin, // Ensure session data is passed here
          msg: req.flash("msg") || '', // Flash message
        });
      } catch (error) {
        console.error("Error fetching order list:", error);
        req.flash("msg", "Error fetching order list");
        res.redirect("/subAdmin/dashboard");
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
        res.render("subAdmin/restaurant/restaurantOrders/view_order", {
          title, // Pass the title to the view
          order, // Pass the order details to the view
          orderStatus: getOrderStatus(order.status), // Pass the order status
          session: req.session.subAdmin, // Pass session details (if needed)
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
          .find({ status: 4 ,restaurant:req.params._id})
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
  
        res.render("subAdmin/restaurant/restaurantOrders/active_order_list", {
          title,
          restaurant:req.params._id,
          orderdata: formattedOrders,
          session: req.session.subAdmin, // Ensure session data is passed here
          msg: req.flash("msg") || "", // Flash message
        });
      } catch (error) {
        console.error("Error fetching order list:", error);
        req.flash("msg", "Error fetching order list");
        res.redirect("/subAdmin/dashboard");
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
        res.render("subAdmin/restaurant/restaurantOrders/active_order_view", {
          title, // Pass the title to the view
          order, // Pass the order details to the view
          orderStatus: getOrderStatus(order.status), // Pass the order status
          session: req.session.subAdmin, // Pass session details (if needed)
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
          .find({ status: 2 ,restaurant:req.params._id})
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
  
        res.render("subAdmin/restaurant/restaurantOrders/delivered_order_list", {
          title,
          restaurant:req.params._id,
          orderdata: formattedOrders,
          session: req.session.subAdmin, // Ensure session data is passed here
          msg: req.flash("msg") || "", // Flash message
        });
      } catch (error) {
        console.error("Error fetching order list:", error);
        req.flash("msg", "Error fetching order list");
        res.redirect("/subAdmin/dashboard");
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
        res.render("subAdmin/restaurant/restaurantOrders/delivered_order_view", {
          title, // Pass the title to the view
          order, // Pass the order details to the view
          orderStatus: getOrderStatus(order.status), // Pass the order status
          session: req.session.subAdmin, // Pass session details (if needed)
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
          .find({ status: 3 ,restaurant:req.params._id})
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
  
        res.render("subAdmin/restaurant/restaurantOrders/cancel_order_list", {
          title,
          restaurant:req.params._id,
          orderdata: formattedOrders,
          session: req.session.subAdmin, // Ensure session data is passed here
          msg: req.flash("msg") || "", // Flash message
        });
      } catch (error) {
        console.error("Error fetching order list:", error);
        req.flash("msg", "Error fetching order list");
        res.redirect("/subAdmin/dashboard");
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
        res.render("subAdmin/restaurant/restaurantOrders/cancel_order_view", {
          title, // Pass the title to the view
          order, // Pass the order details to the view
          orderStatus: getOrderStatus(order.status), // Pass the order status
          session: req.session.subAdmin, // Pass session details (if needed)
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
          .find({ status: 1,restaurant:req.params._id })
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
  
        res.render("subAdmin/restaurant/restaurantOrders/pending_order_list", {
          title,
          restaurant:req.params._id,
          orderdata: formattedOrders,
          session: req.session.subAdmin, // Ensure session data is passed here
          msg: req.flash("msg") || "", // Flash message
        });
      } catch (error) {
        console.error("Error fetching order list:", error);
        req.flash("msg", "Error fetching order list");
        res.redirect("/subAdmin/dashboard");
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
        res.render("subAdmin/restaurant/restaurantOrders/pending_order_view", {
          title, // Pass the title to the view
          order, // Pass the order details to the view
          orderStatus: getOrderStatus(order.status), // Pass the order status
          session: req.session.subAdmin, // Pass session details (if needed)
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
          .find({ status: 5 ,restaurant:req.params._id})
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
  
        res.render("subAdmin/restaurant/restaurantOrders/pending_order_list", {
          title,
          restaurant:req.params._id,
          orderdata: formattedOrders,
          session: req.session.subAdmin, // Ensure session data is passed here
          msg: req.flash("msg") || "", // Flash message
        });
      } catch (error) {
        console.error("Error fetching order list:", error);
        req.flash("msg", "Error fetching order list");
        res.redirect("/subAdmin/dashboard");
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
        res.render("subAdmin/restaurant/restaurantOrders/pending_order_view", {
          title, // Pass the title to the view
          order, // Pass the order details to the view
          orderStatus: getOrderStatus(order.status), // Pass the order status
          session: req.session.subAdmin, // Pass session details (if needed)
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
      
        res.render("subAdmin/restaurant/restaurantCatSubCatProduct/restaurant_category_list", {
          title,
          viewuser,
          restaurant:req.params._id,
          session: req.session.subAdmin,
          msg: req.flash("msg"),
        });
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
          
  
          res.render("subAdmin/restaurant/restaurantCatSubCatProduct/restaurant_subCategory_list", {
          title,
          viewuser,
          restaurant:req.params._id,
          session: req.session.subAdmin,
          msg: req.flash("msg"),
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    restaurant_product: async (req, res) => {
      try {
        let title = "provider_list";
        const viewuser = await Models.restaurantModel
        .findById(req.params._id)
        .populate("userId") // Populate user information
        .lean(); // Use `.lean()` to get a plain JavaScript object
      
      if (viewuser) {
        // Map subCategories with corresponding category data
        viewuser.products = viewuser.products.map((subCat) => {
          const matchedSubCategory = viewuser.subCategory.find(
            (cat) => cat._id.toString() === subCat.subCategoryId.toString()
          );
      
          return {
            ...subCat,
            subCategoryName: matchedSubCategory ? matchedSubCategory.name : null,
            subCategoryImage: matchedSubCategory ? matchedSubCategory.image : null,
          };
        });
      }
      
      console.log(viewuser);
      
  
          res.render("subAdmin/restaurant/restaurantCatSubCatProduct/restaurant_product_list", {
          title,
          viewuser,
          restaurant:req.params._id,
          session: req.session.subAdmin,
          msg: req.flash("msg"),
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
    restaurant_product_view: async (req, res) => {
      try {
        let title = "provider_list";
        const viewuser = await Models.restaurantModel
        .findById(req.params._id)
        .populate("userId") // Populate user information
        .lean(); // Use `.lean()` to get a plain JavaScript object
      
      if (viewuser) {
        // Map subCategories with corresponding category data
        viewuser.products = viewuser.products.map((subCat) => {
          const matchedSubCategory = viewuser.subCategory.find(
            (cat) => cat._id.toString() === subCat.subCategoryId.toString()
          );
      
          return {
            ...subCat,
            subCategoryName: matchedSubCategory ? matchedSubCategory.name : null,
            subCategoryImage: matchedSubCategory ? matchedSubCategory.image : null,
          };
        });
      }
      
      console.log(viewuser);
      
  
          res.render("subAdmin/restaurant/restaurantCatSubCatProduct/restaurant_product_list", {
          title,
          viewuser,
          restaurant:req.params._id,
          session: req.session.subAdmin,
          msg: req.flash("msg"),
        });
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  
      //----------------order api-----------------------
  
  
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
            orderDateTime: order.createdAt ? order.createdAt.toLocaleString() : "N/A",
            status: order.status || 0, // Default to 0 if status is missing
            id: order._id,
          }));
      
          res.render("subAdmin/orders/order_list", {
            title,
            orderdata: formattedOrders,
            session: req.session.subAdmin, // Ensure session data is passed here
            msg: req.flash("msg") || '', // Flash message
          });
        } catch (error) {
          console.error("Error fetching order list:", error);
          req.flash("msg", "Error fetching order list");
          res.redirect("/subAdmin/dashboard");
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
          res.render("subAdmin/orders/view_order", {
            title, // Pass the title to the view
            order, // Pass the order details to the view
            orderStatus: getOrderStatus(order.status), // Pass the order status
            session: req.session.subAdmin, // Pass session details (if needed)
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
    
          res.render("subAdmin/orders/active_order_list", {
            title,
            orderdata: formattedOrders,
            session: req.session.subAdmin, // Ensure session data is passed here
            msg: req.flash("msg") || "", // Flash message
          });
        } catch (error) {
          console.error("Error fetching order list:", error);
          req.flash("msg", "Error fetching order list");
          res.redirect("/subAdmin/dashboard");
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
          res.render("subAdmin/orders/active_order_view", {
            title, // Pass the title to the view
            order, // Pass the order details to the view
            orderStatus: getOrderStatus(order.status), // Pass the order status
            session: req.session.subAdmin, // Pass session details (if needed)
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
    
          res.render("subAdmin/orders/delivered_order_list", {
            title,
            orderdata: formattedOrders,
            session: req.session.subAdmin, // Ensure session data is passed here
            msg: req.flash("msg") || "", // Flash message
          });
        } catch (error) {
          console.error("Error fetching order list:", error);
          req.flash("msg", "Error fetching order list");
          res.redirect("/subAdmin/dashboard");
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
          res.render("subAdmin/orders/delivered_order_view", {
            title, // Pass the title to the view
            order, // Pass the order details to the view
            orderStatus: getOrderStatus(order.status), // Pass the order status
            session: req.session.subAdmin, // Pass session details (if needed)
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
    
          res.render("subAdmin/orders/cancel_order_list", {
            title,
            orderdata: formattedOrders,
            session: req.session.subAdmin, // Ensure session data is passed here
            msg: req.flash("msg") || "", // Flash message
          });
        } catch (error) {
          console.error("Error fetching order list:", error);
          req.flash("msg", "Error fetching order list");
          res.redirect("/subAdmin/dashboard");
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
          res.render("subAdmin/orders/cancel_order_view", {
            title, // Pass the title to the view
            order, // Pass the order details to the view
            orderStatus: getOrderStatus(order.status), // Pass the order status
            session: req.session.subAdmin, // Pass session details (if needed)
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
    
          res.render("subAdmin/orders/pending_order_list", {
            title,
            orderdata: formattedOrders,
            session: req.session.subAdmin, // Ensure session data is passed here
            msg: req.flash("msg") || "", // Flash message
          });
        } catch (error) {
          console.error("Error fetching order list:", error);
          req.flash("msg", "Error fetching order list");
          res.redirect("/subAdmin/dashboard");
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
          res.render("subAdmin/orders/pending_order_view", {
            title, // Pass the title to the view
            order, // Pass the order details to the view
            orderStatus: getOrderStatus(order.status), // Pass the order status
            session: req.session.subAdmin, // Pass session details (if needed)
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


};
