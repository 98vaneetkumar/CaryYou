const Models = require("../../Models/index");
const bcrypt = require("bcrypt");
const helper=require("../../helpers/commonHelper.js")

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
        setTimeout(()=>{
          res.redirect("/admin/dashboard");
        }, 500)
      }
    } catch (error) {
      console.log(error);
    }
  },
  logout: async (req, res) => {
    try {
      req.session.destroy((err) => { });
      res.redirect("/admin/login");
    } catch (error) {
      helper.error(res, error);
    }
  },

  dashboard: async (req, res) => {
    try {
      let title = "dashboard";
      let user = await Models.userModel.countDocuments({ role: 1 });
      let provider = await Models.userModel.countDocuments({ role: 2 });
      let rider = await Models.userModel.countDocuments({ role: 3 });

  
      console.log("Flash msg:", req.flash("msg"));
  
      res.render("Admin/dashboard", {
        title,
        user,
        provider: 100,
        servicesdata: 0,
        contactus: 0,
        rider,
        orders: 55,
        vehicleType: 10,
        payments: 2,
        feedbacks: 4,
        activeorders: 10,
        deliveredorders: 5,
        cancelledorders: 50,
        session: req.session.user,
        msg: req.flash("msg") || '',
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

      res.render("Admin/user/user_list", {
        title,
        userdata,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error
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
      throw error
    }
  },

  delete_user: async (req, res) => {
    try {
      let userid = req.body.id;
      let remove = await Models.userModel.deleteOne({ _id: userid });
      res.redirect("/admin/user_list");
    } catch (error) {
      console.log(error);
      throw error
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
      throw error
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
    throw error
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
    throw error
  }
},

delete_rider: async (req, res) => {
  try {
    let riderid = req.body.id;
    let remove = await Models.userModel.deleteOne({ _id: riderid });
    res.redirect("/admin/rider_list");
  } catch (error) {
    console.log(error);
    throw error
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
    throw error
  }
},


//---------------------------------------

//---------vehicle type apis-------------


  // List Vehicle Types
  vehicleType_list: async (req, res) => {
    try {
      let title = "Vehicle Type List";
      let vehicleTypes = await Models.vehicleTypeModel
        .find({})
        .sort({ createdAt: -1 });
      res.render("Admin/vehicleType/vehicleType_list", {
        title,
        vehicleTypes,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  // View Vehicle Type Details
  view_vehicleType: async (req, res) => {
    try {
      let title = "View Vehicle Type";
      let vehicleType = await Models.vehicleTypeModel.findById({
        _id: req.params.id,
      });
      res.render("Admin/vehicleType/view_vehicleType", {
        title,
        vehicleType,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  // Delete Vehicle Type
  delete_vehicleType: async (req, res) => {
    try {
      let vehicleTypeId = req.body.id;
      await Models.vehicleTypeModel.deleteOne({ _id: vehicleTypeId });
      req.flash("msg", "Vehicle Type deleted successfully");
      res.redirect("/admin/vehicleType_list");
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  // Update Vehicle Type Status
  vehicleType_status: async (req, res) => {
    try {
      let updated = await Models.vehicleTypeModel.updateOne(
        { _id: req.body.id },
        { status: req.body.value }
      );
      req.flash("msg", "Status updated successfully");

      // Return appropriate response
      if (req.body.value == 0) res.send(false);
      if (req.body.value == 1) res.send(true);
    } catch (error) {
      console.log(error);
      throw error;
    }
  },



//---------------------------------------



  admin_profile: async (req, res) => {
    try {
      let title = "admin_profile"
      res.render('Admin/admin/admin_profile', { title, session: req.session.user, msg: req.flash('msg') })
    } catch (error) {
      console.log(error)
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
      let title = "change_password"
      res.render('Admin/admin/change_password', { title, session: req.session.user, msg: req.flash('msg') })
    } catch (error) {
      console.log(error)
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
          req.flash('msg', 'Update password successfully')
          res.redirect("/admin/login");
        } else {
          req.flash('msg', 'Old password do not match')
          res.redirect("/admin/change_password");
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  admin_commission: async (req, res) => {
    try {
      let title = "commission"
      let users = await Models.userModel.findOne({ _id: req.session.user._id });
      res.render('Admin/commission/commission', { title, users, session: req.session.user, msg: req.flash('msg') })
    }
    catch (error) {
      console.log(error);
      throw error
    }
  },

  update_commission: async (req, res) => {
    try {

      await Models.userModel.updateOne({ _id: req.session.user._id },
        {
          admincommission: req.body.admincommission
        });
      let users = await Models.userModel.findOne({ _id: req.session.user._id });
      req.flash("msg", "Updated successfully")
      res.redirect('/admin/admin_commission')

    } catch (error) {
      console.log(error)
      throw error
    }
  },
};
