import { View, Text, Pressable, StatusBar, Platform, ScrollView } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, Stack } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { markAllAsWatched, markAsWatched } from "../../store/slices/notificationSlice";

export default function Notifications() {
  const router = useRouter();
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.notifications?.list || []);

  useEffect(() => {
     // Optional: Mark all as watched when entering the screen
     // dispatch(markAllAsWatched());
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'customer':
        return (
          <View className="w-12 h-12 rounded-full bg-[#FFF3D6] items-center justify-center">
            <MaterialCommunityIcons name="account-search" size={24} color="#FFB800" />
          </View>
        );
      case 'success':
        return (
          <View className="w-12 h-12 rounded-full bg-[#E8EAFD] items-center justify-center">
            <Ionicons name="checkmark-circle" size={28} color="#4A43EC" />
          </View>
        );
      case 'error':
        return (
          <View className="w-12 h-12 rounded-full bg-[#FEEBF0] items-center justify-center">
            <Ionicons name="close-circle" size={28} color="#FF3B30" />
          </View>
        );
      case 'love':
        return (
          <View className="w-12 h-12 rounded-full bg-[#FFEBEE] items-center justify-center">
            <Ionicons name="heart" size={24} color="#FF3B30" />
          </View>
        );
      default:
        return (
            <View className="w-12 h-12 rounded-full bg-[#EBF1FF] items-center justify-center">
              <Ionicons name="notifications" size={24} color="#4A43EC" />
            </View>
          );
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="dark-content" />

      <View
        className="flex-row items-center justify-between px-5 pb-3 mt-2"
        style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 8 : 45 }}
      >
        <Pressable onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={22} color="black" />
        </Pressable>
        <Text className="text-[16px] text-black font-lato-bold mr-8">Notifications</Text>
        <View />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}
      >
        {notifications.map((item) => (
          <Pressable
            key={item.id}
            className="flex-row mb-6 relative"
            onPress={() => dispatch(markAsWatched(item.id))}
          >
            {getIcon(item.type)}
            <View className="ml-4 flex-1">
              <Text className={`text-[15px] ${item.watched ? 'text-gray-700' : 'text-black'} font-manrope-bold mb-1`}>
                {item.title}
              </Text>
              <Text className="text-[13px] text-gray-400 font-manrope-medium leading-5">
                {item.description}
              </Text>
              <Text className="text-[10px] text-gray-400 font-manrope-medium italic self-end mt-1">
                {item.time}
              </Text>
            </View>
            {!item.watched && (
              <View className="absolute top-0 right-0 w-2 h-2 bg-[#4A43EC] rounded-full" />
            )}
          </Pressable>
        ))}
        {notifications.length === 0 && (
            <View className="flex-1 items-center justify-center mt-20">
                <Text className="text-gray-400 font-lato-regular">No notifications yet</Text>
            </View>
        )}
      </ScrollView>
    </View>
  );
}
