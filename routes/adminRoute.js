var express = require('express');
var router = express.Router();
const controllers = require('../controllers/index.js')
const { session } = require('../helpers/commonHelper.js')

// router.get('*', adminController.login_page)
router.get('/login',controllers.adminController.login_page)
router.post('/Login', controllers.adminController.Login)
router.get('/dashboard', session, controllers.adminController.dashboard)

router.get('/user_list', session, controllers.adminController.user_list)
router.get('/view_user/:id', session, controllers.adminController.view_user)
router.delete('/delete_user/:id', controllers.adminController.delete_user)
router.post('/user_status', controllers.adminController.user_status)



router.post('/Create', controllers.cmsController.Create)
router.get('/Aboutus', session,  controllers.cmsController.Aboutus)
router.post('/Update_aboutus',  controllers.cmsController.Update_aboutus)
router.get('/terms_condition', session,  controllers.cmsController.terms_condition)
router.post('/Update_terms',  controllers.cmsController.Update_terms)
router.get('/privacy_policy', session,  controllers.cmsController.privacy_policy)


module.exports = router;