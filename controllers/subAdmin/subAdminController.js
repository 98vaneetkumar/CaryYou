const Models = require("../../Models/index");
const bcrypt = require("bcrypt");
const helper=require("../../helpers/commonHelper.js")

module.exports = {
  login_page: async (req, res) => {
    res.render("SubAdmin/login_page", { layout: false, msg: req.flash("msg") });
  },

  Login: async (req, res) => {
    try {
      let findUser = await Models.userModel.findOne({
        role: 1,
        email: req.body.email,
      });
      if (!findUser) {
        console.log("Please enter valid email");
        req.flash("msg", "Incorrect email");
        res.redirect("/subadmin/login");
      }

      let checkPassword = await bcrypt.compare(
        req.body.password,
        findUser.password
      );
      if (!checkPassword) {
        req.flash("msg", "Incorrect password");
        res.redirect("/subadmin/login");
      } else {
        req.session.user = findUser;
        req.flash("msg", "Login Successfully");
        setTimeout(()=>{
          res.redirect("/subadmin/dashboard");
        }, 500)
      }
    } catch (error) {
      console.log(error);
    }
  },
  logout: async (req, res) => {
    try {
      req.session.destroy((err) => { });
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
        pendingorders:0,
        activeorders:0,
        deliveredorders:0,
        cancelledorders:0,
        vendors:0,
        categories:0,
        subcategories:0,
        products:0,
        returnrequests:0,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
      throw error
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
      throw error
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
      throw error
    }
  },

  delete_user: async (req, res) => {
    try {
      let userid = req.body.id;
      let remove = await Models.userModel.deleteOne({ _id: userid });
      res.redirect("/subadmin/user_list");
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


  subAdmin_profile: async (req, res) => {
    try {
      let title = "subAdmin_profile"
      res.render('SubAdmin/SubAdmin/SubAdmin_profile', { title, session: req.session.user, msg: req.flash('msg') })
    } catch (error) {
      console.log(error)
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
      let title = "change_password"
      res.render('SubAdmin/SubAdmin/change_password', { title, session: req.session.user, msg: req.flash('msg') })
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
          res.redirect("/subadmin/login");
        } else {
          req.flash('msg', 'Old password do not match')
          res.redirect("/subadmin/change_password");
        }
      }
    } catch (error) {
      console.log(error)
      throw error
    }
  },
  subAdmin_commission: async (req, res) => {
    try {
      let title = "commission"
      let users = await Models.userModel.findOne({ _id: req.session.user._id });
      res.render('SubAdmin/commission/commission', { title, users, session: req.session.user, msg: req.flash('msg') })
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
          subAdmincommission: req.body.subAdmincommission
        });
      let users = await Models.userModel.findOne({ _id: req.session.user._id });
      req.flash("msg", "Updated successfully")
      res.redirect('/subadmin/SubAdmin_commission')

    } catch (error) {
      console.log(error)
      throw error
    }
  },
};