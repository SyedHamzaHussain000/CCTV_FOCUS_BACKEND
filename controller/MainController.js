const cloudinary = require("cloudinary");
const path = require("path");
const puppeteer = require("puppeteer");
const streamifier = require('streamifier');

const AlarmModal = require("../models/AlarmModel");
const CCTVModal = require("../models/CCTVModel");
const Camera_Modal = require("../models/CameraAndRecorder_Data/CameraModel");
const Recorder_Modal = require("../models/CameraAndRecorder_Data/RecorderModel");
const AlaramReport_Model = require("../models/Reports_Modal/AlaramReportModel");

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

  //Apis Functions
  static Post_Alarm_Instruction = async (req, res) => {

    const userData = req.user


    

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
      const { ControlPanel_Image, KeyPad_Image, Matching_CCTV_Image } =
        req.files;


      if (ControlPanel_Image) {
        const fileNameWithoutExtension = path.basename(
          ControlPanel_Image[0].originalname,
          path.extname(ControlPanel_Image[0].originalname)
        );
        imageUrls.ControlPanel_Image = await uploadImageToCloudinary(
          ControlPanel_Image[0].buffer,
          `CCTV_CAMERA/Alarm/${fileNameWithoutExtension}`
        );
      }

      if (KeyPad_Image) {
        const fileNameWithoutExtension = path.basename(
          KeyPad_Image[0].originalname,
          path.extname(KeyPad_Image[0].originalname)
        );
        imageUrls.KeyPad_Image = await uploadImageToCloudinary(
          KeyPad_Image[0].buffer,
          `CCTV_CAMERA/Alarm/${fileNameWithoutExtension}`
        );
      }

      if (Matching_CCTV_Image) {
        const fileNameWithoutExtension = path.basename(
          Matching_CCTV_Image[0].originalname,
          path.extname(Matching_CCTV_Image[0].originalname)
        );
        imageUrls.Matching_CCTV_Image = await uploadImageToCloudinary(
          Matching_CCTV_Image[0].buffer,
          `CCTV_CAMERA/Alarm/${fileNameWithoutExtension}`
        );
      }

      const saveAlarmInstruction = await AlarmModal({
        report_generator_id: userData._id,
        full_name: full_name,
        email: email,
        phone_number: phone_number,
        address: address,
        What_Sector: What_Sector,
        What_Sector_Step_Two: What_Sector_Step_Two,
        PropertySize: PropertySize,
        No_Of_Floor: No_Of_Floor,
        Entry_Point: Entry_Point,
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
      });

      await saveAlarmInstruction
        .save()
       

      // Generate the HTML template for the PDF
      const htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: blue; }
      </style>
    </head>
    <body>
      <h1>Alarm Instruction</h1>
      <p>Full Name: ${full_name}</p>
      <p>Email: ${email}</p>
      <p>Phone Number: ${phone_number}</p>
      <p>Address: ${address}</p>
      <p>What Sector: ${What_Sector}</p>
      <p>Property Size: ${PropertySize}</p>
      <p>No Of Floor: ${No_Of_Floor}</p>
      <p>Entry Point: ${Entry_Point}</p>
      <p>Control Panel Location: ${ControlPanel_Location}</p>
      <p>Control Panel Description: ${ControlPanel_Description}</p>
      <p>KeyPad Location: ${KeyPad_Location}</p>
      <p>Siren Location: ${Siren_Location}</p>
      <p>Matching CCTV Description: ${Matching_CCTV_Description}</p>
      <p>Sensors: ${Sensors}</p>
      <p>Door Contacts: ${Door_Contacts}</p>
      <p>Shock Sensor: ${Shock_Sensor}</p>
    </body>
    </html>
  `;

      const filename = `Alarm_pdf${Date.now()}`
    // Generate the PDF from the HTML
    const pdfBuffer = await this.generatePDFFromHTML(htmlContent);
    console.log("pdfBuffer", pdfBuffer)
    // Upload the generated PDF to Cloudinary
    const pdfUploadResponse = await this.uploadPDFToCloudinary(pdfBuffer, filename);


    const pdfSave = await AlaramReport_Model({
      report_generator_id: userData._id,
      pdf_url: pdfUploadResponse.secure_url,
      pdf_type: "Alarm",
      full_name: full_name,
    })

    await pdfSave.save()
    // Respond with the success message and PDF URL
    res.send({
      success: true,
      message: 'Successfully Alarm Created',
      data: saveAlarmInstruction,
      pdfUrl: pdfUploadResponse.secure_url,
      pdf_type: "Alarm"
    });


      // Send the response with the uploaded image URLs
    } catch (error) {
      console.error("Error during image upload:", error.message);
      res.status(500).send({
        success: false,
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
      What_Comercial_Sector,
      What_Comercial_Other_Info,
      What_Comercial_Postal_Code,
      BedRooms,
      Purpose_Of_Installment,
      Area_of_Concern,
      Security_System,
      CCTV_Equipment,
      Security_Incident,
      Camera,
      Recorder,
      Cable_type,
      Cable_Length,
      Storage_Duration,
      FireAlarm,
      Smart_Lock,
      Security_Lighting,
      Special_Requirement,
      Follow_Method_email,
      Follow_Method_phone,
      Follow_Method_sms,
    } = req.body;

      console.log("first",full_name,
        email,
        phone_number,
        address,
        What_Sector,
        What_Sector_Step_Two,
        What_Comercial_Sector,
        What_Comercial_Other_Info,
        What_Comercial_Postal_Code,
        BedRooms,
        Purpose_Of_Installment,
        Area_of_Concern,
        Security_System,
        CCTV_Equipment,
        Security_Incident,
        Camera,
        Recorder,
        Cable_type,
        Cable_Length,
        Storage_Duration,
        FireAlarm,
        Smart_Lock,
        Security_Lighting,
        Special_Requirement,
        Follow_Method_email,
        Follow_Method_phone,
        Follow_Method_sms,)
      
        // return

    try {
      // let imageUrls = {};
      // const {
      //   Camera_Heigh_Of_Installation_Picture,
      //   Recorder_Heigh_Of_Installation_Picture,
      // } = req.files;

      // if (Camera_Heigh_Of_Installation_Picture) {
      //   const fileNameWithoutExtension = path.basename(
      //     Camera_Heigh_Of_Installation_Picture[0].originalname,
      //     path.extname(Camera_Heigh_Of_Installation_Picture[0].originalname)
      //   );
      //   imageUrls.Camera_Heigh_Of_Installation_Picture =
      //     await uploadImageToCloudinary(
      //       Camera_Heigh_Of_Installation_Picture[0].buffer,
      //       `CCTV_CAMERA/Alarm/${fileNameWithoutExtension}`
      //     );
      // }

      // if (Recorder_Heigh_Of_Installation_Picture) {
      //   const fileNameWithoutExtension = path.basename(
      //     Recorder_Heigh_Of_Installation_Picture[0].originalname,
      //     path.extname(Recorder_Heigh_Of_Installation_Picture[0].originalname)
      //   );
      //   imageUrls.Recorder_Heigh_Of_Installation_Picture =
      //     await uploadImageToCloudinary(
      //       Recorder_Heigh_Of_Installation_Picture[0].buffer,
      //       `CCTV_CAMERA/Alarm/${fileNameWithoutExtension}`
      //     );
      // }

      const saveCCTV_Instruction = await CCTVModal({
        full_name: full_name,
        email: email,
        phone_number: phone_number,
        address: address,
        What_Sector: What_Sector,
        What_Sector_Step_Two: What_Sector_Step_Two,
        What_Comercial_Sector: What_Comercial_Sector,
        What_Comercial_Other_Info: What_Comercial_Other_Info,
        What_Comercial_Postal_Code: What_Comercial_Postal_Code,
        BedRooms: BedRooms,
        Purpose_Of_Installment: Purpose_Of_Installment,
        Area_of_Concern: Area_of_Concern,
        Security_System: Security_System,
        CCTV_Equipment: CCTV_Equipment,
        Security_Incident: Security_Incident,
        Camera: JSON.parse(Camera),
        //Add image of camera installation
        // Camera_Heigh_Of_Installation_Picture:
        //   imageUrls.Camera_Heigh_Of_Installation_Picture,
        // Camera_Heigh_Of_Installation_Text: Camera_Heigh_Of_Installation_Text,
        // Camera_Heigh_Of_Installation_Desc: Camera_Heigh_Of_Installation_Desc,
        Recorder: JSON.parse(Recorder),
        //Add image of Recorder installation
        // Recorder_Heigh_Of_Installation_Picture:
        //   imageUrls.Recorder_Heigh_Of_Installation_Picture,
        // Recorder_Heigh_Of_Installation_Text:
        //   Recorder_Heigh_Of_Installation_Text,
        // Recorder_Heigh_Of_Installation_Desc:
        //   Recorder_Heigh_Of_Installation_Desc,
        Cable_type: Cable_type,
        Cable_Length: Cable_Length,
        Storage_Duration: Storage_Duration,
        FireAlarm: FireAlarm,
        Smart_Lock: Smart_Lock,
        Security_Lighting: Security_Lighting,
        Special_Requirement: Special_Requirement,
        Follow_Method_email: Follow_Method_email,
        Follow_Method_phone: Follow_Method_phone,
        Follow_Method_sms: Follow_Method_sms,
      });

      saveCCTV_Instruction
        .save()
        .then(() => {
          res.send({
            success: true,
            message: "Successfully CCTV Created",
            data: saveCCTV_Instruction,
          });
        })
        .catch((e) => {
          res.send({
            success: false,
            message: e.message,
          });
        });
    } catch (err) {
      console.log(err.message);
    }
  };

  static getCamera = async (req, res) => {
    const {
      Camera_type,
      Resolution,
      Additonal_Feature,
      audio_type,
      where_to_install,
    } = req.body;

    const Dome_Camera = Camera_type;
    const newCamera = Dome_Camera.split("Cameras");

    const Camera = await Camera_Modal.find({
      RESOLUTION: Resolution,
      DESCRIPTION: { $regex: newCamera[0], $options: "i" }, // Case-insensitive search for the keyword "camera"
    });

    res.send({
      success: true,
      data: Camera,
    });
  };

  static getRecorder = async (req, res) => {
    // const {Camera_type, Resolution, Additonal_Feature, audio_type, where_to_install} = req.body
    try {
      const Recorder = await Recorder_Modal.find();

      res.send({
        success: true,
        data: Recorder,
      });
    } catch (error) {
      console.log("error", error.message);
    }
  };

  static getGeneratedPdf = async (req, res) => {
    const userData = req.user

    console.log("first", userData)

    try {
      
    

    const getAllGeneratedPdf = await AlaramReport_Model.find({report_generator_id: userData._id})

    res.send({
      success : true,
      data: getAllGeneratedPdf
    })

  } catch (error) {
    res.send({
      success : false,
      message:error.message
    })
  }



  }


  //function to generate pdf and upload to cloud
  static generatePDFFromHTML = async (htmlContent) => {
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
      });

      await browser.close();
      return pdfBuffer;
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw error;
    }
  };

  static uploadPDFToCloudinary = (pdfBuffer, fileName) => {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.v2.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "alarm_pdfs",
          format: "pdf",
          public_id: fileName,
          access_mode: "public",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error); // Log the error
            reject(error);
          } else {
            console.log("Cloudinary upload result:", result); // Log the result
            resolve(result);
          }
        }
      );
  
      streamifier.createReadStream(pdfBuffer).pipe(uploadStream);
    });
  };
  
}

module.exports = MainController;
