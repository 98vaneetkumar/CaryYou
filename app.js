require("dotenv").config();
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const fileUpload = require("express-fileupload");
const http = require("http");
const session = require('express-session')
const socketio = require("socket.io");
const createError = require("http-errors");
const flash = require('express-flash');
var expressLayouts = require('express-ejs-layouts');
const indexRouter = require("./routes/index");


const port = process.env.PORT || '3000';

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

// Routes
const usersRouter = require("./routes/usersRoute")(io); // Pass io to usersRouter if needed
const riderRoute = require('./routes/ridersRoute')(io)
const adminRouter = require('./routes/adminRoute')
const subAdminRouter = require('./routes/subAdminRoute')

// MongoDB Connection
mongoose 
  .connect(process.env.URL)
  .then(() => console.log("Connected to MongoDB!"))
  .catch((err) => console.error("MongoDB connection error:", err));


app.use(expressLayouts)
// app.set('layout', './Admin/layouts/layout')
// app.set('layout', './SubAdmin/layouts/layout')

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
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 24 * 60 * 60 * 365 * 1000,
	},
}));
app.use(flash())


// Swagger UI Setup
const swaggerUi = require("swagger-ui-express");
const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    urls: [
      { url: "/user", name: "User API" },
      { url: "/restaurant", name: "Restaurant API" },
      { url: "/rider", name: "Rider API" },
    ],
  },
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(null, swaggerOptions));


// Socket.IO Integration
require("./socket/socket")(io);
app.use("/", indexRouter);

app.use("/admin", (req, res, next) => {
  res.locals.layout = "./Admin/layouts/layout";
  next();
}, adminRouter);

app.use("/subadmin", (req, res, next) => {
  res.locals.layout = "./SubAdmin/layouts/layout";
  next();
}, subAdminRouter);
app.use("/users", usersRouter);
app.use('/rider', riderRoute)

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
 server.listen(port, ()=>{
  console.log(`server is running on port ${port}`)
 })



// https://chromewebstore.google.com/detail/firecamp-a-multi-protocol/eajaahbjpnhghjcdaclbkeamlkepinbl