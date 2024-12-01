require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const http = require("http");
const socketio = require("socket.io");
const createError = require("http-errors");

// Initialize the Express app
const app = express();

// Create HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*", // Adjust as needed for your client
    methods: ["GET", "POST"],
  },
});

// MongoDB Connection
mongoose 
  .connect(process.env.URL)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO Integration
require("./socket/socket")(io);

// View Engine Setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middleware
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Enable file upload
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Swagger UI Setup
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      { url: "/user", name: "User API" },
      { url: "/business", name: "Business API" },
    ],
  },
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));

// Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users")(io); // Pass io to usersRouter if needed
app.use("/", indexRouter);
app.use("/users", usersRouter);

// Catch 404 and Forward to Error Handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error Handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});
 
// Export both app and server
module.exports = { app, server };


// https://chromewebstore.google.com/detail/firecamp-a-multi-protocol/eajaahbjpnhghjcdaclbkeamlkepinbl