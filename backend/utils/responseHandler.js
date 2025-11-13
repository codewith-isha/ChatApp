const response = (res, statusCode, message , data = null)=>{
  if(!res){
    console.log('Response object is null')
    return;
  }
  const responseObject = {
    status:statusCode>=400 ?"error":"success",
    message,
    data
  }
  return res.status(statusCode).json(responseObject)
}

module.exports = response