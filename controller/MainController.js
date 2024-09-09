const cloudinary = require('cloudinary');
const path = require('path');
const AlarmModal = require('../models/AlarmModel')
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


  
}

module.exports = MainController;
