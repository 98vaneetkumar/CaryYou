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
  
      req.session.user = findUser;
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
      req.session.destroy((err) => {});
      res.redirect("/subadmin/login");
    } catch (error) {
      helper.error(res, error);
    }
  },

  dashboard: async (req, res) => {
    try {
      let title = "dashboard";
      let user = await Models.userModel.countDocuments({ role: 1 });
      let provider = await Models.userModel.countDocuments({ role: 2 });
      res.render("SubAdmin/dashboard", {
        title,
        user,
        provider,
        servicesdata: 0,
        contactus: 0,
        pendingorders: 0,
        activeorders: 0,
        deliveredorders: 0,
        cancelledorders: 0,
        vendors: 0,
        categories: 0,
        subcategories: 0,
        products: 0,
        returnrequests: 0,
        session: req.session.user,
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
      res.render("SubAdmin/user/view_user", {
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
      res.render("SubAdmin/SubAdmin/change_password", {
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
      let users = await Models.userModel.findOne({ _id: req.session.user._id });
      res.render("SubAdmin/commission/commission", {
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
          subAdmincommission: req.body.subAdmincommission,
        }
      );
      let users = await Models.userModel.findOne({ _id: req.session.user._id });
      req.flash("msg", "Updated successfully");
      res.redirect("/subadmin/SubAdmin_commission");
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
          .populate("userId") // Populating the user details based on userId
          .sort({ createdAt: -1 }); // Sorting by creation date, most recent first
        res.render("subAdmin/restaurant/restaurant_list", {
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
        let viewuser = await Models.restaurantModel.findById({ _id: req.params.id }).populate("userId");
        const orders = await Models.orderModel.countDocuments();
        const activeOrders = await Models.orderModel.countDocuments({ status: 1 ,restaurant:req.params.id });
        const deliveredOrders = await Models.orderModel.countDocuments({ status: 2,restaurant:req.params.id});
        const cancelledOrders = await Models.orderModel.countDocuments({ status: 3,restaurant:req.params.id });
        res.render("subAdmin/restaurant/restaurant_view", {
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
        res.redirect("/subAdmin/user_list");
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
  
      //----------------order api-----------------------
  
  
      order_list: async (req, res) => {
        try {
          const title = "restaurant_list";
      
          // Fetch restaurant data and populate references (like userId for restaurant details)
          const restaurants = await Models.restaurantModel
            .find({})
            .populate("userId", "name email countryCode phoneNumber") // Populating user data
            .sort({ createdAt: -1 }); // Sorting by creation date
      
          // Format restaurant data to include all necessary data for rendering
          const formattedRestaurants = restaurants.map((restaurant, index) => ({
            sNo: index + 1,
            image: restaurant.image || "https://avatar.iran.liara.run/public/boy?username=Ash", // Default image if none exists
            name: restaurant.userId?.fullName || "N/A", // Fallback to N/A if userId is not populated
            email: restaurant.userId?.email || "N/A", // Fallback to N/A if email is missing
            phone: `${restaurant.userId?.countryCode || ''}-${restaurant.userId?.phoneNumber || ''}` || "N/A",
            status: restaurant.status || 0, // Default to 0 if status is missing
            id: restaurant._id, // Restaurant ID for action links
          }));
      
          // Render the EJS view with formatted restaurant data
          res.render("subAdmin/restaurant/restaurant_list", {
            title,
            restaurantdata: formattedRestaurants, // Passing formatted restaurant data to the view
            session: req.session.user, // Ensure session data is passed here
            msg: req.flash("msg") || '', // Flash message, if any
          });
      
        } catch (error) {
          console.error("Error fetching restaurant list:", error);
          req.flash("msg", "Error fetching restaurant list");
          res.redirect("/subAdmin/dashboard");
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
          res.render("subAdmin/orders/view_order", {
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
          
            res.render("subAdmin/orders/active_order_list", {
              title,
              orderdata: formattedOrders,
              session: req.session.user, // Ensure session data is passed here
              msg: req.flash("msg") || '', // Flash message
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
                1: "Pending",  // Order is pending
                2: "Success",  // Order is successful
                3: "Rejected", // Order was rejected
                4: "Ongoing",  // Order is ongoing
                5: "Returned", // Order has been returned
              };
              return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
            }
        
    
             // Render the view with order details
              res.render("subAdmin/orders/active_order_view", {
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
          
            res.render("subAdmin/orders/delivered_order_list", {
              title,
              orderdata: formattedOrders,
              session: req.session.user, // Ensure session data is passed here
              msg: req.flash("msg") || '', // Flash message
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
              res.render("subAdmin/orders/delivered_order_view", {
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
          
            res.render("subAdmin/orders/cancel_order_list", {
              title,
              orderdata: formattedOrders,
              session: req.session.user, // Ensure session data is passed here
              msg: req.flash("msg") || '', // Flash message
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
                1: "Pending",  // Order is pending
                2: "Success",  // Order is successful
                3: "Rejected", // Order was rejected
                4: "Ongoing",  // Order is ongoing
                5: "Returned", // Order has been returned
              };
              return statuses[status] || "Unknown"; // If status is unknown, return "Unknown"
            }
        
    
             // Render the view with order details
              res.render("subAdmin/orders/cancel_order_view", {
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



};
