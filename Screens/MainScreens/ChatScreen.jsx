import { View, Text, StyleSheet, ImageBackground } from 'react-native'
import React, { useState } from 'react'
import ChatHeader from '../../Components/ChatHeader';
import ChatInput from '../../Components/ChatInput';
import ChatMessages from '../../Components/ChatMessages';
import { Chatstate } from '../../context/ChatProvider';
import socket from '../../context/socket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { url } from '../../Constants/Urls';
import { Button } from '@rneui/themed';

const ChatScreen = () => {
  let token
  AsyncStorage.getItem("jsonwebtoken").then((result) => {
    if (result !== null) {
      token = JSON.parse(result)
    }
  })
    .catch((error) => console.error(error))
  const [fetchedmessages, setFetchedMessages] = useState([])
  const { selectedchat, setSelectedChat, user } = Chatstate()
  const sendResponse = async (response, chat) => {
    try {
      if (response === "no") {
        const config = {
          headers: {
            Authorization: token,
          },
        };
        const { data } = await axios.patch(`${url}api/chats/changeChatStatus`, { chatId: selectedchat.chat._id, status: "blocked" }, config);
        setSelectedChat({ type: "changechat", payload: data });
        socket.emit("sendResponse", user, data)
      }
      else if (response === "yes") {
        const config = {
          headers: {
            Authorization: token,
          },
        };
        const { data } = await axios.patch(`${url}api/chats/changeChatStatus`, { chatId: selectedchat.chat._id, status: "started" }, config);
        setSelectedChat({ type: "changechat", payload: data });
        socket.emit("sendResponse", user, data)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const ispending = () => {
    const result = selectedchat.chat.pendingusers?.includes(user.user._id)
    return result
  }
  const isblocked = () => {
    const result = selectedchat.chat.blockedusers?.includes(user.user._id)
    return result
  }

  socket.on("recievedResponse", (data) => {
    if (selectedchat && selectedchat.chat._id === data._id) {
      setSelectedChat({ type: "changechat", payload: data })
    }
  })

  const acceptrequest = async () => {
    try {
      const config = {
        headers: {
          Authorization: token,
        },
      };
      const { data } = await axios.patch(`${url}api/chats/acceptGroupRequest`, { chatId: selectedchat.chat._id, user: user.user._id, config });
      setSelectedChat({ type: "changechat", payload: data });
      socket.emit("acceptGroupRequest", data, user)
    } catch (error) {
      console.log(error)
    }
  }
  const rejectrequest = async () => {
    try {
      const config = {
        headers: {
          Authorization: token,
        },
      };
      const { data } = await axios.patch(`${url}api/chats/rejectGroupRequest`, { chatId: selectedchat.chat._id, user: user.user._id, config });
      setSelectedChat({ type: "changechat", payload: data });
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <View style={styles.wrapper}>
      {/* component for showing header */}
      <ChatHeader />
      {
        //checking for groupchat status and show message on the based of status
        selectedchat.chat.isGroupChat ?
          // if status is pending then show this message for group chat
          ispending() ?
            <ImageBackground source={{ uri: "https://i.pinimg.com/originals/20/99/f2/2099f2dda704cb708fe20347afb964ba.jpg" }} style={styles.messagewrapper}>
              <View style={{ display: "flex", flexDirection: "column" }}>
                <Text style={{ fontSize: 18, color: "white" }}>{`Do you want to join ${selectedchat.chat.chatName} `}</Text>
                <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                  <Button containerStyle={{ marginRight: 15, width: 100 }} color="success" onPress={() => acceptrequest()}>Yes</Button>
                  <Button containerStyle={{ marginRight: 15, width: 100 }} color="error" onPress={() => rejectrequest()}>No</Button>
                </View>
              </View>
            </ImageBackground>
            :
            // if status is blocked then show this message for group chat
            isblocked() ?
              <ImageBackground source={{ uri: "https://i.pinimg.com/originals/20/99/f2/2099f2dda704cb708fe20347afb964ba.jpg" }} style={styles.messagewrapper}>
                <Text style={{ fontSize: 18 }}>This chat is blocked</Text>
              </ImageBackground>
              :
              // if status is started then show  messages for group chat
              <ImageBackground source={{ uri: "https://i.pinimg.com/originals/20/99/f2/2099f2dda704cb708fe20347afb964ba.jpg" }} style={styles.chatwrapper}>
                <ChatMessages fetchedmessages={fetchedmessages} setFetchedMessages={setFetchedMessages} />
                <ChatInput fetchedmessages={fetchedmessages} setFetchedMessages={setFetchedMessages} />
              </ImageBackground>
          :
          //checking for single chat status and show message on the based of status
          selectedchat.chat.chatStatus === "pending" ?
            //  checking if the chat status is pending and showing message on the based of startBy
            selectedchat.chat.startBy !== user.user._id ?
              <ImageBackground source={{ uri: "https://i.pinimg.com/originals/20/99/f2/2099f2dda704cb708fe20347afb964ba.jpg" }} style={styles.messagewrapper}>
                <View style={{ display: "flex", flexDirection: "column" }}>
                  <Text style={{ fontSize: 18, color: "white" }}>{`Do you want to start chat with ${user.user.name === selectedchat
                    .chat.users[1].name ? selectedchat.chat.users[0].name : selectedchat.chat.users[1].name} `}</Text>
                  <View style={{ display: "flex", flexDirection: "row", justifyContent: "center", marginTop: 10 }}>
                    <Button containerStyle={{ marginRight: 15, width: 100 }} color="success" onPress={() => sendResponse("yes")}>Yes
                    </Button>
                    <Button containerStyle={{ marginRight: 15, width: 100 }} color="error" onPress={() => sendResponse("no")}>No
                    </Button>
                  </View>
                </View>
              </ImageBackground> :
              //  checking if the chat status is pending and the chat is started by ourself then we show this
              <ImageBackground source={{ uri: "https://i.pinimg.com/originals/20/99/f2/2099f2dda704cb708fe20347afb964ba.jpg" }} style={styles.messagewrapper}>
                <Text style={{ fontSize: 18, color: "white" }}>Waiting for other user to accept request</Text>
              </ImageBackground>
            // if the chat status is blocked then show this
            : selectedchat.chat.chatStatus === "blocked" ?
              <ImageBackground source={{ uri: "https://i.pinimg.com/originals/20/99/f2/2099f2dda704cb708fe20347afb964ba.jpg" }} style={styles.messagewrapper}>
                <Text style={{ fontSize: 18, color: "white" }}>This chat is blocked</Text>
              </ImageBackground>
              :
              // show this when chat is started
              <ImageBackground source={{ uri: "https://i.pinimg.com/originals/20/99/f2/2099f2dda704cb708fe20347afb964ba.jpg" }} style={styles.chatwrapper}>
                <ChatMessages fetchedmessages={fetchedmessages} setFetchedMessages={setFetchedMessages} />
                <ChatInput fetchedmessages={fetchedmessages} setFetchedMessages={setFetchedMessages} />
              </ImageBackground>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  chatwrapper: {
    flex: 1,
    paddingBottom: 10
  },
  messagewrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: "center"
  }
})

export default ChatScreen