var express = require("express");
var router = express.Router();
const commonHelper = require("../helpers/commonHelper.js");

router.get("/", (req, res) => {
  res.render("index", { title: "Express" });
});

router.get("/user", async (req, res) => {
  let jsonData = require("../config/userSwagger.json");
  delete jsonData.host;
  jsonData.host = await commonHelper.getHost(req, res); // Dynamically set the host
  // console.log("jsonData.host:  ", jsonData.host);
  return res.status(200).send(jsonData);
});

router.get("/restaurant", async (req, res) => {
  let jsonData = require("../config/restaurantSwagger.json");
  delete jsonData.host;
  jsonData.host = await commonHelper.getHost(req, res); // Dynamically set the host
  // console.log("jsonData.host:  ", jsonData.host);
  return res.status(200).send(jsonData);
});

router.get("/rider", async (req, res) => {
  let jsonData = require("../config/riderSwagger.json");
  delete jsonData.host;
  jsonData.host = await commonHelper.getHost(req, res); // Dynamically set the host
  // console.log("jsonData.host:  ", jsonData.host);
  return res.status(200).send(jsonData);
});

module.exports = router;
