import { View, StyleSheet, TouchableOpacity, FlatList, Text } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Chatstate } from '../../context/ChatProvider'
import { Avatar } from '@rneui/themed'
import { Menu } from 'react-native-paper'
import { Entypo } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useIsFocused } from '@react-navigation/native'
import { url } from '../../Constants/Urls'
import socket from '../../context/socket'
import { usePreventScreenCapture } from 'expo-screen-capture';

const MainScreen = ({ navigation }) => {
  
  const { user, chats, setChats, setSelectedChat,selectedchat } = Chatstate()
  const [visible, setVisible] = useState(false);
  const focused = useIsFocused() 

  const openMenu = () => setVisible(true);

  const closeMenu = () => setVisible(false);
  let token
  const fetch = () => {
    AsyncStorage.getItem("jsonwebtoken").then((result) => {
      if (result !== null) {
        token = JSON.parse(result)
        fetchchats()
      }
    })
      .catch((error) => console.error(error))
  }
  const fetchchats = async () => {
    try {
      const config = {
        headers: {
          Authorization: token,
        },
      };
      const { data } = await axios.get(`${url}api/chats/fetchchats`, config);
      if (data) {
        setChats({ type: "changechats", payload: [...data] });
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  useEffect(()=>{
    fetch()
  },[focused])

  useEffect(() => {
    socket.emit("setup", user.user._id)
  }, [user.user._id]);

  // This function will render all the chats we had created
  const renderItem = ({ item }) => (
    <View style={styles.usercard}>
      <TouchableOpacity>
      <Avatar source={{ uri: item.chatName === "sender" ? user.user._id === item.users[0]._id? item.users[1].pic: item.users[0].pic: item.pic }} rounded
        size={45} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.userDetails}
        onPress={() => {
          setSelectedChat({ type: "changechat", payload: item });
          socket.emit("joinchat", item._id)
          navigation.navigate("ChatScreen")
        }}>
        <Text style={styles.userName}>{item.chatName === "sender" ? user.user.name === item.users[1].name ?
          item.users[0].name : item.users[1].name : item.chatName}</Text>
          {            
          item.latestMessage?
        <View style={styles.latestMessageBox}>
          <Text style={styles.name}>{item.latestMessage.sender.name !== user.user.name ? item.latestMessage.sender.name : "You"}: </Text>
          <Text style={styles.latestMessage} numberOfLines={1} >{item.latestMessage?item.latestMessage.content:item.content}</Text>
        </View>:""
          }
      </TouchableOpacity>
    </View>
  );

  useEffect(() => {
    // If a message is recieved then this will check that a person had already opened the chat otherwise it will be shown as notification
    socket.off("recievedMessage").on("recievedMessage", (message) => {
      if(chats.chats.find((chat)=> chat._id === message.chat._id) !== undefined){
        chats.chats.find((chat)=> chat._id === message.chat._id).latestMessage = message;
        if(selectedchat.chat===null||selectedchat.chat._id !== message.chat._id)
        chats.chats.find((chat) => { return chat._id === message.chat._id }).notificationcount += 1
        setChats({ type: "changechats", payload: chats.chats })
      }
    })

    // When something in the chat happens this will update the chat
    socket.off("updateChat").on("updateChat",(data)=>{
      if(data){
        const existdata = chats.chats.includes((chat)=>chat._id === data._id)
        let updatedChats
        if(existdata){
          updatedChats = chats.chats.map((chat)=>{
            if(chat._id === data._id) return data
            else return chat
          })
        }
        else updatedChats = [data,...chats.chats]
        setChats({ type: "changechats", payload: updatedChats })
        if(selectedchat&&selectedchat._id===data._id) setSelectedChat({type: "changechat", payload: data })
      }
    })
  })

  // This function is used to not allow for screenshots
  usePreventScreenCapture();
  return (
    // This is header for main screen
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Avatar source={{ uri: user.user.pic }} cache={false} rounded size={40}></Avatar>
        </TouchableOpacity>
        <View style={styles.buttons}>
          <TouchableOpacity>
            <Entypo name='message' size={20} color="white" onPress={() => navigation.navigate("SearchUser")} />
          </TouchableOpacity>
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={<Entypo name="dots-three-vertical" size={20} color="white" onPress={openMenu} />}>
            <Menu.Item onPress={() => {
              navigation.navigate("GroupChatAdd")
              closeMenu()
            }} title="Create group chat" />
            <Menu.Item onPress={() => {
              AsyncStorage.removeItem("jsonwebtoken").then(() => navigation.navigate("Login")).catch((error) => { console.error(error) })
            }} title="Logout" />
          </Menu>
        </View>
      </View>

     {/* Showing all chats */}
      {
        chats.chats.length>0?
      <SafeAreaView style={styles.userlist}>
        <FlatList
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20, paddingTop: 0 }}
          data={chats.chats}
          renderItem={renderItem}
          keyExtractor={item => item._id}
        />
      </SafeAreaView>
      :
      // Message which will be shown when the user has no chats
      <SafeAreaView style={styles.nochat}>
        <Text style={{fontSize:28,marginBottom:10,color:"white"}}>Welcome to our application</Text>
        <Text style={{fontSize:18,color:"white"}}>Create chats by clicking message icon</Text>
      </SafeAreaView>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#282A37"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    paddingLeft: 20,
    backgroundColor: "#202C33",
    alignItems: "center",
    zIndex: 2
  },
  buttons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 60
  },
  usercard: {
    marginTop: 15,
    flexDirection: 'row',
    padding: 10,
    paddingLeft: 15,
    marginHorizontal: 15,
    backgroundColor: "#323640",
    borderRadius:10
  },
  userlist: {
    backgroundColor:"#202C33",
    flex: 1,
  },
  userDetails: {
    marginLeft: 20,
    width:"80%",
  },
  userName: {
    fontSize: 17,
    // letterSpacing: 1,
    fontWeight: "bold",
    color: "white"
  },
  userPhoneNumber: {
    letterSpacing: 1
  },
  name:{
    alignSelf:"flex-start",
    fontWeight: "bold",
    color:"white"
  },
  latestMessageBox:{
    flexDirection:"row"
  },
  latestMessage:{
    alignSelf:"flex-start",
    color:"white",
    width:"50%"
  },
  nochat:{
    fontSize:18,
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"#202C33",
    flex: 1,
    paddingHorizontal: 10
  }
})

export default MainScreen