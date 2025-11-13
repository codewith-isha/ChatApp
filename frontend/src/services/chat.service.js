import {io} from 'socket.io-client';
import useUserStore from '../store/useUserStore';
// import { disconnect } from 'mongoose';
let socket = null;

export const intializeSocket = ()=>{
  if(socket) return socket;
  const user = useUserStore.getState().user;
  const BACKEND_URL = process.env.VITE_API_URL;
  socket = io (BACKEND_URL,{
    withCredentials:true,
    transports:['websocket',"polling"],
    reconnectionAttempts:5,
    reconnectionDelay:1000,
  });
  //connection events 
  socket.on("connect" , () =>{
    console.log('socket connected', socket.id)
    socket.emit("user_connected", user._id)
  })

  socket.on('connect_error',(error)=>{
    console.error('socket connection error',error)
  })
  // disconnect
    socket.on("disconnect" , (reason) =>{
    console.log('socket disconnected', reason)
  
  })
  return socket;
}


export const getSocket = () =>{
  if(!socket){
    return intializeSocket()
  }
  return socket;
}

export const disconnectSocket =()=>{
  if(socket){
    socket.disconnect();
    socket = null;
  }
}