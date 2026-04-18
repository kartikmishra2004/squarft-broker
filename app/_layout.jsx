import { Stack } from "expo-router";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
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
import {
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
} from "@expo-google-fonts/manrope";
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
        'Lato-Regular': Lato_400Regular,
        'Lato-Bold': Lato_700Bold,
        'Lato-Light': Lato_300Light,
        'Lato-Black': Lato_900Black,
        Roboto_400Regular,
        Roboto_500Medium,
        Roboto_700Bold,
        Roboto_300Light,
        'Manrope-Regular': Manrope_400Regular,
        'Manrope-Medium': Manrope_500Medium,
        'Manrope-SemiBold': Manrope_600SemiBold,
        'Manrope-Bold': Manrope_700Bold,
        'Manrope-ExtraBold': Manrope_800ExtraBold,
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
                <BottomSheetModalProvider>
                    <Stack>
                        <Stack.Screen name="index" options={{ headerShown: false }} />
                        <Stack.Screen name="splash" options={{ headerShown: false, animation: "none" }} />
                        <Stack.Screen name="(auth)" options={{ headerShown: false, animation: "none" }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: "none" }} />
                        <Stack.Screen name="(screens)" options={{ headerShown: false }} />
                    </Stack>
                </BottomSheetModalProvider>
            </GestureHandlerRootView>
        </Provider>
    );
}