const Models = require("../../Models/index");
module.exports = {
  Create: async (req, res) => {
    try {
      let create = await Models.riderCMSModel.create({
        title: req.body.title,
        description: req.body.description,
        role: req.body.role,
      });

      res.json({ create });
    } catch (error) {
      console.log(error);
    }
  },
  Update_aboutus: async (req, res) => {
    try {
      const aboutus = await Models.cmsModel.updateOne(
        { _id: req.body.id },
        {
          role: req.body.role,
          description: req.body.description,
        }
      );
      req.flash("msg", "Updated successfully");
      res.redirect("back");
    } catch (error) {
      console.log(error);
    }
  },
  Update_terms: async (req, res) => {
    try {
      const terms = await Models.cmsModel.updateOne(
        { _id: req.body.id },
        {
          role: req.body.role,
          description: req.body.description,
        }
      );
      req.flash("msg", "Updated successfully");
      res.redirect("back");
    } catch (error) {
      console.log(error);
    }
  },
  //User cms
  terms_condition_user: async (req, res) => {
    try {
      let title = "terms_condition_user";
      let data = await Models.cmsModel.findOne({ role: 2 });
      res.render("Admin/CMS/userCMS/terms_condition", {
        title,
        data,
        session: req.session.user,
        msg: req.flash("msg")||'',
      });
    } catch (error) {
      console.log(error);
    }
  },
  Aboutus_user: async (req, res) => {
    try {
      let title = "Aboutus_user";
      let data = await Models.cmsModel.findOne({ role: 1 });
      res.render("Admin/CMS/userCMS/Aboutus", {
        title,
        data,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  privacy_policy_user: async (req, res) => {
    try {
      let title = "privacy_policy_user";
      let data = await Models.cmsModel.findOne({ role: 3 });
      res.render("Admin/CMS/userCMS/privacy_policy", {
        title,
        data,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },


   // Restaurant CMS
  terms_condition_restaurant: async (req, res) => {
    try {
      let title = "terms_condition_restaurant";
      let data = await Models.restaurantCMSModel.findOne({ role: 2 });
      res.render("Admin/CMS/restaurantCMS/terms_condition", {
        title,
        data,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  Aboutus_restaurant: async (req, res) => {
    try {
      let title = "Aboutus_restaurant";
      let data = await Models.restaurantCMSModel.findOne({ role: 1 });
      res.render("Admin/CMS/restaurantCMS/Aboutus", {
        title,
        data,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  privacy_policy_restaurant: async (req, res) => {
    try {
      let title = "privacy_policy_restaurant";
      let data = await Models.restaurantCMSModel.findOne({ role: 3 });
      res.render("Admin/CMS/restaurantCMS/privacy_policy", {
        title,
        data,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

  //rider cms
  terms_condition_rider: async (req, res) => {
    try {
      let title = "terms_condition_rider";
      let data = await Models.riderCMSModel.findOne({ role: 2 });
      res.render("Admin/CMS/riderCMS/terms_condition", {
        title,
        data,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  Aboutus_rider: async (req, res) => {
    try {
      let title = "Aboutus_rider";
      let data = await Models.riderCMSModel.findOne({ role: 1 });
      res.render("Admin/CMS/riderCMS/Aboutus", {
        title,
        data,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },
  privacy_policy_rider: async (req, res) => {
    try {
      let title = "privacy_policy_rider";
      let data = await Models.riderCMSModel.findOne({ role: 3 });
      res.render("Admin/CMS/riderCMS/privacy_policy", {
        title,
        data,
        session: req.session.user,
        msg: req.flash("msg"),
      });
    } catch (error) {
      console.log(error);
    }
  },

};
