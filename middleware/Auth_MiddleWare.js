const JWT = require('jsonwebtoken')
const User = require('../models/UserModel')

var checkUserAuth = async (req, res, next) => {
    let token

    if(!token){
        res.send({success: false,message :"Token not found"})
        return
    }


    const {authorization} = req.headers
    if(authorization && authorization?.startsWith('Bearer')){
        try{
            //get token from header
            token = authorization.split(' ')[1]

            //verify token
            const {UserID} = JWT.verify(token, process.env.JWT_SECRET_KEY,)
            
            //get User from token
            req.user = await User.findById(UserID).select('-password')
            next()

        }catch(err){
            res.send({success: false,message :"UnAuthorized access"})
        }
    }

 
} 


module.exports  = checkUserAuth