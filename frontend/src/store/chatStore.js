import { create } from "zustand";

export const useChatStore = create((set,get)=>({
  conversations : [],
  currrentConversation:null,
  message:[],
  loading:false,
  error:null,
  onlineUsers:new Map(),
  typingUsers:new Map(),

  // socket event listners setup 
  initsocketListners : () =>{
    const socket = getSocket();
    if(!socket) return;
    // remove exiting listerners to prevent duplicate hnadler 
    socket.off("receive_message")
    socket.off("user_typing")
    socket.off("user_status")
    socket.off("message_send")
    socket.off("message_error")
    socket.off("message_deleted")

    // liten for incoming message 
    socket.on('receive_message',(message)=>{

    });

     socket.on('message_send',(message)=>{
       set((state)=>({
        messages:state.messages.map((msg)=>
          msg._id === message._id ? {...msg} :msg
        )
       }))
    });

    socket.on("message_status_update",({messageId,messageStatus})=>{
      set((state)=>({
        messages:state.messages.map((map)=>
        msg._id=== messageId ? {...msg,messageStatus}:msg)
      }))
    })

      socket.on("reaction_update",({messageId,reactions})=>{
      set((state)=>({
        messages:state.messages.map((map)=>
        msg._id=== messageId ? {...msg,reactions}:msg)
      }))
    })

    // handle delete message from local state 
      socket.on("message_deleted",({deletedMessageId})=>{
      set((state)=>({
        messages:state.messages.filter((map)=>msg._id !== deletedMessageId)
      }))
    })
 
    // handle any message sending error
    socket.on("message_error",(error)=>{
      console.error('message error', error)
    })
;
socket.on("user_typing",({userId,conversationId,isTyping})=>{
  set((state)=>{
    const newTypingUsers = new Map(state.typingUsers)
    if(!newTypingUsers.has(conversationId)){
      newTypingUsers.set(conversationId,new Set())
    }
    const typingSet = newTypingUsers.get(conversationId);
    if(isTyping){
      typingSet.add(userId)
    }else{
      typingSet.delete(userId)
    }
    return {typingUsers:newTypingUsers}
  })
});

// track user online/offline status 
socket.on("user_status",({userId,isOnline,lastSeen})=>{
  set((state)=>{
    const newOnlineUsers = new Map(state.onlineUsers);
    newOnlineUsers.set(userId,{isOnline,lastSeen});
    return {onlineUsers:newOnlineUsers}
  })
})

const {conversations} = get();
if(conversations?.data?.length >0){
 conversations.data?.forEach((conv)=>{
  const otherUser = conv.participants.find(
    (p)=> p._id !== get().currentUser._id 
   )
 })
}


  }
}))