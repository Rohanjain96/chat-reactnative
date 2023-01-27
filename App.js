import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Login, Signup, ProfileScreen, ProfileEditScreen, MainScreen, SearchUser,ChatScreen, GroupChatAdd, SplashScreen, UserProfile } from './Screens';
import { Provider as PaperProvider } from 'react-native-paper';
import ChatProvider from "./context/ChatProvider"
import { StatusBar } from 'react-native';
export default function App() {
  const Stack = createNativeStackNavigator();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NavigationContainer>
          <ChatProvider>
            <PaperProvider>
              <StatusBar/>
              <View style={styles.container}>
                <Stack.Navigator initialRouteName='SplashScreen'>
                  <Stack.Screen name="SplashSreen" component={SplashScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
                  <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
                  <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="UserProfile" component={UserProfile} options={{ title: '' }} />
                  <Stack.Screen name="ProfileEditScreen" component={ProfileEditScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="MainScreen" component={MainScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="SearchUser" component={SearchUser} options={{ headerShown: false }} />
                  <Stack.Screen name="ChatScreen" component={ChatScreen} options={{ headerShown: false }} />
                  <Stack.Screen name="GroupChatAdd" component={GroupChatAdd} options={{ headerShown: false }} />
                </Stack.Navigator>

              </View>
            </PaperProvider>
          </ChatProvider>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
