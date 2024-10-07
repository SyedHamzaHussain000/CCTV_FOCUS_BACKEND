const mongoose  = require("mongoose");

const OTPSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User model
        require: true,
    },
    otp_code: {
        type: Number, // Assuming OTP is numeric
        require: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 900, // Set expiration time for OTP (15 minutes)
    },
});

const OTP = mongoose.model('OTP', OTPSchema);

module.exports  =  OTP;
