import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from "@expo/vector-icons/FontAwesome";
import { Chatstate } from '../context/ChatProvider';
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as DocumentPicker from 'expo-document-picker';
import axios from 'axios';
import { url } from '../Constants/Urls';
import socket from '../context/socket';
import EmojiSelector, { Categories } from "react-native-emoji-selector";
import { Fontisto } from '@expo/vector-icons';
import { Entypo } from '@expo/vector-icons';
export default function ChatInput({ fetchedmessages, setFetchedMessages }) {
  const { selectedchat } = Chatstate();
  const [newMessage, setNewMessage] = useState("");
  let token
  const [isOpen, setIsOpen] = useState(false)
  AsyncStorage.getItem("jsonwebtoken").then((result) => {
    if (result !== null) {
      token = JSON.parse(result)
    }
  })
  const sendmessage = async (e) => {
    try {
      const config = {
        headers: {
          Authorization: token,
        },
      };
      if (newMessage.trim().length === 0) return
      setNewMessage(newMessage.trim())
      const message = { content: newMessage, chatId: selectedchat.chat._id }
      setNewMessage("");
      const { data } = await axios.post(`${url}api/messages/sendmessage`, message, config)
      setFetchedMessages([...fetchedmessages, data])
      socket.emit("sendMessage", data)
      // setFetchAgain(true)
      // scrolltobottom()
    } catch (error) {
      console.error(error)
    }
  }

  const choosedocument = async() =>{
    const response = await DocumentPicker.getDocumentAsync({})
    if(response.type === "cancel") return
    try {      
      const formdata = new FormData();
      formdata.append("file", response);
      formdata.append("chatId",selectedchat.chat._id)
      // const { data } = await axios.post(`${url}api/messages/sendfile`, formdata._parts, config)
      const { data } = await axios({method:"post",url:`${url}api/messages/sendfile`, data:formdata, headers:{
        'Authorization': token,
        'Content-Type': "multipart/form-data"
      }})
      setFetchedMessages([...fetchedmessages, data])
      socket.emit("sendMessage", data)
    } catch (error) {
      console.log(error.message)
    }
  }

  return (
    <View style={{
      alignItems: "center",
      justifyContent: "center",
      marginHorizontal: 15,
      height: isOpen ? 400 : 40
    }}>
      <View style={{ display: "flex", flexDirection: "row", marginBottom: 10 }}>
        <View style={styles.input}>
          <TouchableOpacity onPress={() => setIsOpen((prev) => !prev)}>
            <Fontisto name="smiley" size={20} color="black" />
          </TouchableOpacity>
          <TextInput placeholder='Enter you message' value={newMessage} style={{ marginLeft: 10,width:"82%" }} onChangeText={(text) => setNewMessage(text)} />
          {
            newMessage.trim().length === 0?
            <TouchableOpacity onPress={()=>choosedocument()}>
              <Entypo name="attachment" size={20} color="black" />
            </TouchableOpacity>:
            null
          }
        </View>
        <TouchableOpacity style={styles.sendbutton} onPress={() => {
          if (isOpen) setIsOpen(false)
          sendmessage()
        }
        }>
          <Icon
            name="arrow-right"
            size={20}
            color={"white"} />
        </TouchableOpacity>
      </View>
      <EmojiSelector
        category={Categories.symbols}
        onEmojiSelected={emoji => setNewMessage((prev => prev + emoji))}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "grey",
    borderColor: "transparent",
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    paddingLeft: 20,
    flex: 1,
    color: "white"

  },
  sendbutton: {
    backgroundColor: "green",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 80,
    marginLeft: 3
  }
})