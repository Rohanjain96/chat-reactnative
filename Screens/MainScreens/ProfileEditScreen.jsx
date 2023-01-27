import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Avatar, Button } from '@rneui/themed'
import * as DocumentPicker from 'expo-document-picker';
import { Chatstate } from '../../context/ChatProvider';
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { url } from '../../Constants/Urls';
export default function ProfileEditScreen({ navigation }) {
    const { user, setUser } = Chatstate()
    const [form, setForm] = useState({
        ...user.user
    })
    const [picUrl, setPicUrl] = useState(user.user.pic)
    let token
    AsyncStorage.getItem("jsonwebtoken").then((result) => {
        if (result !== null) {
            token = JSON.parse(result)
        }
    })
        .catch((error) => console.error(error))
    const uploadImage = async (file) => {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "Chat-app");
        data.append("cloud_name", "rohan-jain");
        fetch("https://api.cloudinary.com/v1_1/rohan-jain/image/upload", {
            method: "post",
            body: data,
        })
            .then((res) => { return res.json() }
            )
            .then(async (data) => {
                try {
                    const config = {
                        headers: {
                            Authorization: token,
                        },
                    };
                    const userdata = await axios.patch(`${url}api/users/changePicture`, { picture: data.url.toString() }, config)
                    setPicUrl(data.url.toString())
                    setUser({ type: "changeuser", payload: userdata.data });
                } catch (error) {
                    console.error(error);
                }
            })
            .catch((err) => {
                console.error("error", err)
            });
    }
    const handleDocumentSelection = useCallback(async () => {
        try {
            const response = await DocumentPicker.getDocumentAsync({})
            if(response.type === "cancel") return
            const uri = response.uri;
            const type = response.mimeType;
            const name = response.uri.split(".")[1];
            const source = { uri, type, name }
            uploadImage(source)
        } catch (err) {
            console.warn(err);
        }
    }, []);
    const updatedetails = async () => {
        try {
            const config = {
                headers: {
                    Authorization: token,
                },
            };
            const userdata = await axios.patch(`${url}api/users/updateDetail`, form, config)
            setUser({ type: "changeuser", payload: userdata.data });

            navigation.navigate("ProfileScreen")
        } catch (error) {
            console.log(error)
        }
    }

    const resetForm = () => {
        setForm({
            ...user.user
        })
    }
    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.Breadcrumb}>
                    <TouchableOpacity onPress={() => navigation.navigate("MainScreen")}>
                        <Text style={{ fontSize: 20, color: "blue" }}>Home </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
                        <Text style={{ fontSize: 20, color: "blue" }}>/ Profile </Text>
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20 }}>/ Edit Details</Text>
                </View>
                <View style={styles.profile}>
                    <View style={styles.image}>
                        <Avatar source={{ uri: picUrl, cache: "false" }} size={150}></Avatar>
                    </View>
                    <View style={{ flexDirection: "row" }}>
                        <Button
                            buttonStyle={{ backgroundColor: 'blue', marginTop: 10, marginBottom: 10 }}
                            onPress={() => handleDocumentSelection()}>Choose Picture</Button>
                    </View>
                </View>
                <View style={styles.form}>
                    <Text style={styles.heading}>Update your profile</Text>
                    <View style={styles.forminput}>
                        <Text style={styles.label}>Username</Text>
                        <TextInput value={form.name} style={styles.input}
                            onChangeText={(text) => setForm({ ...form, name: text })}
                            placeholder={"Enter your name"} ></TextInput>
                    </View>
                    <View style={styles.forminput}>
                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput editable={false} value={form.phonenumber.toString()} style={styles.input} ></TextInput>
                    </View>
                    <View style={styles.forminput}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput value={form.email} onChangeText={(text) => setForm({ ...form, email: text })}
                            style={styles.input}
                            placeholder={"Enter your email"} ></TextInput>
                    </View>
                    <View style={styles.forminput}>
                        <Text style={styles.label}>Date-of-birth</Text>
                        <TextInput value={form.dateofbirth} onChangeText={(text) => setForm({ ...form, dateofbirth: text })}
                            placeholder={"Enter your date of birth"}
                            style={styles.input} ></TextInput>
                    </View>
                    <View style={styles.forminput}>
                        <Text style={styles.label}>Profession</Text>
                        <TextInput value={form.designation} onChangeText={(text) => setForm({ ...form, designation: text })}
                            placeholder={"Enter your designation"}
                            style={styles.input} ></TextInput>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "center" }}>
                        <Button
                            onPress={() => updatedetails()}
                            buttonStyle={{ backgroundColor: 'green', marginTop: 10, marginBottom: 10, marginRight: 10, paddingHorizontal: 20 }}>
                            Update
                        </Button>
                        <Button
                            onPress={() => resetForm()}
                            buttonStyle={{ backgroundColor: 'red', marginTop: 10, marginBottom: 10, paddingHorizontal: 30 }}>
                            Reset
                        </Button>
                    </View>
                </View>
            </ScrollView>
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
    image: {
        position: "relative",
        backgroundColor: "blue"
    },
    imagetext: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "40%",
        paddingVertical: 10,
        backgroundColor: "red",
        color: 'white',
        textAlign: 'center',
        opacity: 0.4
    },
    form: {
        marginTop: 20,
        backgroundColor: 'white',
        padding: 20,
        marginBottom: 20
    },
    heading: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15
    },
    label: {
        fontWeight: "700",
        fontSize: 16
    },
    input: {
        borderColor: "grey",
        borderWidth: 1,
        borderRadius: 5,
        marginVertical: 10,
        paddingVertical: 5,
        paddingHorizontal: 15,
        fontWeight: "400",
        fontSize: 15
    }
})