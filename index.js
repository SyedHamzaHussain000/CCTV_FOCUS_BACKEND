require('dotenv').config();

const express = require('express')
const cors = require('cors')
const Connect_DB = require('./Database/Connect_DB')
const route = require('./Routes');
const GoogleSheet = require('./controller/GoogleSheet');

const app = express()
Connect_DB()

app.use(cors())
app.use(express.json())

app.use('/api', route)

// app.get('/fetch-images', async (req, res) => {
//     try {
//       await GoogleSheet.getSheetImages();
//       res.send({ success: true, message: 'Images downloaded successfully' });
//     } catch (error) {
//       res.status(500).send({
//         success: false,
//         message: 'Error fetching images from Google Sheet',
//         error: error.message,
//       });
//     }
//   });
  




app.listen(process.env.PORT, ()=>{
    console.log("Server is running")
})