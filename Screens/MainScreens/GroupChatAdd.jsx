import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, SafeAreaView, Image } from 'react-native'
import React, { useState } from 'react'
import { Button } from '@rneui/themed'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chatstate } from '../../context/ChatProvider';
import { Avatar } from '@rneui/base';
import axios from 'axios';
import { Chip } from 'react-native-paper';
import { url } from '../../Constants/Urls';
import socket from '../../context/socket';

const GroupChatAdd = ({ navigation }) => {
    const [search, setSearch] = useState("");
    const [name, setName] = useState("");
    const { setChats, chats, setSelectedChat,selectedchat,user } = Chatstate();
    const [searchedusers, setSearchedUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([])
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
    const updateName = (input) => {
        setName(input);
    };
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
    const createchat = async () => {
        try {
            const config = {
                headers: {
                    Authorization: token,
                },
            };
            const groupdata = {
                userIds: JSON.stringify(selectedUsers.map((user) => user._id)),
                groupname: name
            }

            const { data } = await axios.post(`${url}api/chats/creategroup`, groupdata, config);
            if (!chats.chats.find((c) => {
                return c._id === data._id
            }))
            socket.emit("createdGroupChat",data,user)
                setChats({ type: "changechats", payload: [data, ...chats.chats] });
            setSelectedChat({ type: "changechat", payload: data });
            setSearch("");
            setName("")
            setSelectedUsers([])
            setSearchedUsers([]);
            socket.emit("joinchat", selectedchat._id)
            navigation.navigate("ChatScreen")
        } catch (error) {
            console.error(error)
        }
    }

    const handlegroup = (user) => {
        if (!selectedUsers.find((c) => {
            return c._id === user._id
        }))
            setSelectedUsers([...selectedUsers, user])
    }

    const removeuser = (user) => {
        selectedUsers.splice(selectedUsers.indexOf(user), 1);
        setSelectedUsers([...selectedUsers]);
    }
    const renderItem = ({ item }) => (
        <TouchableOpacity style={styles.usercard} onPress={() => handlegroup(item)}>
            <Avatar source={{ uri: item.pic }} rounded size={45} />
            <View style={styles.userDetails}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userPhoneNumber}>{item.phonenumber}</Text>
            </View>
        </TouchableOpacity>
    );
    return (
        <View style={styles.wrapper}>
            <View style={styles.Breadcrumb}>
                <TouchableOpacity onPress={() => navigation.navigate("MainScreen")}>
                    <Text style={{ fontSize: 20, color: "blue" }}>Home </Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 20 }}>/ Create Group Chat</Text>
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
            <View style={selectedUsers.length > 0 ? styles.participants : { display: "none" }}>
                <View style={styles.searchbar}>
                    <TextInput
                        placeholder='Enter the name of group'
                        onChangeText={(input) => updateName(input)}
                        value={name}
                        style={styles.input}>
                    </TextInput>
                    <Button
                        buttonStyle={{ padding: 5, paddingHorizontal: 0 }}
                        icon={{
                            name: 'arrow-right',
                            type: 'font-awesome',
                            size: 20,
                            color: 'white',
                        }}
                        type="clear"
                        onPress={() => createchat()}
                    ></Button>
                </View>
                {
                    selectedUsers.map((user, index) => {
                        return (
                            <Chip avatar={<Image source={{ uri: user.pic }}
                                style={{ width: 25, height: 25, resizeMode: 'contain' }} />}
                                style={styles.chip}
                                key={index}
                                onClose={() => removeuser(user)}>
                                {user.name}
                            </Chip>)
                    })
                }
            </View>
            <SafeAreaView style={styles.userlist}>
                <FlatList
                    data={searchedusers}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                />
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        padding: 20,
        flex: 1
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
    chip: {
        padding: 5,
        marginRight: 10,
        marginVertical: 10,
        justifyContent: "center",
    },
    searchbar: {
        flexDirection: "row",
        borderColor: "grey",
        borderWidth: 1,
        borderRadius: 50,
        width: "100%",
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
    userlist: {
        flex: 1,
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
    },
    participants: {
        flexDirection: "row",
        flexWrap: "wrap"
    },
    participant: {
        marginRight: 5,
        marginBottom: 10
    }
})
export default GroupChatAdd