const path = require("path");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const emailTamplate = require("../helpers/emailTemplate/forgetPassword");
const stripe = require("stripe")(process.env.STRIPE_SK);
const fs = require("fs");
const admin = require("firebase-admin");

// Initialize Firebase Admin with Service Account
// const serviceAccount = require("./path/to/ecoupon-90aa5-firebase-adminsdk-dojhx-a9db2517ba.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

module.exports = {
  success: async (res, message, body = {}) => {
    try {
      return res.status(200).json({ message, body });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  failed: async (res, message, body = {}) => {
    try {
      return res.status(400).json({ message, body });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  error: async (res, message, body = {}) => {
    try {
      return res.status(500).json({ message, body });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  fileUpload: async (file, folder = "images") => {
    try {
      if (!file || file.name === "") return null;

      // Get file extension
      let fileExtension = file.name.split(".").pop();

      // Generate unique file name using uuid
      const name = uuid() + "." + fileExtension;

      // Create the correct path by referencing 'public/images' folder
      const filePath = path.join(__dirname, "..", "public", folder, name);

      // Move the file to the desired folder
      file.mv(filePath, (err) => {
        if (err) throw err;
      });

      // Return the file path relative to the public folder (this will be accessible via URL)
      return `/images/${name}`;
    } catch (error) {
      console.error("Error during file upload:", error);
      return null;
    }
  },
  deleteFile: async (fileName, folder = "images") => {
    try {
      if (!fileName || fileName.trim() === "") {
        throw new Error("File name is required");
      }

      // Create the path to the file
      const filePath = path.join(__dirname, "..", "public", fileName);
      console.log("filePath:", filePath);
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        throw new Error("File does not exist");
      }

      // Delete the file
      fs.unlinkSync(filePath);

      console.log(`File ${fileName} has been deleted successfully.`);
      return true; // Indicate success
    } catch (error) {
      console.error("Error during file deletion:", error);
      return false; // Indicate failure
    }
  },

  bcryptData: async (newPassword, salt) => {
    try {
      // Ensure `salt` is a number if passed as a string
      const saltRounds = typeof salt === "string" ? parseInt(salt, 10) : salt;

      // Hash the password using the salt rounds
      return await bcrypt.hash(newPassword, saltRounds);
    } catch (error) {
      console.log("bcrypt User error", error);
      throw error;
    }
  },

  getHost: async (req, res) => {
    const host =
      req.headers.host || `${req.hostname}:${req.connection.localPort}`;
    return host;
  },
  unixTimestamp: function () {
    var time = Date.now();
    var n = time / 1000;
    return (time = Math.floor(n));
  },

  sidIdGenerateTwilio: async (req, res) => {
    try {
      const serviceSid = await otpManager.createServiceSID("appCleaning", "4");
      console.log("Service SID created:", serviceSid);
      return serviceSid;
    } catch (error) {
      console.error("Error generating Service SID:", error);
      throw new Error("Failed to generate Service SID");
    }
  },

  randomStringGenerate: async (req, res) => {
    try {
      return crypto.randomBytes(32).toString("hex");
    } catch (error) {
      console.log("randomString generate error", error);
      throw error;
    }
  },

  nodeMailer: async (req, res) => {
    try {
      let transporter = nodemailer.createTransport({
        service: process.env.SERVICE,
        auth: {
          type: process.env.MAIL_TYPE,
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,
          clientId: process.env.OAUTH_CLIENTID,
          clientSecret: process.env.OAUTH_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN,
        },
      });
      return transporter;
    } catch (error) {
      console.log("nodeMailer error", error);
      throw error;
    }
  },

  forgetPasswordLinkHTML: async (user, resetUrl) => {
    try {
      let mailOptions = {
        from: process.env.MAIL_USERNAME,
        to: user.email,
        subject: "Password Reset Request",
        html: emailTamplate.forgotPassword(resetUrl),
      };
      return mailOptions;
    } catch (error) {
      console.log("forgetPassword error", error);
      throw error;
    }
  },

  session: async (req, res, next) => {
    if (req.session.user) {
      next();
    } else {
      return res.redirect("/admin/login");
    }
  },
  sessionSubAdmin: async (req, res, next) => {
    if (req.session.subAdmin) {
      next();
    } else {
      return res.redirect("/subadmin/login");
    }
  },

  createCard: async (customerId, cardToken) => {
    try {
      const response = await stripe.customers.createSource(customerId, {
        source: cardToken,
      });

      // Retrieve customer details to check existing default source
      const customer = await stripe.customers.retrieve(customerId);

      if (!customer.default_source) {
        await stripe.customers.update(customerId, {
          default_source: addedCard.id,
        });
      }
      return response;
    } catch (err) {
      // Prepare an error object with relevant information
      let errorMessage = "An unknown error occurred.";

      // Check the type of the error and customize the message
      switch (err.type) {
        case "StripeCardError":
          errorMessage = `A payment error occurred: ${err.message}`;
          break;
        case "StripeInvalidRequestError":
          errorMessage = "An invalid request occurred.";
          break;
        default:
          errorMessage = "Another problem occurred, maybe unrelated to Stripe.";
          break;
      }

      // Return the error message so the caller can handle it
      return { error: true, message: errorMessage };
    }
  },

  // sendFirebasePush : async (deviceToken, bodyData, type) => {
  //   try {
  //     console.log("Body Data:", bodyData);
  //     console.log("Device Token:", deviceToken);
  
  //     // Add additional payload details
  //     bodyData.priority = "high";
  //     bodyData.sound = "default";
  //     bodyData.title = bodyData.message;
  
  //     // Construct the FCM message
  //     const message = {
  //       token: deviceToken,
  //       data: {
  //         ...bodyData,
  //         type: type, // Optional: Additional metadata
  //       },
  //       android: {
  //         priority: "high",
  //         notification: {
  //           title: bodyData.title,
  //           body: bodyData.message,
  //           sound: "default",
  //         },
  //       },
  //       apns: {
  //         payload: {
  //           aps: {
  //             alert: {
  //               title: bodyData.title,
  //               body: bodyData.message,
  //             },
  //             sound: "default",
  //           },
  //         },
  //       },
  //       webpush: {
  //         notification: {
  //           title: bodyData.title,
  //           body: bodyData.message,
  //           icon: "https://yourwebsite.com/path-to-icon.png", // Add an icon URL
  //         },
  //         fcm_options: {
  //           link: "https://yourwebsite.com", // Optional: Link to open on click
  //         },
  //       },
  //     };
  
  //     // Send the notification
  //     const response = await admin.messaging().send(message);
  //     console.log("Notification sent successfully:", response);
  //   } catch (error) {
  //     console.error("Error sending notification:", error);
  //   }
  // },
};


