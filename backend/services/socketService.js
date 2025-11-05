const {Server} = require('socket.io');
const User = require('../models/User')
const Message = require('../models/Message')
// Map to store Online users -> userId , socketId
const onlineUsers = new Map();
const typingUser = new Map();
const intializeSocket = (server) =>{
  const io = new Server (server,{
    cors:{
      origin:process.env.FORNTEND_URL,
      credentials:true,
      methods:['GET',"POST","PUT","DELETE","OPTIONS"],
    },
    pingTimeout:60000,   //DISCONNECT inactive user or sockets after 60s
  });
//when a new socket connection is establised
  io.on('connection',(socket)=>{
    console.log(`User connected : ${socket.id}`)
    let userId = null;
    // handle user connection and mark them online in db
    socket.on('user_connected', async(connectingUserId) =>{
      try {
        userId = connectingUserId
        onlineUsers.set(userId,socket.id)
        socket.join(userId) //join a personal room for direct emits
        await User.findByIdAndUpdate(userId , {
          isOnline:true,
          lastSeen:new Date(),
        });
        // notify all users that this user is now online
        io.emit('user_status',{userId,isOnline:true})
      } catch (error) {
        console.error(`Error handling user connection ${error}`)
      }
    }) 
    // return online status of requested user 
    socket.on('get_user_status',(requestedUserId,callback)=>{
      const isOnline = onlineUsers.has(requestedUserId)
      callback({
        userId:requestedUserId,
        isOnline,
        lastSeen:isOnline ? new Date():null,
      })
    })
    // forward message to receiver if online
    socket.on('send_message',async(message)=>{
      try {
        const receiverSocketId = onlineUsers.get(message.receiver?._id)
        if(receiverSocketId){
          io.to(receiverSocketId).emit("receive_message",message)
        }
      } catch (error) {
        console.log('Error sending message socket',error)
        socket.emit('message_error',{error:"Failed to send message"})
      }
    })
      // update message as read and notify sender 
      socket.on('message_read',async({messageIds,senderId})=>{
        try {
          await Message.updateMany(
            {_id:{$in:messageIds}},
            {$set:{messageStatus:"read"}}
          )
          const senderSocketId = onlineUsers.get(senderId)
          if(senderSocketId){
            messageIds.forEach(())
          }
        } catch (error) {
        }
      })
  })
}