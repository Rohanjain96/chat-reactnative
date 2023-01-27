import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native'
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Chatstate } from '../../context/ChatProvider'
import { useIsFocused } from '@react-navigation/native'
import { url } from '../../Constants/Urls'
import { Image } from '@rneui/base'

const SplashScreen = ({navigation}) => {
  const [token, setToken] = useState(null)
  const focused = useIsFocused()
  const { setUser } = Chatstate()
  useEffect(() => {
    AsyncStorage.getItem("jsonwebtoken").then((result) => {
      if (result !== null) {
        navigation.navigate("MainScreen")
      }
    })
      .catch((error) => console.error(error))
  }, [])
  useEffect(() => {
    AsyncStorage.getItem("jsonwebtoken").then((result) => {
      if (result !== null) {
        setToken(JSON.parse(result))
        navigation.navigate("MainScreen")
      }
    })
      .catch((error) => console.error(error))
  }, [focused])
  useEffect(() => { if (token !== null) CheckCredentials() }, [token])

  const CheckCredentials = async () => {
    try {
      const config = {
        headers: {
          Authorization: token,
        },
      };
      const { data } = await axios.get(`${url}api/users/checkcookie`, config)
      if (data) {
        setUser({ type: "changeuser", payload: data });
        setToken(null)
        navigation.navigate("MainScreen")
      }
    } catch (error) {
      console.error(error)
    }
  }
  return (
    <View style={styles.wrapper}>
    <Image source={require("../../assets/front.png")} style={{width:250,height:360}} >
    </Image >
      <Text style={styles.bigText}>A new way to connect with your favourite people</Text>
      <Text style={{color:"white"}}>Connect with people around the world </Text>
      <TouchableOpacity onPress={()=>navigation.navigate("Login")} style={styles.button}>
        <Text style={{color:"white"}}>Let's Get Started</Text>
      </TouchableOpacity>
    </View>
  )
}
 const styles = StyleSheet.create({
    wrapper:{
        flex:1,
        justifyContent:"center",
        alignItems: "center",
        backgroundColor:"#282A37"
    },
    bigText:{
        fontSize:25,
        textAlign:"center",
        color:"white"
    },
    button:{
      marginTop:20,
      borderWidth:1,
      borderColor:"grey",
      paddingVertical:10,
      paddingHorizontal:15,
      borderRadius:20,
      marginBottom:70,
      color:"white"
    }

 })
export default SplashScreen