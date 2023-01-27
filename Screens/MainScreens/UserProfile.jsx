import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Avatar, Button, Image, Input } from '@rneui/themed'
import axios from 'axios'
import { Chatstate } from '../../context/ChatProvider'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Entypo } from '@expo/vector-icons'
import { url } from '../../Constants/Urls'
import { Chip, Modal, Portal } from 'react-native-paper'

export default function UserProfile({ navigation }) {
    const [search, setSearch] = useState("");
    const [searchedusers, setSearchedUsers] = useState([]);
    const { selectedchat, user, setSelectedChat } = Chatstate()
    const [selectedUsers, setSelectedUsers] = useState([])
    const [visible, setVisible] = React.useState(false);
    const [editbutton, setEditButton] = useState(false);
    const [newGroupname, setNewGroupName] = useState("");
    const [addUsers, setAddUsers] = useState([])
    const containerStyle = { backgroundColor: 'white', padding: 20 };
    let token

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);
    const updateSearch = (search) => {
        setSearch(search);
    };

    const setuser = () => {
        setSelectedUsers([...selectedchat.chat.users]);
    }

    useEffect(() => {
        setuser()
    }, [selectedchat])
    AsyncStorage.getItem("jsonwebtoken").then((result) => {
        if (result !== null) {
            token = JSON.parse(result)
        }
    })
        .catch((error) => console.error(error))
    const handleGroupname = async () => {
        try {
            const config = {
                headers: {
                    Authorization: token,
                },
            };
            const { data } = await axios.patch(`${url}api/chats/renamegroup`, { chatId: selectedchat.chat._id, chatName: newGroupname }, config);
            setEditButton(false);
            setNewGroupName("");
            setSelectedChat({ type: "changechat", payload: { ...data } });
        } catch (error) {
            console.error(error)
        }
        setEditButton(false);
    }

    const handlegroup = (user) => {
        if (!addUsers.find((c) => {
            return c._id === user._id
        }))
            if (!selectedUsers.find((c) => {
                return c._id === user._id
            }))
                setSelectedUsers([...selectedUsers, user])
        setAddUsers([...addUsers, user])
    }
    const renderItem = ({ item }) => (
        // console.log(item.latestMessage)
        <View style={styles.usercard}>
            <Avatar source={{ uri: item.pic }} rounded
                size={45} />
            <View style={styles.userdetail}>
                <View style={{ display: "flex", flexDirection: "row", width: "92%" }}>
                    <Text style={styles.userName}>{item.name}</Text>
                    {selectedchat.chat.groupAdmin._id === item._id ? <Text style={{
                        borderColor: "green", borderWidth: 1, padding: 2,
                        textAlign: "center", marginLeft: "auto", borderRadius: 5, fontSize: 10
                    }}>Admin</Text> : null}
                </View>
                <Text>{item.phonenumber}</Text>
            </View>
        </View>
    );
    const renderUser = ({ item }) => (
        <TouchableOpacity style={styles.usercard} onPress={() => handlegroup(item)}>
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
            if(selectedchat.chat.blockedusers.length>0){
                let users = data.filter((user)=>{
                    return !selectedchat.chat.blockedusers.includes(user._id)
                })
                setSearchedUsers(users);
                setSearch("");
            }
            else{        
                setSearchedUsers(data);
                setSearch("");
            }
        } catch (error) {
            console.error(error)
        }
    }
    const updatechat = async () => {
        try {
            const config = {
                headers: {
                    Authorization: token,
                },
            };
            const { data } = await axios.patch(`${url}api/chats/addToGroup`, { chatId: selectedchat.chat._id, users: JSON.stringify(addUsers.map((user) => user._id)) }, config);
            setSelectedChat({ type: "changechat", payload: data });
            socket.emit("addedToGroupChat", data, user)
            setSearch("");
            setAddUsers([])
            setVisible(false)
        } catch (error) {
            console.log(error)
        }
    }

    const removeuser = async (user) => {
        try {
            const config = {
                headers: {
                    Authorization: token,
                },
            };
            const { data } = await axios.patch(`${url}api/chats/removeFromGroup`, { chatId: selectedchat.chat._id, userId: user._id }, config);
            if (data === "undefined" || data === null) {
                selectedUsers.splice(selectedUsers.indexOf(user), 1);
                setSelectedUsers([...selectedUsers]);
                addUsers.splice(addUsers.indexOf(user), 1);
                setAddUsers([...addUsers]);
                return;
            }
            setSelectedChat({ type: "changechat", payload: data });
            selectedUsers.splice(selectedUsers.indexOf(user), 1);
            setSelectedUsers([...selectedUsers]);
            addUsers.splice(addUsers.indexOf(user), 1);
            setAddUsers([...addUsers]);

        } catch (error) {
            console.log(error);
        }
    }
    return (
        <View style={styles.container}>
            <Portal>
                <Modal visible={visible} onDismiss={hideModal} contentContainerStyle={containerStyle}>
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
                    <View style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                        {
                            selectedUsers.map((user, index) => {
                                if(selectedchat.chat.groupAdmin._id !== user._id)
                                    return <Chip avatar={<Image source={{ uri: user.pic }}
                                        style={{ width: 25, height: 25, resizeMode: 'contain' }} />}
                                        style={styles.chip}
                                        key={index}
                                        onClose={() => removeuser(user)}>
                                        {user.name}
                                    </Chip>
                                    else
                                    return <Chip avatar={<Image source={{ uri: user.pic }}
                                        style={{ width: 25, height: 25, resizeMode: 'contain' }} />}
                                        style={styles.chip}
                                        key={index}
                                        >
                                        {user.name}
                                    </Chip>

                            })
                        }
                    </View>
                    <View>
                        <FlatList
                            data={searchedusers}
                            renderItem={renderUser}
                            keyExtractor={item => item._id}
                        />
                    </View>
                    <Button onPress={() => updatechat()}>Add users</Button>
                </Modal>
            </Portal>
            {
                selectedchat.chat.isGroupChat === false ?
                    <ScrollView>
                        <View style={styles.profile}>
                            <Avatar source={{ uri: selectedchat.chat.chatName === "sender" ? user.user._id === selectedchat.chat.users[0]._id ? selectedchat.chat.users[1].pic : selectedchat.chat.users[0].pic : selectedchat.chat.pic }} rounded size={150}></Avatar>
                            <Text style={{ fontSize: 30, marginBottom: 20 }}>{selectedchat.chat.chatName === "sender" ? user.user.name === selectedchat.chat.users[1].name ?
                                selectedchat.chat.users[0].name : selectedchat.chat.users[1].name : selectedchat.chat.chatName}</Text>
                        </View>
                        <View style={styles.profileItems}>
                            <View style={styles.profileItem}>
                                <Text style={styles.profileItemLabel}>Username</Text>
                                <Text style={styles.profileItemText}>{selectedchat.chat.chatName === "sender" ? user.user.name === selectedchat.chat.users[1].name ?
                                    selectedchat.chat.users[0].name : selectedchat.chat.users[1].name : selectedchat.chat.chatName}</Text>
                            </View>
                            <View style={styles.profileItem}>
                                <Text style={styles.profileItemLabel}>Email</Text>
                                <Text style={styles.profileItemText}>{user.user.name === selectedchat.chat.users[1].name ?
                                    selectedchat.chat.users[0].email : selectedchat.chat.users[1].email}</Text>
                            </View>
                            <View style={styles.profileItem}>
                                <Text style={styles.profileItemLabel}>Phone Number</Text>
                                <Text style={styles.profileItemText}>{user.user.name === selectedchat.chat.users[1].name ?
                                    selectedchat.chat.users[0].phonenumber : selectedchat.chat.users[1].phonenumber}</Text>
                            </View>
                            <View style={styles.profileItem}>
                                <Text style={styles.profileItemLabel}>Date-of-birth</Text>
                                <Text style={styles.profileItemText}>{user.user.name === selectedchat.chat.users[1].name ?
                                    selectedchat.chat.users[0].dateofbirth : selectedchat.chat.users[1].dateofbirth}</Text>
                            </View>
                            <View style={styles.profileItem}>
                                <Text style={styles.profileItemLabel}>Profession</Text>
                                <Text style={styles.profileItemText}>{user.user.name === selectedchat.chat.users[1].name ?
                                    selectedchat.chat.users[0].designation : selectedchat.chat.users[1].designation}</Text>
                            </View>
                        </View>
                    </ScrollView> :
                    <FlatList
                        ListHeaderComponent={
                            <View style={styles.upperbox}>
                                <Avatar source={{ uri: selectedchat.chat.chatName === "sender" ? user.user._id === selectedchat.chat.users[0]._id ? selectedchat.chat.users[1].pic : selectedchat.chat.users[0].pic : selectedchat.chat.pic }} rounded size={150}></Avatar>
                                {
                                    editbutton ?
                                        <View style={{ flexDirection: "column", width: "100%" }}>
                                            <View style={styles.groupnameinput}>
                                                <Input value={newGroupname} containerStyle={{ width: "80%" }}
                                                    placeholder="Enter new Group Name" onChangeText={(name) => { setNewGroupName(name) }} />
                                                <TouchableOpacity onPress={() => {
                                                    if (newGroupname.trim().length > 0) {
                                                        handleGroupname()
                                                    }
                                                    else {
                                                        setEditButton(false)
                                                    }
                                                }
                                                }>
                                                    <Text style={{ borderWidth: 1, borderColor: "grey", padding: 5, textAlign: "center", borderRadius: 20 }}>Update</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        :
                                        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}>
                                            <Text style={{ fontSize: 30, marginRight: 10 }} > {selectedchat.chat.chatName}</Text>
                                            <TouchableOpacity onPress={() => setEditButton(true)}>
                                                <Entypo name="edit" size={24} color="black" />
                                            </TouchableOpacity>
                                        </View>
                                }
                            </View>
                        }
                        data={selectedchat.chat.users}
                        renderItem={renderItem}
                        keyExtractor={item => item._id}

                        ListFooterComponent={
                            <View style={{ padding: 20, backgroundColor: "white", marginTop: 20 }}>
                                <TouchableOpacity style={{
                                    display: selectedchat.chat.groupAdmin.id === user.id ? "flex" : "none",
                                    backgroundColor: "green", marginBottom: 10
                                }} onPress={showModal} >
                                    <Text style={{ textAlign: "center", padding: 10 }}>Add or Remove participants</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={{ backgroundColor: "red" }}>
                                    <Text style={{ textAlign: "center", padding: 10 }}>Leave Group</Text>
                                </TouchableOpacity>
                            </View>
                        }

                    />
            }
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#EDF2F7",
        padding: 20,
        paddingBottom: 0,
        flex: 1
    },
    Breadcrumb: {
        padding: 20,
        backgroundColor: 'white',
        letterSpacing: 1,
        fontWeight: "400",
        flexDirection: "row"
    },
    profile: {
        marginTop: 20,
        paddingTop: 10,
        alignItems: "center",
        backgroundColor: 'white'
    },
    profileItems: {
        backgroundColor: 'white',
        marginTop: 20,
        padding: 20,
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
        // alignItems:"center",
        padding: 10,
        marginBottom: 10
    },
    input: {
        width: "85%",
        marginLeft: 15,
    },
    userDetails: {
        marginLeft: 10,
    },
    profileItem: {
        marginTop: 15,
        borderBottomWidth: 1,
        borderBottomColor: "gray",
    },
    profileItemLabel: {
        fontSize: 18,
        fontWeight: "600",
        letterSpacing: 0.5
    },
    profileItemText: {
        fontSize: 16,
        marginBottom: 15,
        color: "grey",
    },
    groupnameinput: {
        marginTop: 15,
        flexDirection: "row",
        width: "90%",
        marginLeft: "auto",
        marginRight: "auto",
        alignItems: "center"
    },
    lowerbox: {
        marginTop: 20,
        paddingTop: 10,
        backgroundColor: 'white'
    },
    upperbox: {
        marginTop: 20,
        paddingVertical: 20,
        marginBottom: 20,
        alignItems: "center",
        backgroundColor: 'white'
    },
    usercard: {
        flexDirection: "row",
        padding: 10,
        alignItems: "center",
        backgroundColor: "white"
    },
    userdetail: {
        marginLeft: 10,
        flexDirection: "column"
    }
})