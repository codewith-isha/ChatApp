const dotenv = require('dotenv');
const express= require('express')
const app = express()
const cookieParser = require("cookie-parser")
const cors = require('cors')
const connectDb = require('./config/dbConnect');
const bodyParser = require('body-parser')
const authRoute = require('./routes/authRoute')
const chatRoute = require('./routes/chatRoute')
const intializeSocket = require('./services/socketService')
const  statusRoute = require('./routes/statusRoute')
const http = require('http')
dotenv.config()

const PORT  = process.env.PORT

// database connection 
connectDb()

const corsOption = {
   origin:process.env.FORNTEND_URL,
   credentials:true
}

app.use(cors(corsOption))

app.use(cors())
// middleware 
app.use(express.json())
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}));

// create server 
const server = http.createServer(app)
const io = intializeSocket(server)
app.use((req,res,next)=>{
   req.io = io;
   req.socketUserMap = io.socketUserMap
   next();
})




// Routes 
app.use('/api/auth', authRoute)
app.use('/api/chat',chatRoute)
app.use('/api/status', statusRoute)



server.listen(PORT , ()=>{
   console.log(`PORT is running on http://localhost:${PORT}`)
})




// mongodb+srv://ishasinghwork2025_db_user:whatsapp@cluster0.yt6yk1t.mongodb.net/?appName=Cluster0