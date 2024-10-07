
const mongoose = require('mongoose');


const UserModal = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter your name"]
    },
    email: {
        type: String,
        required: [true, "Please enter your email address"],
        unique: [true, "Email already exists"],
    },
    password:{
        type: String,
        required: [true, "Please enter your password"]
    },
},{
    timestamps:true
})


const User_Modal = mongoose.model('User', UserModal);

module.exports  =  User_Modal;
