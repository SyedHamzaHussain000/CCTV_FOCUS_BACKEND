const mongoose = require('mongoose')

const CCTVModal = new mongoose.Schema({
    report_generator_id: {
        type: mongoose.Schema.ObjectId
    },
    full_name: {
        type: String,
    },
    email: {
        type: String,
    },
    phone_number: {
        type: String,
    },
    address: {
        type: String,
    },
    What_Sector:{
        type: String,
    },
    What_Sector_Step_Two:{
        type: String,
    },
    What_Comercial_Sector:{
        type: String,
    },
    What_Comercial_Other_Info:{
        type: String,
    },
    What_Comercial_Postal_Code:{
        type: String,
    },
    BedRooms:{
        type: String,
    },
    Purpose_Of_Installment:{
        type: String,
    },
    Area_of_Concern:{
        type: String,
    },
    Security_System:{
        type: String,
    },
    CCTV_Equipment:{
        type: String,
    },
    Security_Incident:{
        type: String,
    },
    Camera:[{
        Camera_id: {
           type: mongoose.Schema.ObjectId,
           ref: 'Camera'
        },
        PRODUCT_CODE: String,
        IMAGE: String,
        DESCRIPTION: String,
        RESOLUTION: String,
        Availablity: String,
        WEBSITE: String,
        PRICE: String,
        Compatible_Bracket: String,
        Wall_Bracket: String,
        TYPE: String,
        heightOfInstallation: String,
        heighBrief: String,
        HeightOfInstallationImage: String,

    }],
    cameraHeightOfInstallationImages: [],

    Recorder:[{
        Recorder_id: {
           type: mongoose.Schema.ObjectId,
           ref: 'Recorder'
        },
        PRODUCT_CODE: String,
        IMAGE: String,
        DESCRIPTION: String,
        RESOLUTION: String,
        Availablity: String,
        WEBSITE: String,
        PRICE: String,
        Compatible_Bracket: String,
        Wall_Bracket: String,
        TYPE: String, 
    }],
    recorderHeightOfInstallationImages:[],
    Cable_type:{
        type: String,
    },
    Cable_Length:{
        type: String,
    },
    Storage_Duration:{
        type: String,
    },
    FireAlarm:{
        type: Boolean
    },
    Smart_Lock:{
        type: Boolean
    },
    Security_Lighting:{
        type: Boolean
    },
    Special_Requirement:{
        type: String
    },
    Follow_Method_email:{
        type: Boolean
    },
    Follow_Method_phone:{
        type: Boolean
    },
    Follow_Method_sms:{
        type: Boolean
    },



    
})


const CCTV_Modal = mongoose.model('CCTV', CCTVModal)

module.exports = CCTV_Modal