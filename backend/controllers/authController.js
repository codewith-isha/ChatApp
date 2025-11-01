// step 1 send otp 

const User = require("../models/User");
const otpGenerate = require("../utils/otpGenerator");
const response = require("../utils/responseHandler");
const tiwilloService = require('../services/twilloService');
const generateToken = require("../utils/generateToken");
const sentOtpToEmail = require("../services/emailService");

const sentOtp = async(req,res) =>{
  const {phoneNumber, phoneSuffix,email} = req.body;
  const otp = otpGenerate();
  const expiry  = new Date(Date.now()+5 * 60 *1000)
  try {
    let user;
    if(email){
      user = await User.findOne({email})
      if(!user){
        user =new User({email})
      }
      user.emailOtp = otp;
      user.emailOtpExpiry = expiry;
      await user.save()

       await sentOtpToEmail(email,otp)
      return response(res,200,'Otp sent on email', {email})
    }
    if(!phoneNumber || !phoneSuffix){
      return response(res,400,"Phone number and phone suffix needed !!")
    }

    const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`
    user = await User.findOne({phoneNumber});
    if(!user){
      user = await new User({phoneNumber,phoneSuffix})
    }
    await tiwilloService.sendOtpToPhoneNumber(fullPhoneNumber)
    await user.save();
    
    return response(res,200,"Otp send Successfully", user)
  } catch (error) {
    console.log(error)
    return response(res,500,"Internal server Error !!")
  }
}

//step - 2 Verify otp 

const verifyOtp = async(req,res)=>{
  const  {phoneNumber, phoneSuffix,email,otp} = req.body

  try {
    let user;
    if(email){
      user = await User.findOne({email})
      if(!user){
        return response (res,404,`User not Found`)
      }
      const now = new Date();
      if(!user.emailOtp || String(user.emailOtp) !==String(otp) || now > new Date(user.emailOtpExpiry)){
        return response(res,400,'Invalid or Expired otp')
      }
       
      user.isVerified = true;
      user.emailOtp=null;
      user.emailOtpExpiry = null;
      await user.save();
    }
    else{
       if(!phoneNumber || !phoneSuffix){
      return response(res,400,"Phone number and phone suffix needed !!")
    }
     const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
     user =  await User.findOne({phoneNumber});
     if(!user){
      return response(res,404,'User not found')
     }
     const result = await tiwilloService.verifyOtp(fullPhoneNumber,otp);
     if(result.status !== 'approved'){
      return response(res,400,'Invalid Otp')
     }
     user.isVerified = true;
     await user.save();
    }
    const token = generateToken(user?._id);
    res.cookie('auth_token',token, {
      httpOnly:true,
      maxAge:1000*60 *60 *24 *365
    })
    return response(res,200,'otp verified successfully',{token , user})
  } 
 
  
  catch (error) {
    console.log(error)
    return response(res,500,"Internal server Error !!")
  }
}
module.exports = {
 sentOtp,verifyOtp
}