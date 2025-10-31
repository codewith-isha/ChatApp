// const { default: mongoose } = require('mongoose')
const mongoose = require('mongoose')

const connectDb = async()=>{
  try {
    await mongoose.connect(process.env.MONGOURI,{
      useNewUrlParser:true,
      useUnifiedTopology:true
    })
    console.log(`Database connected successfully !!`)
  } catch (error) {
    console.log(`error :${error}`)
  }
}
module.exports = connectDb
// jdsd