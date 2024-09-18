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


const upload2 = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
})






//middleware routes
Route.use("/Post_Alarm_Instruction", checkUserAuth)
Route.use("/Post_CCTV_Instruction", checkUserAuth)
Route.use("/getGeneratedPdf", checkUserAuth)
Route.use("/generateGraph", checkUserAuth)
Route.use("/generateGraph", checkUserAuth)


//sheet to db
Route.get("/getSpreed",  GoogleSheetController.getSpreed);

//Authentication routes
Route.post("/Register", AuthController.Register);
Route.post("/Login", AuthController.Login);
Route.post("/sendUserPasswordEmail", AuthController.sendUserPasswordEmail);
Route.post("/VerifyOtp", AuthController.VerifyOtp);
Route.post("/ChangePassword", MainController.ChangePassword);



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
Route.post("/Post_CCTV_Instruction",   upload2.fields([
  { name: "Camera_Heigh_Of_Installation_Picture", maxCount:10 },
  { name: "Recorder_Heigh_Of_Installation_Picture", maxCount:10 },
]),
MainController.Post_CCTV_Instruction)

Route.post("/getCamera",MainController.getCamera);
Route.get("/getRecorder", MainController.getRecorder)
Route.get("/getGeneratedPdf", MainController.getGeneratedPdf)
Route.get("/GetCountOfCameraAndRecorder", MainController.GetCountOfCameraAndRecorder)
Route.post("/generateGraph", MainController.generateGraph)
Route.post("/ChangePassword", MainController.ChangePassword)

module.exports = Route;
