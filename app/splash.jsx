import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Asset } from "expo-asset";

const SPLASH_DURATION_MS = 1800;

export default function SplashScreen() {
    useEffect(() => {
        async function preloadAssets() {
            try {
                await Asset.loadAsync([
                    require("../assets/images/splash-mobile.gif"),
                    require("../assets/images/onboarding.mp4"),
                ]);
            } catch (err) {
                console.log("Error preloading assets:", err);
            }
        }

        preloadAssets();

        const splashTimer = setTimeout(() => {
            router.replace("/(auth)/onboarding");
        }, SPLASH_DURATION_MS);

        return () => clearTimeout(splashTimer);
    }, []);

    return (
        <View className="flex-1 bg-[#4848FF]">
            <StatusBar hidden />
            <Image
                source={require("../assets/images/splash-mobile.gif")}
                style={StyleSheet.absoluteFill}
                contentFit="contain"
            />
        </View>
    );
}
