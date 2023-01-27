import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native'
import React, { useRef } from 'react'
import { Chatstate } from '../context/ChatProvider';
import { useState } from 'react';
import * as FileSystem from "expo-file-system" 
import axios from 'axios';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'
import { url } from '../Constants/Urls';
import { getSenderName } from './chatLogic';
import socket from '../context/socket';
import { Image } from '@rneui/themed';
const ChatMessages = ({ fetchedmessages, setFetchedMessages }) => {
  const { selectedchat, user, setFetchAgain } = Chatstate();
  const selectedchatcompare = useRef(null);
  let token
  AsyncStorage.getItem("jsonwebtoken").then((result) => {
    if (result !== null) {
      token = JSON.parse(result)
    }
  })
  const fetchmessage = async () => {
    try {
      const config = {
        headers: {
          Authorization: token,
        },
      };
      if (selectedchat.chat === null) return;
      const { data } = await axios.get(`${url}api/messages/${selectedchat.chat._id}`, config)
      setFetchedMessages(data);
      // setLoading(false)
      // scrolltobottom();
    }
    catch (error) {
      console.error(error)
    }
  }

  const renderfile = async(item) => {
    const fileURI = `${FileSystem.documentDirectory}/${item.content}`
    FileSystem.writeAsStringAsync(fileURI, item.file_data, { encoding: FileSystem.EncodingType.Base64 })
    if(fileURI.includes("file:")) return fileURI
  }
  let logo

  const renderItem = ({ item, index }) => (
    // console.log(renderfile(item)._z)
    <View key={item._id} style={item.type==="message"?item.sender._id === user.user._id ? styles.rightMessage : styles.leftMessage:item.sender._id === user.user._id ? styles.right : styles.left}>
      {item.chat.isGroupChat ? getSenderName(fetchedmessages, index, user) ? <Text style={{ fontWeight: "bold", color: "white" }}>
        {fetchedmessages[index].sender.name}</Text> : null : ""}
      {
      item.type==="message"?
      <Text style={{ color: "white" }}>{item.content}</Text>:
      <View >
        <Image source={{uri: renderfile(item)._z}} containerStyle={{height:200,width:180,background:"blue"}}/>
      </View>
      }
    </View>
  );

  useEffect(() => {
    fetchmessage()
    selectedchatcompare.current = selectedchat;
  }, [])
  useEffect(() => {
    socket.on("recievedMessage", (message) => {
      if (selectedchatcompare.current.chat === null || selectedchatcompare.current.chat._id !== message.chat._id) { return; }
      else {
        setFetchedMessages([...fetchedmessages, message])
      }

    })
  })
  return (
    <View style={styles.wrapper}>
      <FlatList
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 0 }}
        data={fetchedmessages}
        renderItem={renderItem}
        keyExtractor={item => item._id}
      />
    </View>
  )
}
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10
  },
  messages: {
    flex: 1,
  },
  leftMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#303442",
    padding: 7,
    marginVertical: 5,
    borderRadius: 6,
    maxWidth: "50%"
  },
  rightMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#727ACC",
    padding: 7,
    marginVertical: 5,
    borderRadius: 6,
    maxWidth: "50%"
  },
  left: {
    alignSelf: "flex-start",
    marginVertical: 5,
    borderRadius: 6,
    maxWidth: "50%"
  },
  right: {
    alignSelf: "flex-end",
    marginVertical: 5,
    borderRadius: 6,
    maxWidth: "50%"
  }
})
export default ChatMessages