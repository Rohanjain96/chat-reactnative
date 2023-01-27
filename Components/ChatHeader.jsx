import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "@expo/vector-icons/FontAwesome";

import { Chatstate } from "../context/ChatProvider";
import { Avatar } from "@rneui/themed";
// import { Avatar } from "react-native-paper";

const ChatHeader = () => {
	const { selectedchat, user, setSelectedChat } = Chatstate()
	const navigation = useNavigation()
	return (
		<View style={styles.container}>
			<TouchableOpacity style={styles.backButton} onPress={() => {
				setSelectedChat({type:"changechat",payload:null})
				navigation.navigate("MainScreen")
			}
				}>
				<Icon name="angle-left" size={30} color={"white"} />
			</TouchableOpacity>
			<View style={styles.profileOptions}>
				<TouchableOpacity style={styles.profile}>
					<Avatar source={{ uri: selectedchat.chat.chatName === "sender" ? user.user._id === selectedchat.chat.users[0]._id ? selectedchat.chat.users[1].pic : selectedchat.chat.users[0].pic : selectedchat.chat.pic }} rounded
						size={45} onPress={() => navigation.navigate("UserProfile")} />
					<View style={styles.usernameAndOnlineStatus}>
						<Text style={styles.username}>{selectedchat.chat.chatName === "sender" ? user.user.name === selectedchat.chat.users[1].name ?
							selectedchat.chat.users[0].name : selectedchat.chat.users[1].name : selectedchat.chat.chatName}</Text>
					</View>
				</TouchableOpacity>
				<View style={styles.options}>
					<TouchableOpacity style={{ paddingHorizontal: 20 }}>
						<Icon
							name="ellipsis-v"
							size={30}
							color={"white"}
						/>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		backgroundColor: "#323544",
		paddingVertical: 10
	},
	backButton: {
		alignSelf: "center",
		paddingHorizontal: 10,
	},
	profileOptions: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignSelf: "center",
		paddingHorizontal: 10,
	},
	profile: {
		flexDirection: "row",
		alignSelf: "center",
		borderColor: "#fff",
		flex: 4,
	},
	image: {
		height: 45,
		width: 45,
		borderRadius: 32.5,
	},
	usernameAndOnlineStatus: {
		flexDirection: "column",
		justifyContent: "center",
		paddingHorizontal: 10,
	},
	username: {
		color: "white",
		fontSize: 18,
		fontWeight: "bold",
	},
	onlineStatus: {
		color: "white",
		fontSize: 16,
	},
	options: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "flex-end",
		alignSelf: "center",
	},
});

export default ChatHeader;