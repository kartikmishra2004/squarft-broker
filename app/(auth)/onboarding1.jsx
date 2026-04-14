import { Text, View, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link } from 'expo-router';

export default function Onboarding1() {
    return (
        <View className="flex-1 bg-white">
            <StatusBar style="dark" />
            <View className="absolute top-16 right-5 z-10">
                <Link href="/login">
                    <View className="bg-[#4A43EC] px-5 py-1.5 rounded-full">
                        <Text className="text-white text-[15px] font-light">Skip</Text>
                    </View>
                </Link>
            </View>
            <View className="pt-32 px-7">
                <Text className="text-[18px] text-black/60 font-normal mb-2.5">
                    Smarter Way to Sell Your Property
                </Text>
                <Text className="text-[32px] text-black font-bold mb-4 tracking-tight">
                    Smarter Search
                </Text>
                <Text className="text-[15px] text-black/40 font-normal leading-6 mb-7">
                    Find the right buyers with intelligent search, and connect.
                </Text>
                <View className="flex-row items-center mb-8">
                    <View className="w-12 h-[5px] rounded-l-full rounded-r-full bg-[#4A43EC]" />
                    <View className="w-12 h-[5px] bg-[#D0CFEF]" />
                    <View className="w-12 h-[5px] rounded-r-full bg-[#D0CFEF]" />
                </View>
                <Link href="/onboarding2">
                    <View className="bg-[#4A43EC] rounded-2xl py-5 items-center w-[55%]">
                        <Text className="text-white text-[16px] font-semibold tracking-widest">
                            NEXT
                        </Text>
                    </View>
                </Link>
            </View>
            <View className="absolute bottom-0 left-0 right-0 px-4 pb-4 h-[48%]">
                <View className="flex-1 w-full overflow-hidden rounded-[34px] bg-white border border-white/70 shadow-2xl shadow-black/10">
                    <Image
                        source={require("../../assets/images/onboarding/onboarding1.gif")}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </View>
            </View>
        </View>
    );
}