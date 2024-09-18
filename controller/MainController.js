const cloudinary = require("cloudinary");
const path = require("path");
const puppeteer = require("puppeteer");
const streamifier = require('streamifier');
const fs = require('fs'); // Required to check the file system

const User_Modal = require('../models/UserModel')
const AlarmModal = require("../models/AlarmModel");
const CCTVModal = require("../models/CCTVModel");
const Camera_Modal = require("../models/CameraAndRecorder_Data/CameraModel");
const Recorder_Modal = require("../models/CameraAndRecorder_Data/RecorderModel");
const AlaramReport_Model = require("../models/Reports_Modal/AlaramReportModel");
const Graph_Modal = require("../models/GraphCCTVModal")

const bcrypt = require("bcryptjs");


const { response } = require("express");
const { constants } = require("crypto");
const Graph_Alarm = require("../models/GraphAlarmModal");

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
    const { Camera_Heigh_Of_Installation_Picture, Recorder_Heigh_Of_Installation_Picture } = req.files;
    const userData = req.user


    try {
        // Function to upload images to Cloudinary
        const uploadImagesToCloudinary = (pdfBuffer, fileName) => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.v2.uploader.upload_stream(
              {
                resource_type: "image",
                folder: "CCTVandRecorder",
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

        // Helper function to handle multiple image uploads in parallel
        const uploadImages = async (images, folderName) => {
            if (!images) return [];
            const uploadPromises = images.map(async (image) => {
                const fileNameWithoutExtension = path.basename(image.originalname, path.extname(image.originalname));
                console.log(`Preparing to upload ${fileNameWithoutExtension}`);
                try {
                    const url = await uploadImagesToCloudinary(image.buffer, folderName, fileNameWithoutExtension);
                    console.log(`Uploaded ${fileNameWithoutExtension} to ${url}`);
                    return url.url;
                } catch (error) {
                    console.error(`Error uploading ${fileNameWithoutExtension}:`, error);
                    return null;
                }
            });
            return Promise.all(uploadPromises);
        };

        // Upload Camera and Recorder images in parallel
        const [cameraImageUrls, recorderImageUrls] = await Promise.all([
            uploadImages(Camera_Heigh_Of_Installation_Picture, 'CCTV_CAMERA/Camera_Images'),
            uploadImages(Recorder_Heigh_Of_Installation_Picture, 'CCTV_CAMERA/Recorder_Images')
        ]);

        // Parse the Camera and Recorder JSON
        const parsedCamera = JSON.parse(req.body.Camera);
        const parsedRecorder = JSON.parse(req.body.Recorder);

        // Create and save the instruction
        const saveCCTV_Instruction = new CCTVModal({
            full_name: req.body.full_name,
            email: req.body.email,
            phone_number: req.body.phone_number,
            address: req.body.address,
            What_Sector: req.body.What_Sector,
            What_Sector_Step_Two: req.body.What_Sector_Step_Two,
            What_Comercial_Sector: req.body.What_Comercial_Sector,
            What_Comercial_Other_Info: req.body.What_Comercial_Other_Info,
            What_Comercial_Postal_Code: req.body.What_Comercial_Postal_Code,
            BedRooms: req.body.BedRooms,
            Purpose_Of_Installment: req.body.Purpose_Of_Installment,
            Area_of_Concern: req.body.Area_of_Concern,
            Security_System: req.body.Security_System,
            CCTV_Equipment: req.body.CCTV_Equipment,
            Security_Incident: req.body.Security_Incident,
            Camera: parsedCamera,
            cameraHeightOfInstallationImages: cameraImageUrls.filter(url => url !== null),
            Recorder: parsedRecorder,
            recorderHeightOfInstallationImages: recorderImageUrls.filter(url => url !== null),
            Cable_type: req.body.Cable_type,
            Cable_Length: req.body.Cable_Length,
            Storage_Duration: req.body.Storage_Duration,
            FireAlarm: req.body.FireAlarm,
            Smart_Lock: req.body.Smart_Lock,
            Security_Lighting: req.body.Security_Lighting,
            Special_Requirement: req.body.Special_Requirement,
            Follow_Method_email: req.body.Follow_Method_email,
            Follow_Method_phone: req.body.Follow_Method_phone,
            Follow_Method_sms: req.body.Follow_Method_sms,
        });



        await saveCCTV_Instruction.save();
        const htmlContent = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; }
            h1 { color: blue; }
            p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>CCTV Instruction</h1>
          <p><strong>Full Name:</strong> ${req.body.full_name}</p>
          <p><strong>Email:</strong> ${req.body.email}</p>
          <p><strong>Phone Number:</strong> ${req.body.phone_number}</p>
          <p><strong>Address:</strong> ${req.body.address}</p>
          <p><strong>What Sector:</strong> ${req.body.What_Sector}</p>
          <p><strong>What Sector Step Two:</strong> ${req.body.What_Sector_Step_Two}</p>
          <p><strong>What Comercial Sector:</strong> ${req.body.What_Comercial_Sector}</p>
          <p><strong>What Comercial Other Info:</strong> ${req.body.What_Comercial_Other_Info}</p>
          <p><strong>What Comercial Postal Code:</strong> ${req.body.What_Comercial_Postal_Code}</p>
          <p><strong>Bedrooms:</strong> ${req.body.BedRooms}</p>
          <p><strong>Purpose of Installment:</strong> ${req.body.Purpose_Of_Installment}</p>
          <p><strong>Area of Concern:</strong> ${req.body.Area_of_Concern}</p>
          <p><strong>Security System:</strong> ${req.body.Security_System}</p>
          <p><strong>CCTV Equipment:</strong> ${req.body.CCTV_Equipment}</p>
          <p><strong>Security Incident:</strong> ${req.body.Security_Incident}</p>
          
          <h2>Camera Details</h2>
          <p><strong>Camera:</strong> ${JSON.stringify(parsedCamera, null, 2)}</p>
          <p><strong>Camera Height Of Installation Images:</strong></p>
          ${cameraImageUrls.map(url => `<img src="${url}" alt="Camera Image" style="max-width: 300px; margin-bottom: 10px;">`).join('')}
          
          <h2>Recorder Details</h2>
          <p><strong>Recorder:</strong> ${JSON.stringify(parsedRecorder, null, 2)}</p>
          <p><strong>Recorder Height Of Installation Images:</strong></p>
          ${recorderImageUrls.map(url => `<img src="${url}" alt="Recorder Image" style="max-width: 300px; margin-bottom: 10px;">`).join('')}
          
          
          <p><strong>Cable Type:</strong> ${req.body.Cable_type}</p>
          <p><strong>Cable Length:</strong> ${req.body.Cable_Length}</p>
          <p><strong>Storage Duration:</strong> ${req.body.Storage_Duration}</p>
          <p><strong>Fire Alarm:</strong> ${req.body.FireAlarm}</p>
          <p><strong>Smart Lock:</strong> ${req.body.Smart_Lock}</p>
          <p><strong>Security Lighting:</strong> ${req.body.Security_Lighting}</p>
          <p><strong>Special Requirement:</strong> ${req.body.Special_Requirement}</p>
          <p><strong>Follow Method Email:</strong> ${req.body.Follow_Method_email}</p>
          <p><strong>Follow Method Phone:</strong> ${req.body.Follow_Method_phone}</p>
          <p><strong>Follow Method SMS:</strong> ${req.body.Follow_Method_sms}</p>
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
      pdf_type: "CCTV",
      full_name: req.body.full_name,
    })

    await pdfSave.save()

        res.send({
            success: true,
            message: 'Successfully created CCTV instruction',
            data: saveCCTV_Instruction,
            pdfUrl: pdfUploadResponse.secure_url,
            pdf_type: "Camera"
        });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send({
            success: false,
            message: err.message,
        });
    }
};


  
    // static Post_CCTV_Instruction = async (req, res) => {

    //   console.log("Request Files:", req.files); // Log the files object

    //   const {Camera_Heigh_Of_Installation_Picture, Recorder_Heigh_Of_Installation_Picture} = req.files
      

    //   res.send({
    //     Camera_Heigh_Of_Installation_Picture:Camera_Heigh_Of_Installation_Picture,
    //     Recorder_Heigh_Of_Installation_Picture:Recorder_Heigh_Of_Installation_Picture
    //   })

    //   return

    //   const {
    //     full_name,
    //     email,
    //     phone_number, 
    //     address,
    //     What_Sector,
    //     What_Sector_Step_Two,
    //     What_Comercial_Sector,
    //     What_Comercial_Other_Info,
    //     What_Comercial_Postal_Code,
    //     BedRooms,
    //     Purpose_Of_Installment,
    //     Area_of_Concern,
    //     Security_System,
    //     CCTV_Equipment,
    //     Security_Incident,
    //     Camera,
    //     Recorder,
    //     Cable_type,
    //     Cable_Length,
    //     Storage_Duration,
    //     FireAlarm,
    //     Smart_Lock,
    //     Security_Lighting,
    //     Special_Requirement,
    //     Follow_Method_email,
    //     Follow_Method_phone,
    //     Follow_Method_sms,
    //   } = req.body;

      
    //   // const {Camera_Heigh_Of_Installation_Picture} = req.files
    //   console.log("first",Camera)
    //   return 
    //     // console.log("first",full_name,
    //     //   email,
    //     //   phone_number,
    //     //   address,
    //     //   What_Sector,
    //     //   What_Sector_Step_Two,
    //     //   What_Comercial_Sector,
    //     //   What_Comercial_Other_Info,
    //     //   What_Comercial_Postal_Code,
    //     //   BedRooms,
    //     //   Purpose_Of_Installment,
    //     //   Area_of_Concern,
    //     //   Security_System,
    //     //   CCTV_Equipment,
    //     //   Security_Incident,
    //     //   Camera,
    //     //   Recorder,
    //     //   Cable_type,
    //     //   Cable_Length,
    //     //   Storage_Duration,
    //     //   FireAlarm,
    //     //   Smart_Lock,
    //     //   Security_Lighting,
    //     //   Special_Requirement,
    //     //   Follow_Method_email,
    //     //   Follow_Method_phone,
    //     //   Follow_Method_sms,)
    //         // Parse the Camera array (as it's sent as JSON string)
      
    //   // Parse the Camera array (as it's sent as JSON string)


    //   try {
    //     // let imageUrls = {};
    //     // const {
    //     //   Camera_Heigh_Of_Installation_Picture,
    //     //   Recorder_Heigh_Of_Installation_Picture,
    //     // } = req.files;

    //     // if (Camera_Heigh_Of_Installation_Picture) {
    //     //   const fileNameWithoutExtension = path.basename(
    //     //     Camera_Heigh_Of_Installation_Picture[0].originalname,
    //     //     path.extname(Camera_Heigh_Of_Installation_Picture[0].originalname)
    //     //   );
    //     //   imageUrls.Camera_Heigh_Of_Installation_Picture =
    //     //     await uploadImageToCloudinary(
    //     //       Camera_Heigh_Of_Installation_Picture[0].buffer,
    //     //       `CCTV_CAMERA/Alarm/${fileNameWithoutExtension}`
    //     //     );
    //     // }

    //     // if (Recorder_Heigh_Of_Installation_Picture) {
    //     //   const fileNameWithoutExtension = path.basename(
    //     //     Recorder_Heigh_Of_Installation_Picture[0].originalname,
    //     //     path.extname(Recorder_Heigh_Of_Installation_Picture[0].originalname)
    //     //   );
    //     //   imageUrls.Recorder_Heigh_Of_Installation_Picture =
    //     //     await uploadImageToCloudinary(
    //     //       Recorder_Heigh_Of_Installation_Picture[0].buffer,
    //     //       `CCTV_CAMERA/Alarm/${fileNameWithoutExtension}`
    //     //     );
    //     // }

    //     const saveCCTV_Instruction = await CCTVModal({
    //       full_name: full_name,
    //       email: email,
    //       phone_number: phone_number,
    //       address: address,
    //       What_Sector: What_Sector,
    //       What_Sector_Step_Two: What_Sector_Step_Two,
    //       What_Comercial_Sector: What_Comercial_Sector,
    //       What_Comercial_Other_Info: What_Comercial_Other_Info,
    //       What_Comercial_Postal_Code: What_Comercial_Postal_Code,
    //       BedRooms: BedRooms,
    //       Purpose_Of_Installment: Purpose_Of_Installment,
    //       Area_of_Concern: Area_of_Concern,
    //       Security_System: Security_System,
    //       CCTV_Equipment: CCTV_Equipment,
    //       Security_Incident: Security_Incident,
    //       Camera: JSON.parse(Camera),
    //       // cameraHeightOfInstallation: [6 urls],
    //       // recorderHeightOfInstallation: [3 urls],
    //       //Add image of camera installation
    //       // Camera_Heigh_Of_Installation_Picture:
    //       //   imageUrls.Camera_Heigh_Of_Installation_Picture,
    //       // Camera_Heigh_Of_Installation_Text: Camera_Heigh_Of_Installation_Text,
    //       // Camera_Heigh_Of_Installation_Desc: Camera_Heigh_Of_Installation_Desc,
    //       Recorder: JSON.parse(Recorder),
    //       //Add image of Recorder installation
    //       // Recorder_Heigh_Of_Installation_Picture:
    //       //   imageUrls.Recorder_Heigh_Of_Installation_Picture,
    //       // Recorder_Heigh_Of_Installation_Text:
    //       //   Recorder_Heigh_Of_Installation_Text,
    //       // Recorder_Heigh_Of_Installation_Desc:
    //       //   Recorder_Heigh_Of_Installation_Desc,
    //       Cable_type: Cable_type,
    //       Cable_Length: Cable_Length,
    //       Storage_Duration: Storage_Duration,
    //       FireAlarm: FireAlarm,
    //       Smart_Lock: Smart_Lock,
    //       Security_Lighting: Security_Lighting,
    //       Special_Requirement: Special_Requirement,
    //       Follow_Method_email: Follow_Method_email,
    //       Follow_Method_phone: Follow_Method_phone,
    //       Follow_Method_sms: Follow_Method_sms,
    //     });

    //     saveCCTV_Instruction
    //       .save()
    //       .then(() => {
    //         res.send({
    //           success: true,
    //           message: "Successfully CCTV Created",
    //           data: saveCCTV_Instruction,
    //         });
    //       })
    //       .catch((e) => {
    //         res.send({
    //           success: false,
    //           message: e.message,
    //         });
    //       });
    //   } catch (err) {
    //     console.log(err.message);
    //   }
    // };

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


  static GetCountOfCameraAndRecorder = async(req, res) => {

    try {
      
    
    const Recorder = await Recorder_Modal.countDocuments({})
    const Camera = await Camera_Modal.countDocuments({})



    res.send({
      success: true,
      Recorder_Count : Recorder,
      Camera_Count : Camera
    })

  } catch (error) {
    res.send({
      success: false,
      message: error.message
    }) 
  }

  }

  static generateGraph = async (req, res) => {
    const user_data = req.user;
    const { type, label, ...otherData } = req.body; // Destructure other data
  
    try {
      // Check for existing label based on type and date
      const existingGraph = await (type === 'CCTV' ? Graph_Modal : Graph_Alarm).findOne({
        user_id: user_data._id,
        label,
      });
  
      if (existingGraph) {
        // Update existing graph value by 1
        existingGraph.value++;
        await existingGraph.save();
  
        // console.log(`Updated existing ${type} graph with label: ${label}`);
      } else {
        // Create a new graph
        const newGraph = new (type === 'CCTV' ? Graph_Modal : Graph_Alarm)({
          user_id: user_data._id,
          ...otherData, // Spread remaining data
        });
  
        await newGraph.save();
        // console.log(`Created new ${type} graph with label: ${label}`);
      }
  
      res.send({
        success: true,
        message: `Graph(s) generated successfully!`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send({ success: false, error: error.message });
    }
  };


  static ChangePassword = async (req, res) => {
    const { email, oldPassword, newPassword } = req.body;
  
    try {
      // 1. Find user by email
      const userData = await User_Modal.findOne({ email: email });
  
      if (!userData) {
        return res.send({ success: false, message: "User not found" });
      }
  
      // 2. Compare old password
      const isPasswordCorrect = await bcrypt.compare(oldPassword, userData.password);
  
      if (!isPasswordCorrect) {
        return res.send({ success: false, message: "Your current password is not correct" });
      }
  
      // 3. Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10); // Adjust cost factor as needed
  
      // 4. Update user password
      userData.password = hashedPassword;
      await userData.save();
  
      // 5. Respond with success message
      res.send({ success: true, message: "Password changed successfully" });
    } catch (error) {
      console.error(error);
      res.send({ success: false, message: "Error changing password" });
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
