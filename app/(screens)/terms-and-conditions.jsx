import { View, Text, Pressable, StatusBar, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function TermsAndConditions() {
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

      <Text className="text-[20px] text-black font-manrope-extrabold mb-1">
        Term and conditions
      </Text>
      
      <Text className="text-[10px] text-gray-400 font-manrope-medium italic mb-8">
        Last Update 20 Apr 2025
      </Text>
    </View>
  );
}
