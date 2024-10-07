const mongoose = require('mongoose');


const CameraModel = new mongoose.Schema({
    PRODUCT_CODE : String,
    IMAGE : String,
    DESCRIPTION : String,
    RESOLUTION : String,
    Availablity : String,
    WEBSITE : String,
    PRICE : String,
    Compatible_Bracket : String,
    Wall_Bracket: String,
    TYPE: String

},{
    timestamps:true
})

const Camera_Modal = mongoose.model('Camera', CameraModel);

module.exports  =  Camera_Modal;



