const twillo = require('twilio');

// twillo Credential 

const accountSid = process.env.TWILLO_ACCOUNT_SID
const serviceSid = process.env.TWILLO_SERVICE_SID
const authToken= process.env.AUTH_TOKEN

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
    console.error(error)
    throw new Error('Failed to sent otp')
  }
}