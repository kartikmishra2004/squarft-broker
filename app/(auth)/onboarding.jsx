import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const onboardingVideo = require("../../assets/images/onboarding.mp4");

export default function Onboarding() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const player = useVideoPlayer(onboardingVideo, (player) => {
        player.loop = false;
        player.muted = false;
        player.volume = 1.0;
        player.play();
    });

    const handleNext = () => {
        player.pause();
        router.replace("/login");
    };

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" hidden />
            
            <VideoView
                style={StyleSheet.absoluteFill}
                player={player}
                nativeControls={false}
                contentFit="contain"
            />

            {/* Next Button Overlay */}
            <View 
                style={{ bottom: Math.max(insets.bottom, 24), right: 24 }}
                className="absolute z-50"
            >
                <TouchableOpacity 
                    onPress={handleNext}
                    activeOpacity={0.8}
                    className="bg-[#4848FF] px-6 py-2.5 rounded-full shadow-lg flex-row items-center justify-center"
                >
                    <Text className="text-white text-[14px] font-bold tracking-widest">
                        NEXT
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
