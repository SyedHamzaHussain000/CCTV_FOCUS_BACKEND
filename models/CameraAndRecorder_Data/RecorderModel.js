const mongoose = require('mongoose');


const RecorderModel = new mongoose.Schema({
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

const Recorder_Modal = mongoose.model('Recorder', RecorderModel);

module.exports  =  Recorder_Modal;




