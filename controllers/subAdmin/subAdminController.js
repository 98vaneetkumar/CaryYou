const Models = require("../../Models/index");
const bcrypt = require("bcrypt");
const helper = require("../../helpers/commonHelper.js");
const mongoose = require("mongoose");

module.exports = {
  login_page: async (req, res) => {
    res.render("SubAdmin/login_page", { layout: false, msg: req.flash("msg") });
  },

  Login: async (req, res) => {
    try {
      // Find subadmin by email and role
      let findUser = await Models.userModel.findOne({
        role: 1, // Assuming 1 is the subadmin role
        email: req.body.email,
      });

      // If subadmin not found, send error message
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
      }

      // Find restaurant details for the subadmin
      let restaurantDetail = await Models.restaurantModel
        .findOne({
          userId: findUser._id,
        })
        .populate("userId");

      // Update device token if provided
      if (req.body.deviceToken) {
        await Models.userModel.updateOne(
          { deviceToken: req.body.deviceToken },
          { _id: findUser._id }
        );
      }

      // Store subadmin session
      req.session.subAdmin = findUser;

      // req.session[findUser._id.toString()] = findUser;

      if (restaurantDetail) {
        req.session.restaurant = restaurantDetail;
      }

      // Send success response
      return res.status(200).json({
        success: true,
        message: "Login successful",
        redirectUrl: "/subadmin/dashboard", // Include redirect URL
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "An error occurred. Please try again later.",
      });
    }
  },

  logout: async (req, res) => {
    try {
      delete req.session.subAdmin;
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
      const orders = await Models.orderModel.countDocuments({restaurant:req.session.restaurant._id});
      const pendingorders = await Models.orderModel.countDocuments({
        status: 1,restaurant:req.session.restaurant._id,
      });
      const deliveredorders = await Models.orderModel.countDocuments({
        status: 2,restaurant:req.session.restaurant._id,
      });
      const cancelledorders = await Models.orderModel.countDocuments({
        status: 3,restaurant:req.session.restaurant._id,
      });
      const activeorders = await Models.orderModel.countDocuments({
        status: 4,restaurant:req.session.restaurant._id,
      });
      let restaurantId = await Models.restaurantModel.findOne({
        _id: req.session.restaurant._id,
      });
      res.render("SubAdmin/dashboard", {
        title,
        user,
        provider,
        restaurantId,
        // restaurant: restaurantId._id,
        servicesdata: 0,
        contactus: 0,
        orders,
        pendingorders,
        deliveredorders,
        cancelledorders,
        activeorders,
        accounting: 0,
        categories: restaurantId.category.length || 0,
        subcategories: restaurantId.subCategory.length || 0,
        products: restaurantId.products.length || 0,
        returnrequests: 0,
        banners:restaurantId.banner_image.length || 0,
        session: req.session.subAdmin,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },


  subAdmin_profile: async (req, res) => {
    try {
      let title = "subAdmin_profile";
      let users = await Models.userModel.findOne({
        _id: req.session.subAdmin._id,
      });
      let restaurantDetail=await Models.restaurantModel.findOne({userId:req.session.subAdmin._id})
      res.render("SubAdmin/subAdmin/subAdmin_profile", {
        title,
        // restaurant:req.session.restaurant._id,
        users,
        restaurantDetail,
        session: req.session.subAdmin,
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
      let data = await Models.userModel.findById({
        _id: req.session.subAdmin._id,
      });
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
      res.render("SubAdmin/subAdmin/change_password", {
        title,
        // restaurant:req.session.restaurant._id,
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
      let users = await Models.userModel.findOne({
        _id: req.session.subAdmin._id,
      });
      res.render("SubAdmin/commission/commission", {
        title,
        users,
        // restaurant:req.session.restaurant._id,
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
      let users = await Models.userModel.findOne({
        _id: req.session.subAdmin._id,
      });
      req.flash("msg", "Updated successfully");
      res.redirect("/subadmin/SubAdmin_commission");
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  bannerList:async(req,res)=>{
    try {
      const title = "banners";
      const viewuser = await Models.restaurantModel
        .findById({ _id: req.session.restaurant._id })
 
      res.render(
        "SubAdmin/banner/banner_list",
        {
          title,
          viewuser,
          // restaurant: req.params._id,
          session: req.session.subAdmin,
          msg: req.flash("msg"),
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  addBanner_view:async(req,res)=>{
    try {
      let title="banners"
      res.render("SubAdmin/banner/add_banner", 
        { 
          title,
          // restaurant:req.params.restaurantId,
          session:req.session.subAdmin, 
          msg: req.flash("msg")||"" 
        });
    } catch (error) {
      console.log("error", error);
      throw error;
    }
  },
  create_Bannner:async(req,res)=>{
    try {
      let profilePicturePath = null;
      if (req.files && req.files.image) {
            profilePicturePath = await helper.fileUpload(
              req.files.image
            );
      }
      let objToSave={
          image:profilePicturePath
        }
      await Models.restaurantModel.findByIdAndUpdate(
        { _id: req.session.restaurant._id },
        {
          $push: { banner_image: objToSave }, // Push the new subCategoryObj
        },
        {
          upsert: true, // Create the document if it doesn't exist
        }// Creates the document if it doesn't exist
      );
        res.redirect(`bannerList`);
    } catch (error) {
      throw error
    }
  },
  deleteBanner:async(req,res)=>{
    try {
      let _id=req.body.id
      await Models.restaurantModel.findByIdAndUpdate(
        { _id: req.session.restaurant._id },
        {
          $pull: { banner_image: { _id: _id } }, // Match the object by its _id
        },
        {
          new: true // Return the updated document
        }
      );
      res.redirect(`bannerList`);

    } catch (error) {
      throw error;
    }
  },

  //---------------restaurant apis-------------------

  restaurant_dashboard_filter: async (req, res) => {
    try {
      const title = "provider_list";
      const filter = req.body.filter || "all"; // Get the filter parameter from the request body
      const _id = req.body.id;
      // Calculate date range based on the filter
      const now = new Date();
      let startDate, endDate;
    
      // Switch to calculate startDate and endDate based on the filter
      switch (filter) {
        case "today":
          startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
          endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
          break;
        
        case "weekly":
          startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7, 0, 0, 0, 0));
          endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
          break;
    
        case "monthly":
          startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, now.getUTCDate(), 0, 0, 0, 0));
          endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
          break;
    
        case "3months":
          startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 3, now.getUTCDate(), 0, 0, 0, 0));
          endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
          break;
    
        case "6months":
          startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 6, now.getUTCDate(), 0, 0, 0, 0));
          endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
          break;
    
        case "1year":
          startDate = new Date(Date.UTC(now.getUTCFullYear() - 1, now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
          endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
          break;
    
        case "5years":
          startDate = new Date(Date.UTC(now.getUTCFullYear() - 5, now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
          endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
          break;
    
        default:
          startDate = null; // No date filter
          endDate = null;
      }
    
      const dateQuery =
        startDate && endDate
          ? {
              createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
            }
          : {}; // Apply date filter only if startDate and endDate are provided
    
      // Fetch filtered restaurant data
      const userdata = await Models.restaurantModel
        .findById({ _id, ...dateQuery })
        .populate("userId")
        .sort({ createdAt: -1 });
    
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
    
      // Aggregation pipelines for category, subcategory, and products
      const categoryPipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(req.body.id) } },
        { $unwind: "$category" },
        // Only apply date filter if startDate and endDate are defined
        ...(startDate && endDate ? [{ $match: { "category.createdAt": { $gte: startDate, $lte: endDate } } }] : []),
        { $count: "matchingCategoriesCount" },
      ];
    
      const subCategoryPipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(req.body.id) } },
        { $unwind: "$subCategory" },
        // Only apply date filter if startDate and endDate are defined
        ...(startDate && endDate ? [{ $match: { "subCategory.createdAt": { $gte: startDate, $lte: endDate } } }] : []),
        { $count: "matchingSubCategoriesCount" },
      ];
    
      const productPipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(req.body.id) } },
        { $unwind: "$products" },
        // Only apply date filter if startDate and endDate are defined
        ...(startDate && endDate ? [{ $match: { "products.createdAt": { $gte: startDate, $lte: endDate } } }] : []),
        { $count: "matchingProductCount" },
      ];
    
      const bannerPipeline = [
        { $match: { _id: new mongoose.Types.ObjectId(req.body.id) } },
        { $unwind: "$banner_image" },
        // Only apply date filter if startDate and endDate are defined
        ...(startDate && endDate ? [{ $match: { "banner_image.createdAt": { $gte: startDate, $lte: endDate } } }] : []),
        { $count: "matchingbannerCount" },
      ];
      // Execute the aggregation pipelines
      const categoryResult = await Models.restaurantModel.aggregate(categoryPipeline);
      const subCategoryResult = await Models.restaurantModel.aggregate(subCategoryPipeline);
      const productResult = await Models.restaurantModel.aggregate(productPipeline);
      const bannerResult = await Models.restaurantModel.aggregate(bannerPipeline);

    
      const category = categoryResult.length > 0 ? categoryResult[0].matchingCategoriesCount : 0;
      const subcategory = subCategoryResult.length > 0 ? subCategoryResult[0].matchingSubCategoriesCount : 0;
      const product = productResult.length > 0 ? productResult[0].matchingProductCount : 0;
      const banners = bannerResult.length > 0 ? bannerResult[0].matchingbannerCount : 0;

    
    
      return res.json({
        userdata,
        category,
        subCategory: subcategory,
        products: product,
        banners:banners,
        orders,
        pendingOrders,
        activeOrders,
        deliveredOrders,
        cancelledOrders,
        vendors: 0,
      });
    } catch (error) {
      console.error("Error in restaurant_view:", error);
      res.status(500).send("Internal Server Error");
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
        return res
          .status(404)
          .send({ error: "No changes made or restaurant not found." });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).send({ error: "Internal Server Error" });
    }
  },

  restaurant_category: async (req, res) => {
    try {
      const title = "Restaurant Category List";
      const viewuser = await Models.restaurantModel
        .findById({ _id: req.session.restaurant._id })
        .populate("userId", "name email"); // Fetch limited fields if possible; 
        if (viewuser && viewuser.category) {
          // Sort categories by createdAt in descending order (latest first)
          viewuser.category.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
      res.render(
        "SubAdmin/restaurant/restaurantCatSubCatProduct/restaurant_category_list",
        {
          title,
          viewuser,
          // restaurant: req.params._id,
          session: req.session.subAdmin,
          msg: req.flash("msg"),
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  add_category:async(req,res)=>{
    try {
      const title = "Restaurant Category List";
      res.render("SubAdmin/restaurant/restaurantCatSubCatProduct/add_category", 
        { 
          title: title,
          // restaurant: req.params._id, 
          session:req.session.subAdmin,
          msg: req.flash("msg")||""
          });
    } catch (error) {
      throw error
    }
  },
  Create_category:async(req,res)=>{
    try {
      const title = "Restaurant Category List";
        // Handle file upload using commonHelper
        let profilePicturePath = null;
        if (req.files && req.files.image) {
              profilePicturePath = await helper.fileUpload(
                req.files.image
              );
        }
        let objToSave={
            name:req.body.name,
            image:profilePicturePath
          }
       
          // Update restaurant model to add the subcategory
      await Models.restaurantModel.findByIdAndUpdate(
        { _id: req.session.restaurant._id },
        {
          $push: { category: objToSave }, // Push the new subCategoryObj
        },
        {
          upsert: true, // Create the document if it doesn't exist
        }// Creates the document if it doesn't exist
      );
        res.redirect(`restaurant_category`);
      return
    } catch (error) {
      throw error
    }
  },
  edit_category:async(req,res)=>{
   try {
    const title = "Restaurant Category List";
    let restaurant = await Models.restaurantModel.findOne({_id:req.session.restaurant._id});
    const category = restaurant.category.find(category => category._id.toString() === req.params._id);
console.log("Restaurant category",category)
    res.render("SubAdmin/restaurant/restaurantCatSubCatProduct/edit_category", 
      { 
        title: title,
        // restaurant: req.params.restaurantId, 
        category:category,
        session:req.session.subAdmin,
        msg: req.flash("msg")||""
        });
   } catch (error) {
    throw error
   }
  },
  update_category:async(req,res)=>{
    try {
      const title = "Restaurant Category List";
      let profilePicturePath = null;
    
      // Check and upload new image if provided
      if (req.files && req.files.image) {
        profilePicturePath = await helper.fileUpload(req.files.image);
      }
    
      // Find the restaurant
      const restaurant = await Models.restaurantModel.findOne({
        _id: req.session.restaurant._id,
      });
    
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
    
      // Find the specific category by its ID
      const category = restaurant.category.find(
        (cat) => cat._id.toString() === req.body.id
      );
    
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    
      // Update the category properties directly
      category.name = req.body.name;
    
      if (profilePicturePath) {
        // Update the image if a new one is uploaded
        const oldImagePath = category.image;
        category.image = profilePicturePath;
    
        // Optionally delete the old image file
        if (oldImagePath) {
          await helper.deleteFile(oldImagePath);
        }
      }
    
      // Save the updated restaurant document
      await restaurant.save();
    
      // Redirect to the appropriate route
      res.redirect(`restaurant_category`);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "An error occurred while updating the category" });
    }
    
  },

  restaurant_subCategory: async (req, res) => {
    try {

      const title = "Restaurant subCategory List";
      const viewuser = await Models.restaurantModel
        .findById(req.session.restaurant._id)
        .populate("userId") // Populate user information
        .sort({ createdAt: -1 })
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
      if (viewuser && viewuser.subCategory) {
        // Sort categories by createdAt in descending order (latest first)
        viewuser.subCategory.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      // Render the category list
      res.render(
        "SubAdmin/restaurant/restaurantCatSubCatProduct/restaurant_subCategory_list",
        {
          title,
          viewuser,
          // restaurant: req.params._id,
          session: req.session.subAdmin,
          msg: req.flash("msg"),
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  add_subCategory:async(req,res)=>{
    try {
      const title = "Restaurant subCategory List";
      let restaurant=await Models.restaurantModel.findOne({_id:req.session.restaurant._id})
      res.render("SubAdmin/restaurant/restaurantCatSubCatProduct/add_subCategory", 
        { 
          title: title,
          // restaurant: req.params._id, 
          category:restaurant.category,
          session:req.session.subAdmin,
          msg: req.flash("msg")||""
          });
    } catch (error) {
      throw error
    }
  },
  Create_subCategory: async (req, res) => {
    try {
      const title = "Restaurant subCategory List";
      // Handle file upload using commonHelper
      let profilePicturePath = null;
      if (req.files && req.files.image) {
        profilePicturePath = await helper.fileUpload(req.files.image);
      }
  
      // Prepare subcategory object to save
      const subCategoryObj = {
        name: req.body.name,
        image: profilePicturePath,
        categoryId: req.body.categoryId,
        subCategoryId: req.body.subCategoryId, // Link subcategory to the parent category
      };
  
      // Update restaurant model to add the subcategory
      await Models.restaurantModel.findByIdAndUpdate(
        { _id: req.session.restaurant._id },
        {
          $push: { subCategory: subCategoryObj }, // Push the new subCategoryObj
        },
        {
          upsert: true, // Create the document if it doesn't exist
        }// Creates the document if it doesn't exist
      );

      res.redirect(`restaurant_subCategory`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  
  edit_subCategory: async (req, res) => {
    try {
      const title = "Restaurant subCategory List";
      
      let restaurant1 = await Models.restaurantModel.findOne({ _id: req.session.restaurant._id });

      const subCategory = restaurant1.subCategory.find(subCategory => subCategory._id.toString() === req.params._id);

      res.render("SubAdmin/restaurant/restaurantCatSubCatProduct/edit_subcategory", {
        title: title,
        // restaurant: req.params.restaurantId,
        restaurantData:restaurant1,
        subCategory: subCategory,
        session: req.session.subAdmin,
        msg: req.flash("msg") || ""
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("An error occurred while processing the request");
    }
  },
  
  update_subCategory: async (req, res) => {
    try {
      const title = "Restaurant SubCategory List";
      let profilePicturePath = null;
    
      // Check and upload new image if provided
      if (req.files && req.files.image) {
        profilePicturePath = await helper.fileUpload(req.files.image);
      }
    
      // Find the restaurant
      const restaurant = await Models.restaurantModel.findOne({
        _id: req.session.restaurant._id,
      });
    
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
    
      // Find the specific subcategory by its ID
      const subCategory = restaurant.subCategory.find(
        (subCat) => subCat._id.toString() === req.body.id
      );
    
      if (!subCategory) {
        return res.status(404).json({ message: "Subcategory not found" });
      }
    
      // Update the fields of the existing subcategory
      subCategory.name = req.body.name;
      subCategory.categoryId = req.body.categoryId;
    
      if (profilePicturePath) {
        // Update the image field with the new path
        const oldImagePath = subCategory.image;
        subCategory.image = profilePicturePath;
    
        // Optionally delete the old image file
        if (oldImagePath) {
          await helper.deleteFile(oldImagePath);
        }
      }
    
      // Save the updated restaurant document
      await restaurant.save();
    
      // Redirect to the appropriate route
      res.redirect(`restaurant_subCategory`);
    } catch (error) {
      console.error("Error updating subcategory:", error);
      res.status(500).json({ message: "An error occurred while updating the subcategory" });
    }
    
  },
  
  restaurant_product: async (req, res) => {
    try {
      let title = "provider_list";
      const viewuser = await Models.restaurantModel
        .findById(req.session.restaurant._id)
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
            subCategoryName: matchedSubCategory
              ? matchedSubCategory.name
              : null,
            subCategoryImage: matchedSubCategory
              ? matchedSubCategory.image
              : null,
          };
        });
      }

      if (viewuser && viewuser.products) {
        // Sort categories by createdAt in descending order (latest first)
        viewuser.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      res.render(
        "SubAdmin/restaurant/restaurantCatSubCatProduct/restaurant_product_list",
        {
          title,
          viewuser,
          // restaurant: req.params._id,
          session: req.session.subAdmin,
          msg: req.flash("msg"),
        }
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  add_product: async (req, res) => {
    try {
      const title = "provider_list";
      const restaurant = await Models.restaurantModel.findOne({ _id: req.session.restaurant._id });
      res.render("SubAdmin/restaurant/restaurantCatSubCatProduct/add_product", {
        title: title,
        subcategories: restaurant.subCategory, // Categories associated with the restaurant
        session: req.session.subAdmin, // Subadmin session data
        msg: req.flash("msg") || "", // Flash messages, if any
      });
    } catch (error) {
      console.log("error in add_product", error);
      throw error;
    }
  },
  Create_product: async (req, res) => {
    try {
      const title = "provider_list";
      let productImagePath = [];
  
      // Handle file upload using helper method
      if (req.files && req.files.images) {
        const images = req.files.images;
  
        // Handle multiple image uploads
        for (let i = 0; i < images.length; i++) {
          const imagePath = await helper.fileUpload(images[i]);
          productImagePath.push(imagePath);
        }
      }
      // Prepare product object to save
      const productObj = {
        itemName: req.body.itemName,
        price: req.body.price,
        description: req.body.description,
        size: req.body.size, // Optional
        images: productImagePath, // Array of image paths
        subCategoryId: req.body.subCategoryId,
        restaurantId: req.session.restaurant._id, // Assuming the session has restaurant ID
      };
  
      // Add the new product to the restaurant's products list
      await Models.restaurantModel.findByIdAndUpdate(
        { _id: req.session.restaurant._id },
        { $push: { products: productObj } },
        {
          upsert: true, // Create the document if it doesn't exist
        }// Creates the document if it doesn't exist  // Assuming `products` is an array field in restaurant schema
      );
  
      // Redirect to product list page or send success response
      res.redirect(`restaurant_product`);
    } catch (error) {
      console.error(error);  // Log error details
      res.status(500).json({ error: error.message || "Failed to create product" });
    }
  },
  edit_product: async (req, res) => {
    try {
      const title = "provider_list";
  
      // Fetch the restaurant based on the session data
      let restaurant = await Models.restaurantModel.findOne({ _id: req.session.restaurant._id });
  
      // Find the product from the restaurant's product list using the ID
      const product = restaurant.products.find(products => products._id.toString() === req.params._id);
      res.render("SubAdmin/restaurant/restaurantCatSubCatProduct/edit_product", {
        title: title,
        restaurantData: restaurant,
        products: product,
        session: req.session.subAdmin,
        msg: req.flash("msg") || ""
      });
    } catch (error) {
      console.error("Error in edit_product:", error);
      res.status(500).send("An error occurred while processing the request");
    }
  },
  update_product: async (req, res) => {
    try {
      const {
        itemName,
        price,
        size,
        description,
        subcategory,
        productId,
        removeImages,
      } = req.body;
    
      // Initialize an array to store the paths of newly uploaded images
      let productImagePath = [];
    
      // Handle file uploads for new images
      if (req.files && req.files['newImages[]']) {
        // Ensure that the images are handled as an array
        const images = Array.isArray(req.files['newImages[]'])
          ? req.files['newImages[]']
          : [req.files['newImages[]']];
    
        for (const image of images) {
          const imagePath = await helper.fileUpload(image); // Upload using your helper
          productImagePath.push(imagePath);
        }
      }
    
      // Fetch the restaurant document
      const restaurant = await Models.restaurantModel.findOne({
        _id: req.session.restaurant._id,
      });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
    
      // Find the product to update by ID
      const productIndex = restaurant.products.findIndex(
        (product) => product._id.toString() === productId
      );
      if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found" });
      }
    
      // Retrieve the product to update
      const productToUpdate = restaurant.products[productIndex];
      let updatedImages = productToUpdate.images || [];
    
      // Handle removal of specified images
      if (removeImages) {
        const imagesToRemove = JSON.parse(removeImages); // Parse JSON string of image paths
        updatedImages = updatedImages.filter((img) => !imagesToRemove.includes(img));
    
        // Optionally delete images from the server
        for (const img of imagesToRemove) {
          await helper.deleteFile(img); // Use helper to remove files
        }
      }
    
      // Add newly uploaded images to the list
      updatedImages = [...updatedImages, ...productImagePath];
    
      // Update product details
      restaurant.products[productIndex] = {
        ...productToUpdate.toObject(), // Copy the original product object
        itemName,
        price,
        size,
        description,
        subCategoryId: subcategory,
        images: updatedImages,
      };
    
      // Save the updated restaurant document
      await restaurant.save();
    
      // Redirect or respond after successful update
      res.redirect("restaurant_product"); // Ensure this matches your front-end route
    } catch (error) {
      console.error("Error updating product:", error);
      res
        .status(500)
        .json({ message: "An error occurred while updating the product" });
    }
    
  },
  delete_product:async(req,res)=>{
    try {
      console.log("req.body:", req.body);
  
      const  productId  = req.body.id; // Extract the product ID from the request body
  
      // Fetch the restaurant document
      const restaurant = await Models.restaurantModel.findOne({ _id: req.session.restaurant._id });
      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }
  
      // Check if the product exists in the restaurant's products array
      const productIndex = restaurant.products.findIndex((product) => product._id.toString() === productId);
      if (productIndex === -1) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      // Remove the specific product
      const removedProduct = restaurant.products.splice(productIndex, 1); // Remove and save the removed product
      console.log("Removed Product:", removedProduct);
  
      // Optionally delete related images/files if required
      if (removedProduct[0]?.images) {
        for (const image of removedProduct[0].images) {
          await helper.deleteFile(image); // Use your helper to delete files
        }
      }
  
      // Save the updated restaurant document
      await restaurant.save();
  
       // Redirect to product list page or send success response
       res.redirect(`restaurant_product`);
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "An error occurred while deleting the product" });
    }
  },
  product_status:async(req,res)=>{
    try {
      const { productId, status } = req.body;

      // Find the restaurant and update the specific product's status
      const restaurant = await Models.restaurantModel.findOneAndUpdate(
        { "products._id": productId },
        { $set: { "products.$.status": parseInt(status) } },
        { new: true }
      );
  
      if (!restaurant) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ success: true, message: "Product status updated successfully", status: parseInt(status) });
      // Redirect or respond after successful update
      // res.redirect("restaurant_product"); // Ensure this matches your front-end route
    } catch (error) {
      throw error
    }
  },
  
  restaurant_product_view: async (req, res) => {
    try {
      let title = "provider_list";
      // const restaurantId = req.params.restaurantId; // Restaurant ID from the request
      const productId = req.params._id; // Product ID from the request

      // Fetch the restaurant data by restaurantId and populate the userId
      const restaurant = await Models.restaurantModel
        .findById({_id:req.session.restaurant._id})
        .lean();

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
            (cat) =>
              cat._id.toString() === matchedSubCategory.categoryId.toString()
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
      console.log("product", product);
      // Render the SubAdmin view
      res.render(
        "SubAdmin/restaurant/restaurantCatSubCatProduct/restaurant_product_view",
        {
          title,
          productId,
          restaurantName: restaurant.name,
          // restaurant: req.params.restaurantId,
          product,
          session: req.session.subAdmin,
          msg: req.flash("msg") || "",
        }
      );
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },

  //----------------order api-----------------------

  order_list: async (req, res) => {
    try {
      const title = "order_list";
      const orders = await Models.orderModel
        .find({restaurant: req.session.restaurant._id})
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

      res.render("SubAdmin/orders/order_list", {
        title,
        // restaurant: req.params._id,
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
      res.render("SubAdmin/orders/view_order", {
        title, // Pass the title to the view
        order, // Pass the order details to the view
        // restaurant:req.params.restaurant,
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
      const title = "active_orders";
      const orders = await Models.orderModel
        .find({ status: 4, restaurant: req.session.restaurant._id })
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

      res.render("SubAdmin/orders/active_order_list", {
        title,
        // restaurant: req.params._id,
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
      let title = "active_orders";
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
      res.render("SubAdmin/orders/active_order_view", {
        title, // Pass the title to the view
        order, // Pass the order details to the view
        // restaurant:req.params.restaurant,
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
      const title = "delivered_orders";
      const orders = await Models.orderModel
        .find({ status: 2, restaurant: req.session.restaurant._id })
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

      res.render("SubAdmin/orders/delivered_order_list", {
        title,
        // restaurant: req.params._id,
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
      let title = "delivered_orders";
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
      res.render("SubAdmin/orders/delivered_order_view", {
        title, // Pass the title to the view
        order, // Pass the order details to the view
        // restaurant:req.params.restaurant,
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
      const title = "cancelled_orders";
      const orders = await Models.orderModel
        .find({ status: 3, restaurant: req.session.restaurant._id })
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

      res.render("SubAdmin/orders/cancel_order_list", {
        title,
        // restaurant: req.params._id,
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
      let title = "cancelled_orders";
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
      res.render("SubAdmin/orders/cancel_order_view", {
        title, // Pass the title to the view
        order, // Pass the order details to the view
        // restaurant:req.params.restaurant,
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
        .find({ status: 1, restaurant: req.session.restaurant._id })
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
      console.log("formattedOrders", formattedOrders);
      res.render("SubAdmin/orders/pending_order_list", {
        title,
        // restaurant: req.params._id,
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
      res.render("SubAdmin/orders/pending_order_view", {
        title, // Pass the title to the view
        order, // Pass the order details to the view
        // restaurant:req.params.restaurant,
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
