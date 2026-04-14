import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import SplashArtwork from "../assets/images/onboarding/splash.svg";

export default function SplashScreen() {
    useEffect(() => {
        const timer = setTimeout(() => {
            router.replace("/(auth)/onboarding1");
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.content}>
                <Image
                    source={require("../assets/icons/app-icon.png")}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.artContainer}>
                <SplashArtwork width="100%" height="100%" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#4A43EC",
    },
    content: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
        marginTop: 400,
    },
    logo: {
        width: 220,
        height: 220,
        marginBottom: 12,
    },
    title: {
        color: "#FFFFFF",
        fontSize: 34,
        lineHeight: 40,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    artContainer: {
        width: "100%",
        height: "42%",
        justifyContent: "flex-end",
    },
});
