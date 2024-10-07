const { google } = require('googleapis');
const sheets = google.sheets('v4');

const CameraModel = require('../models/CameraAndRecorder_Data/CameraModel')
const RecorderModel = require('../models/CameraAndRecorder_Data/RecorderModel')
// Initialize Google Auth
const auth = new google.auth.GoogleAuth({
  keyFile: './your.json',  // Path to your credentials file
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],  // Read-only access
});



class GoogleSheet {
    static getSpreed = async (req, res) => {
      try {
        const client = await auth.getClient();
        
        // Spreadsheet ID and sheet range
        const spreadsheetId = '1JnyNNBE_4_oqNNZyroew1fLkPlssMSn3w0tzY9uYKmE';
        const range = 'HiLook TVI';  // Adjust the sheet name if needed
        

        //sheets name
        // 1. HiLook IP
        // 2. HiLook TVI
        // 3. HiLook Analogue Kits
        // 4. Brackets
        // 5. HiLook Switch 


        // Fetch all values from the sheet
        const response = await sheets.spreadsheets.values.get({
          auth: client,
          spreadsheetId: spreadsheetId,
          range: range,  // Fetch all data in the sheet
        });
  
        const data = response.data.values;
  
        if (!data || data.length === 0) {
          console.log('No data found.');
          res.send({ success: true, message: 'No data found' });
        } else {
          console.log(data);
  
          // Assuming the first row contains headers
          const headers = data[0];
          const rows = data.slice(1);
  
          // Process each row
          for (const row of rows) {
            const description = row[2] || '';
            const type = description.includes('DVR') || description.includes('NVR') ? 'Recorder' : 'Camera';
  
            const existingRecord = await CameraModel.findOne({ 'PRODUCT_CODE': row[0] });

        
            if (!existingRecord) {
              // Create and save new document if it doesn't exist

              if(type == "Recorder"){
                if(description && description !== "DESCRIPTION"){
                const newRecorderRecord = new RecorderModel({
                    PRODUCT_CODE: row[0] || 'N/A',
                    IMAGE: row[1] || 'N/A',
                    DESCRIPTION: description,
                    RESOLUTION: row[3] || 'N/A',
                    Availablity: row[4] || 'N/A',
                    WEBSITE: row[5] || 'N/A',
                    PRICE: row[6] || 'N/A',
                    Compatible_Bracket: row[7] || 'N/A',
                    Wall_Bracket: row[8] || 'N/A',
                    TYPE: type
                  });
                  await newRecorderRecord.save();
                  console.log('newRecorderRecord added:', newRecorderRecord);
                }

              }else if(type == "Camera"){
                if(description && description !== "DESCRIPTION"){
                  const newCameraRecord = new CameraModel({
                    PRODUCT_CODE: row[0] || 'N/A',
                    IMAGE: row[1] || 'N/A',
                    DESCRIPTION: description,
                    RESOLUTION: row[3] || 'N/A',
                    Availablity: row[4] || 'N/A',
                    WEBSITE: row[5] || 'N/A',
                    PRICE: row[6] || 'N/A',
                    Compatible_Bracket: row[7] || 'N/A',
                    Wall_Bracket: row[8] || 'N/A',
                    TYPE: type
                  });
                  await newCameraRecord.save();
                  console.log('newCameraRecord added:', newCameraRecord);
                }
              }
  
            } else {
              console.log('Record already exists:', existingRecord);
            }
          }
  
          res.send({ success: true, message: 'Data processed successfully' });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send({
          success: false,
          message: 'Error fetching spreadsheet data',
          error: error.message,
        });
      }
    }
  }
  
  

module.exports = GoogleSheet;



// class GoogleSheet {
//     static getSpreed = async (req, res) => {
//       try {
//         const client = await auth.getClient();
        
//         // Spreadsheet ID and sheet range
//         const spreadsheetId = '1JnyNNBE_4_oqNNZyroew1fLkPlssMSn3w0tzY9uYKmE';
//         const range = 'HiLook IP';  // Adjust the sheet name if needed
  
//         // Fetch all values from the sheet
//         const response = await sheets.spreadsheets.values.get({
//           auth: client,
//           spreadsheetId: spreadsheetId,
//           range: range,  // Fetch all data in the sheet
//         });
  
//         const data = response.data.values;
  
//         if (!data || data.length === 0) {
//           console.log('No data found.');
//           res.send({ success: true, message: 'No data found' });
//         } else {
//           console.log(data);
  
//           // Assuming the first row contains headers
//           const headers = data[0];
//           const rows = data.slice(1);
  
//           const convertedData = rows.map(async(row) => {
//             console.log("row",row)
//             const description = row[2] || '';
//             const type = description.includes('DVR') || description.includes('NVR') ? 'Recorder' : 'Camera';

//             const existingRecord = await CameraModel.findOne({ 'PRODUCT_CODE': row[0] || 'N/A' });

//             if (!existingRecord) {
//              const newRecord = new CameraModel({
//                 PRODUCT_CODE : row[0] || 'N/A',
//                 IMAGE : row[1] || 'N/A',
//                 DESCRIPTION : description,
//                 RESOLUTION : row[3] || 'N/A',
//                 Availablity :row[4] || 'N/A',
//                 WEBSITE : row[5] || 'N/A',
//                 PRICE : row[6] || 'N/A',
//                 Compatible_Bracket : row[7] || 'N/A',
//                 Wall_Bracket: row[8] || 'N/A',
//                 TYPE: type
//             })
//             await newRecord.save().then(()=>{
//                 res.send({
//                     success: true,
//                     message: "Successfully Uploaded",
//                   });
//             })


//         }
            
//             // return {
//             //   'PRODUCT CODE': row[0] || 'N/A',
//             //   'IMAGE': row[1] || 'N/A',
//             //   'DESCRIPTION': description,
//             //   'RESOLUTION': row[3] || 'N/A',
//             //   'Availablity': row[4] || 'N/A',
//             //   'WEBSITE': row[5] || 'N/A',
//             //   'PRICE (ex vat)': row[6] || 'N/A',
//             //   'Compatible Bracket': row[7] || 'N/A', // Default to 'N/A' if not present
//             //   'Wall Bracket': row[8] || 'N/A', // Default to 'N/A' if not present
//             //   'TYPE': type // New field based on description
//             // };
//           });
          
//         //   console.log(convertedData);
  
        
//         }
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         res.status(500).send({
//           success: false,
//           message: 'Error fetching spreadsheet data',
//           error: error.message,
//         });
//       }
//     }
//   }

