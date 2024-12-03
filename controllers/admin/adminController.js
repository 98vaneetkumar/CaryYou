const Models = require("../../Models/index");
const bcrypt = require("bcrypt");

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
        res.redirect("/admin/dashboard");
      }
    } catch (error) {
      console.log(error);
    }
  },

  dashboard: async (req, res) => {
    try {
      let title = "dashboard";
      let user = await Models.userModel.countDocuments({ role: 1 });
      let provider = await Models.userModel.countDocuments({ role: 2 });
      console.log("=====", user);
      // return
      res.render("Admin/dashboard", {
        title,
        user,
        provider,
        servicesdata: 0,
        contactus: 0,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
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
    }
  },

  delete_user: async (req, res) => {
    try {
      let userid = req.body.id;
      let remove = await Models.userModel.deleteOne({ _id: userid });
      res.redirect("/admin/user_list");
    } catch (error) {
      console.log(error);
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
    }
  },
};
