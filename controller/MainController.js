const cloudinary = require('cloudinary');
const path = require('path');
const AlarmModal = require('../models/AlarmModel');
const Camera_Modal = require('../models/CameraAndRecorder_Data/CameraModel');
 // Configure Cloudinary
 cloudinary.v2.config({
   cloud_name: process.env.CLOUDINARY_NAME,
   api_key: process.env.CLOUDINARY_KEY,
   api_secret: process.env.CLOUDINARY_SECRET,
 });


 //Uploading to Cloudinary 
 const uploadImageToCloudinary = (imageBuffer, publicId) => {
   return new Promise((resolve, reject) => {
     const stream = cloudinary.v2.uploader.upload_stream(
       { public_id: publicId }, 
       (error, result) => {
         if (error) {
           console.error("Cloudinary upload error:", error);
           return reject(new Error("Image upload failed"));
         }
         resolve(result.secure_url); // Return the image URL
       }
     );
     stream.end(imageBuffer);
   });
 };


class MainController {
   
  static Post_Alarm_Instruction = async (req, res) => {
    const {
      full_name,
      email,
      phone_number,
      address,
      What_Sector,
      What_Sector_Step_Two,
      PropertySize,
      No_Of_Floor,
      Entry_Point,
      ControlPanel_Location,
      ControlPanel_Description,
      KeyPad_Location,
      Siren_Location,
      Distance_from_Control_Panel,
      Matching_CCTV_Description,
      Sensors,
      Door_Contacts,
      Shock_Sensor,
    } = req.body;



    try {
      const imageUrls = {};
      const { ControlPanel_Image, KeyPad_Image, Matching_CCTV_Image } = req.files;

      if (ControlPanel_Image) {
         const fileNameWithoutExtension = path.basename(ControlPanel_Image[0].originalname, path.extname(ControlPanel_Image[0].originalname));
         imageUrls.ControlPanel_Image = await uploadImageToCloudinary(ControlPanel_Image[0].buffer, `CCTV_CAMERA/Alarm/${fileNameWithoutExtension}`);
       }
 
       if (KeyPad_Image) {
         const fileNameWithoutExtension = path.basename(KeyPad_Image[0].originalname, path.extname(KeyPad_Image[0].originalname));
         imageUrls.KeyPad_Image = await uploadImageToCloudinary(KeyPad_Image[0].buffer, `CCTV_CAMERA/Alarm/${fileNameWithoutExtension}`);
       }
 
       if (Matching_CCTV_Image) {
         const fileNameWithoutExtension = path.basename(Matching_CCTV_Image[0].originalname, path.extname(Matching_CCTV_Image[0].originalname));
         imageUrls.Matching_CCTV_Image = await uploadImageToCloudinary(Matching_CCTV_Image[0].buffer, `CCTV_CAMERA/Alarm/${fileNameWithoutExtension}`);
       }
      

       const saveAlarmInstruction =  await AlarmModal({
         full_name : full_name,
         email : email,
         phone_number: phone_number,
         address : address,
         What_Sector :  What_Sector,
         What_Sector_Step_Two : What_Sector_Step_Two,
         PropertySize: PropertySize,
         No_Of_Floor: No_Of_Floor,
         Entry_Point : Entry_Point,
         ControlPanel_Image: imageUrls.ControlPanel_Image,
         ControlPanel_Location: ControlPanel_Location,
         ControlPanel_Description: ControlPanel_Description,
         KeyPad_Image: imageUrls.KeyPad_Image,
         KeyPad_Location: KeyPad_Location,
         Siren_Location: Siren_Location,
         Distance_from_Control_Panel: Distance_from_Control_Panel,
         Matching_CCTV_Image: imageUrls.Matching_CCTV_Image,
         Matching_CCTV_Description: Matching_CCTV_Description,
         Sensors: Sensors,
         Door_Contacts: Door_Contacts,
         Shock_Sensor: Shock_Sensor,
       })

       saveAlarmInstruction.save().then(()=>{
         res.send({
            Status: true,
            Success: "Response",
            data: saveAlarmInstruction,
          });
          }).catch((e)=>{
            res.send({
               Status: false,
               Success: "Response",
               data: saveAlarmInstruction,
             });
          })
     // Send the response with the uploaded image URLs
     
    } catch (error) {
      console.error("Error during image upload:", error.message);
      res.status(500).send({
        Status: false,
        Error: "Image upload failed",
        Message: error.message,
      });
    }

  };


  static Post_CCTV_Instruction = async (req, res) => {
    const {
      full_name,
      email,
      phone_number,
      address,
      What_Sector,
      What_Sector_Step_Two,
      What_Sector_Commercial_Sector,
      What_Sector_other,
      What_Sector_Postal_Code,
      Bedrooms,
      Area_Of_Concern,
      Security_System,
      CCTV_Equipment,
      Security_Incident,
      //Add image of camera installation
      Height_Of_Camera_Installation,
      Camera_Installation_Brief,
      //Add image of Recorder installation
      Height_Of_Recorder_Installation,
      Recorder_Installation_Brief,
      Cable_type,
      Storage_Duration,
      Fire_Alarm,
      Security_Light,
      Smart_lock,
      Specific_Customization,
      Follow_Method_email,
      Follow_Method_phone,
      Follow_Method_sms,

    } = req.body;
    
  }


  static getCamera = async(req, res) => {
    const {Camera_type, Resolution, Additonal_Feature, audio_type, where_to_install} = req.body

    const Dome_Camera = "Bullet Cameras"

    const newCamera = Dome_Camera.split("Cameras")

    console.log("camera is", newCamera[0])

    const Camera = await Camera_Modal.find({
      RESOLUTION : Resolution,
      DESCRIPTION: { $regex: newCamera[0], $options: "i" } // Case-insensitive search for the keyword "camera"

    })

    res.send({
      "success": true,
      
      "data": Camera
    })
  }


  static getRecorder =(req, res) => {
    const {Camera_type, Resolution, Additonal_Feature, audio_type, where_to_install} = req.body

  }




  
}

module.exports = MainController;
