import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import * as NavigationBar from "expo-navigation-bar";
import { Provider } from 'react-redux';
import "../global.css";
import { store } from '../store/store';
import {
    useFonts,
    Lato_400Regular,
    Lato_700Bold,
    Lato_300Light,
    Lato_900Black,
} from "@expo-google-fonts/lato";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_300Light,
} from "@expo-google-fonts/roboto";

SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {
    const [fontsLoaded] = useFonts({
        Lato_400Regular,
        Lato_700Bold,
        Lato_300Light,
        Lato_900Black,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold,
        Roboto_300Light,
    });

    useEffect(() => {
        if (Platform.OS !== "android") return;

        NavigationBar.setBackgroundColorAsync("#ffffff").catch(() => { });
        NavigationBar.setButtonStyleAsync("dark").catch(() => { });
    }, []);

    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <Provider store={store}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <Stack>
                    <Stack.Screen name="index" options={{ headerShown: false }} />
                    <Stack.Screen name="splash" options={{ headerShown: false, animation: "none" }} />
                    <Stack.Screen name="(auth)" options={{ headerShown: false, animation: "none" }} />
                    <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "none" }} />
                    <Stack.Screen name="(screens)" options={{ headerShown: false }} />
                </Stack>
            </GestureHandlerRootView>
        </Provider>
    );
}