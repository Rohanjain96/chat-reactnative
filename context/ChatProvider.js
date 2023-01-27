// import React, { createContext, useContext, useReducer, useState } from 'react'

import { createContext, useContext, useReducer, useState } from "react"

const isstate= {
  chat:null
}
const userstate= {
  user:{}
}

const chatstate = {
  chats:[]
}
const reducer = (state,action)=>{
  switch(action.type){
    case "changechat":
    return {
      chat:action.payload
    }
    default:
      return state;
  }
}
const userreducer = (state,action)=>{
  switch(action.type){
    case "changeuser":
      Object.assign(state.user,action.payload)
    default:
      return state;
  }
}

const chatreducer = (state,action)=>{
  switch(action.type){
    case "changechats":
    return {
      chats:action.payload
    }
    default:
      return state;
  }
}
const ChatContext = createContext();
const ChatProvider = ({children}) => {
    const [selectedchat, dispatch] = useReducer(reducer, isstate )
    const [chats,chatdispatch] = useReducer(chatreducer, chatstate)
    const [user,userdispatch] = useReducer(userreducer, userstate)
    const [fetchagain,setFetchAgain] = useState(false)
  return (
    <>
        <ChatContext.Provider value={{selectedchat,setSelectedChat:dispatch, user,setUser:userdispatch ,chats,setChats:chatdispatch,fetchagain,
          setFetchAgain}}>
            {children}
        </ChatContext.Provider>
    </>
  )
}
export const Chatstate = () =>{return useContext(ChatContext)}
export default ChatProvider