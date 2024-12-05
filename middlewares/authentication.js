const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;
const Models = require("../Models/index.js");
const commonHelper = require("../helpers/commonHelper.js");
const resp = require("../config/responses");

module.exports = {
  authentication: async (req, res, next) => {
    let token = req.headers["authorization"];
    if (token) {
      token = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
      jwt.verify(token, secretKey, async (err, authData) => {
        if (err) {
          return commonHelper.failed(res,resp.failed_msg.invTok);
        }
        let userDetail = await Models.userModel.findOne({
         _id: authData._id 
        });
        req.user = userDetail;
        req.token = token;
        next();
      });
    } else {
      return commonHelper.error(res,resp.error_msg.tokenNotPrv);
    }
  },

  forgotPasswordVerify: async (req, res, next) => {
    try {
      const { token } = req.query;
      if (!token) {
        return commonHelper.failed(resp.failed_msg.tokReq);
      }
      const user = await Models.userModel.findOne({
        resetToken: token, // Match the resetToken field
        resetTokenExpires: { $gt: new Date() }, // Ensure resetTokenExpires is greater than the current date
      });
  
      if (!user) {
        return res.render("sessionExpire", resp.error_msg.pwdResTokExp, token);
      }
      req.user = user;
      next();
    } catch (error) {
      console.error("Forgot password token verification error:", error);
      return commonHelper.error(resp.error_msg.forPwdTokVer);
    }
  },
};
