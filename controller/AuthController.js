const User_Modal = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const OTP = require('../models/OTPModel')
class AuthController {
  static Register = async (req, res) => {
    const { name, email, password } = req.body;

    const user = await User_Modal.findOne({ email: email });

    if (user) {
      res.send({ success: false, message: "Email already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const HashPassword = await bcrypt.hash(password, salt);

    const RegisterAccount = new User_Modal({
      name: name,
      email: email,
      password: HashPassword,
    });

    RegisterAccount.save()
      .then(async () => {
        res.send({
          success: true,
          message: "Registered successfully",
        });
      })
      .catch((err) => {
        res.send({
          success: false,
          error: err,
        });
      });
  };

  static Login = async (req, res) => {
    const { email, password } = req.body;

    const userData = await User_Modal.findOne({ email: email });

    if (userData) {
      const comparePassword = await bcrypt.compare(password, userData.password);
      const token = jwt.sign(
        { userID: userData.id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "2y" }
      );

      const newUserData = await User_Modal.findOne({ email: email })
        .select("-password")
        .lean();

      if (comparePassword == true) {
        res.send({
          success: true,
          data: newUserData,
          token: token,
        });
      }
    }else{
      res.send({
        success: false,
        message: "User not exist"

      })
    }
  };

  static sendUserPasswordEmail = async (req, res) => {
    const { email } = req.body;

    if (email) {
      const user = await User_Modal.findOne({ email: email });

      if (user) {
        const otp = Math.floor(1000 + Math.random() * 9000);

        // Store the OTP in the database
        const otpData = new OTP({
          userId: user._id,
          otpCode: otp,
        });
        await otpData.save();

        // Send the OTP via email
        const transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
              user: "maddison53@ethereal.email",
              pass: "jn7jnAPss4f63QBp6D",
            },
          });
          await transporter.sendMail({
            from: '"Maddison Foo Koch 👻" <maddison53@ethereal.email>', // sender address
            to: "bar@example.com, baz@example.com", // list of receivers
            subject: "Hello ✔", // Subject line
            text: "Hello world?", // plain text body
            html: "<b>Hello world?</b>", // html body
          })

        // res.send({ "status": "Success", "message": "Password send succesfully", "token": token, "User_ID": user._id })
      } else {
        res.send({ success: false, message: "Email does not exist" });
      }
    } else {
      res.send({ success: false, message: "Please enter your email" });
    }
  };

  static VerifyOtp = async (req, res) => {
    const { otp, id } = req.body;

    const otpData = await OTP.findOne({ user_id: id, otp_code: otp });

    if (otpData) {
      res.send({ success: true, message: "Otp Verified successfully" });
    } else {
      res.send({ success: false, message: "Invalid Otp" });
    }
  };

  static resetForgetPassword = async (req, res) => {
    const { password, password_confirmation, id } = req.body;

    if (password && password_confirmation) {
      if (password !== password_confirmation) {
        res.send({ success: false, message: "Password does not match" });
      } else {
        // Hash the new password and update the user's password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        await User_Modal.findByIdAndUpdate(id, { password: hashPassword });

        // Delete the OTP from the database since it has been used
        // await otpData?.remove();

        res.send({ success: false, message: "Password Reset Successfully" });
      }
    } else {
      res.send({
        success: false,
        message: "Password and confirmation are required",
      });
    }
  };
  
  
}

module.exports = AuthController;
