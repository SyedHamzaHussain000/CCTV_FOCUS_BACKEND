const mongoose = require('mongoose');

const AlarmModel = new mongoose.Schema({

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
    PropertySize:{
        type:String
    },
    No_Of_Floor:{
        type:String
    },
    Entry_Point:{
        type: String,
    },
    ControlPanel_Image:{
        type: String,
    },
    ControlPanel_Location:{
        type: String,
    },
    ControlPanel_Description:{
        type: String,
    },
    KeyPad_Image:{
        type: String,
    },
    KeyPad_Location:{
        type: String,
    },
    Siren_Location:{
        type: String,
    },
    Distance_from_Control_Panel:{
        type: String,
    },
    Matching_CCTV_Image:{
        type: String,
    },
    Matching_CCTV_Description:{
        type: String,
    },
    Sensors:{
        type: Boolean
    },
    Door_Contacts:{
        type: Boolean
    },
    Shock_Sensor:{
        type: Boolean
    }

},{
    timestamps:true
})


const Alarm_Modal = mongoose.model('Alarm', AlarmModel);

module.exports  =  Alarm_Modal;
