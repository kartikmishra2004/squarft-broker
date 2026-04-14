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

SplashScreen.preventAutoHideAsync();

export default function AuthLayout() {
    const [fontsLoaded] = useFonts({
        Lato_400Regular,
        Lato_700Bold,
        Lato_300Light,
        Lato_900Black,
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
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="splash" options={{ headerShown: false, animation: "none" }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false, animation: "none" }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "none" }} />
            </Stack>
        </Provider>
    );
}