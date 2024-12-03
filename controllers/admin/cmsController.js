const Models = require('../../Models/index')
module.exports = {

    Create: async (req, res) => {
      try {
        let create = await Models.cmsModel.create({
          title: req.body.title,
          description: req.body.description,
          role: req.body.role
        })
  
        res.json({ create })
      } catch (error) {
        console.log(error)
      }
    },
  
    Aboutus: async (req, res) => {
      try {
        let title = "Aboutus"
        let data = await Models.cmsModel.findOne({ role: 1 })
        res.render('Admin/CMS/Aboutus', { title, data, session: req.session.user, msg: req.flash('msg') })
      } catch (error) {
        console.log(error)
      }
    },
  
    Update_aboutus: async (req, res) => {
      try {
  
        const aboutus = await Models.cmsModel.updateOne({ _id: req.body.id },
          {
            role: req.body.role,
            description: req.body.description,
          }
        );
        req.flash("msg", "Updated successfully")
        res.redirect("back");
  
      } catch (error) {
        console.log(error);
      }
    },
  
    terms_condition: async (req, res) => {
      try {
        let title = "terms_condition"
        let data = await Models.cmsModel.findOne({ role: 2 });
        res.render('Admin/CMS/terms_condition', { title, data, session: req.session.user, msg: req.flash('msg') })
      } catch (error) {
        console.log(error)
      }
    },
  
    Update_terms: async (req, res) => {
      try {
        const terms = await Models.cmsModel.updateOne({ _id: req.body.id },
          {
            role: req.body.role,
            description:req.body.description,
          }
        );
        req.flash("msg", "Updated successfully")
        res.redirect("back");
  
      } catch (error) {
        console.log(error);
      }
    },
  
    privacy_policy: async (req, res) => {
      try {
        let title = "privacy_policy"
        let data = await Models.cmsModel.findOne({ role: 3 })
        res.render('Admin/CMS/privacy_policy', { title, data, session: req.session.user, msg: req.flash('msg') })
      } catch (error) {
        console.log(error)
      }
    },
  
  
  
  
  
  }