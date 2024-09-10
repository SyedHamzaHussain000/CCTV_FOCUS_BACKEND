const express = require("express");
const Route = express.Router();

const multer = require("multer");

//middleware
const checkUserAuth = require("./middleware/Auth_MiddleWare");

//Controllers
const AuthController = require("./controller/AuthController");
const MainController = require("./controller/MainController");
const GoogleSheetController = require("./controller/GoogleSheet");

//Upload Image
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});






//middleware routes
Route.use("/Post_Alarm_Instruction", checkUserAuth)

//sheet to db
Route.get("/getSpreed",  GoogleSheetController.getSpreed);

//Authentication routes
Route.post("/Register", AuthController.Register);
Route.post("/Login", AuthController.Login);
Route.post("/sendUserPasswordEmail", AuthController.sendUserPasswordEmail);
Route.post("/VerifyOtp", AuthController.VerifyOtp);
Route.post("/resetForgetPassword", AuthController.resetForgetPassword);


//Main routes
Route.post(
  "/Post_Alarm_Instruction",
  upload.fields([
    { name: "ControlPanel_Image", maxCount: 1 },
    { name: "KeyPad_Image", maxCount: 1 },
    { name: "Matching_CCTV_Image", maxCount: 1 },
  ]),
  MainController.Post_Alarm_Instruction
);

Route.post("/getCamera",MainController.getCamera);

module.exports = Route;
