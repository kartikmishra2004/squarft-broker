import { View, Text, Pressable, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function ContactUs() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-white px-6">
      <StatusBar barStyle="dark-content" />
      
      <Pressable 
        onPress={() => router.back()} 
        className="mt-16 mb-4"
        style={{ paddingTop: Platform.OS === "android" ? 10 : 0 }}
      >
        <Ionicons name="arrow-back-outline" size={24} color="black" />
      </Pressable>

      <Text className="text-[20px] text-black font-manrope-extrabold mb-6">
        Contact Us
      </Text>

      <Pressable className="bg-[#4A43EC] rounded-lg py-3 flex-row items-center justify-center gap-2 border border-gray-200">
        <Ionicons name="call-outline" size={18} color="white" />
        <Text className="text-white text-[14px] font-manrope-bold">Contact Us</Text>
      </Pressable>
    </View>
  );
}
