import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Button } from '@rneui/themed'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chatstate } from '../../context/ChatProvider';
import { Avatar } from '@rneui/base';
import axios from 'axios';
import { url } from '../../Constants/Urls';
import socket from '../../context/socket';

const SearchUser = ({ navigation }) => {
    const [search, setSearch] = useState("");
    const { setChats, chats, setSelectedChat, selectedchat,user } = Chatstate();
    const [searchedusers, setSearchedUsers] = useState([]);
    let token
    AsyncStorage.getItem("jsonwebtoken").then((result) => {
        if (result !== null) {
            token = JSON.parse(result)
        }
    })
        .catch((error) => console.error(error))
    const updateSearch = (search) => {
        setSearch(search);
    };
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.usercard} onPress={() => createchat(item._id)}>
            <Avatar source={{ uri: item.pic }} rounded
                size={45} />
            <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userPhoneNumber}>{item.phonenumber}</Text>
            </View>
        </TouchableOpacity>
    );
    const searchuser = async () => {
        try {
            const config = {
                headers: {
                    Authorization: token,
                },
            };
            const { data } = await axios.get(`${url}api/users/allusers?search=${search}`, config)
            setSearchedUsers(data);
            setSearch("");
        } catch (error) {
            console.error(error)
        }
    }
    const createchat = async (userId) => {
        try {
            const config = {
                headers: {
                    Authorization: token,
                },
            };
            const { data } = await axios.post(`${url}api/chats/`, { userId }, config);
            if (!chats.chats.find((c) => {
                return c._id === data._id
            }))
                setChats({ type: "changechats", payload: [data, ...chats.chats] });
            setSelectedChat({ type: "changechat", payload: data });
            socket.emit("createdChat",data,user)
            socket.emit("joinchat", selectedchat._id)
            navigation.navigate("ChatScreen")

        } catch (error) {
            console.error(error)
        }
    }
    return (
        <View style={styles.wrapper}>
            <View style={styles.Breadcrumb}>
                <TouchableOpacity onPress={() => navigation.navigate("MainScreen")}>
                    <Text style={{ fontSize: 20, color: "blue" }}>Home </Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 20 }}>/ Search User</Text>
            </View>
            <View style={styles.searchbar}>
                <TextInput
                    placeholder='Enter the name of person you want to find..'
                    onChangeText={(input) => updateSearch(input)}
                    value={search}
                    style={styles.input}>
                </TextInput>
                <Button
                    buttonStyle={{ padding: 5, paddingHorizontal: 0 }}
                    icon={{
                        name: 'search',
                        type: 'font-awesome',
                        size: 20,
                        color: 'white',
                    }}
                    type="clear"
                    onPress={() => searchuser()}
                ></Button>
            </View>
            <View>
                <FlatList
                    data={searchedusers}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        padding: 20,
    },
    Breadcrumb: {
        padding: 10,
        paddingHorizontal: 20,
        backgroundColor: 'white',
        letterSpacing: 1,
        fontWeight: "400",
        flexDirection: "row",
        marginBottom: 20

    },
    searchbar: {
        flexDirection: "row",
        borderColor: "grey",
        borderWidth: 1,
        borderRadius: 50,
        // alignItems:"center",
        padding: 10,
        marginBottom: 10
    },
    input: {
        width: "85%",
        marginLeft: 15,
    },
    usercard: {
        marginVertical: 10,
        flexDirection: 'row',
        borderColor: 'grey',
        borderWidth: 1,
        borderRadius: 7,
        padding: 10,
        paddingLeft: 20
    },
    userDetails: {
        marginLeft: 10,
    },
    userName: {
        fontSize: 20,
        letterSpacing: 1
    },
    userPhoneNumber: {
        letterSpacing: 1
    }
})
export default SearchUser