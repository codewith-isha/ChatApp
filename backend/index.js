const express= require('express')
const app = express()
const cookieParser = require("cookie-parser")
const cors = require('cors')
const dotenv = require('dotenv');
const connectDb = require('./config/dbConnect');
const bodyParser = require('body-parser')
const authRoute = require('./routes/authRoute')
dotenv.config()

const PORT  = process.env.PORT
// middleware 
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}));


// database connection 
connectDb()



// Routes 
app.use('/api/auth', authRoute)


app.listen(PORT , ()=>{
   console.log(`PORT is running on http://localhost:${PORT}`)
})




// mongodb+srv://ishasinghwork2025_db_user:whatsapp@cluster0.yt6yk1t.mongodb.net/?appName=Cluster0