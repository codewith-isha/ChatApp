const twillo = require('twilio');
require('dotenv').config();
// twillo Credential 

const accountSid = process.env.TWILLO_ACCOUNT_SID
const serviceSid = process.env.TWILLO_SERVICE_SID
const authToken= process.env.TWILIO_AUTH_TOKEN;

const client = twillo(accountSid,authToken)

const sendOtpToPhoneNumber = async(phoneNumber)=>{
  try {
    console.log('sending otp to this number', phoneNumber)
    if(!phoneNumber){
      throw new Error('phone number is required')
    }
    const response = await client.verify.v2.services(serviceSid).verifications.create({
      to:phoneNumber,
      channel:'sms'
    });
    console.log('this is my otp response', response);
    return response;
    
  } catch (error) {
   console.error('Twilio Error Message:', error.message);
    console.error('Twilio Full Error:', error);
  throw new Error(`Failed to send otp: ${error.message}`);
  }
}


const verifyOtp = async(phoneNumber,otp)=>{
  try {
    console.log('this is otp', otp)
     console.log(' this number', phoneNumber)
    const response = await client.verify.v2.services(serviceSid).verificationChecks.create({
      to:phoneNumber,
     code:otp
    });
    console.log('this is my otp response', response);
    return response;
    
  } catch (error) {
    console.error(error)
    throw new Error('Failed to verify otp')
  }
}
module.exports = {
  sendOtpToPhoneNumber,
  verifyOtp
}