import { useState, useMemo } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSelector } from "react-redux";
import { categoriesData, upcomingProjectsData } from "../../data/properties";

const { width } = Dimensions.get("window");

const stats = [
  { label: "Total Visitor", count: 123 },
  { label: "Total Sale", count: 45 },
  { label: "Pending", count: 34 },
  { label: "Rejected", count: 14 },
];

const mainTabs = ["SELL"];
const buyFilter = "BUY";


export default function Home() {
  const [activeFilter, setActiveFilter] = useState("SELL");
  const unwatchedCount = useSelector(state => state.notifications?.list?.filter(n => !n.watched).length || 0);

  const categories = useMemo(() => {
    return categoriesData[activeFilter] || [];
  }, [activeFilter]);


  const projects = useMemo(() => {
    return upcomingProjectsData;
  }, []);

  const handleFilterPress = (filter) => {
    if (filter === "BUY") {
      router.push("/customer-requirement");
    } else {
      setActiveFilter(filter);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 200 }} bounces={false}>
        <View
          style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 70 }}
          className="bg-[#4A43EC] px-6 pb-[80px]"
        >
          <View className="flex-row justify-between items-center">
            <View className="flex-row items-center gap-3">
              <Image
                src="https://plus.unsplash.com/premium_photo-1689568126014-06fea9d5d341?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                className="w-14 h-14 rounded-full border border-white"
              />
              <View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-white text-lg font-lato-bold">
                    Manas Gangrade
                  </Text>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="#3AFF08"
                  />
                </View>
                <Text className="text-xs text-white/70 mt-0.5">Mon, Feb 20, 2025</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-3">
              <Pressable 
                className="p-1"
                onPress={() => router.push("/(screens)/wallet")}
              >
                <MaterialCommunityIcons name="wallet-outline" size={24} color="white" />
              </Pressable>
              <Pressable
                className="p-1 relative"
                onPress={() => router.push("/notifications")}
              >
                <Ionicons name="notifications" size={24} color="white" />
                {unwatchedCount > 0 ? (
                  <View className="absolute top-0 right-0 bg-[#FF3B30] min-w-[14px] h-[14px] rounded-full items-center justify-center border border-white">
                    <Text className="text-white text-[8px] font-manrope-bold">{unwatchedCount}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
          </View>
        </View>

        {/* White Stats Card */}
        <View
          className="bg-white rounded-[30px] p-[16px] -mt-16 mx-[10px] shadow-lg shadow-black/10"
          style={{ elevation: 8 }}
        >
          <View className="flex-row justify-between gap-3 mb-5">
            {stats.map((s, i) => (
              <View key={i} className="flex-1 bg-[#F4F7FF] rounded-xl py-3 items-center justify-center">
                <Text className="text-base text-[#1a1a1a] font-lato-bold">
                  {s.count}
                </Text>
                <Text className="text-[9px] mt-1 text-gray-500 text-center font-lato-semibold">
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row gap-3">
            {mainTabs.map((f) => {
              const isActive = activeFilter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => handleFilterPress(f)}
                  className={`flex-1 h-10 rounded-xl justify-center items-center border ${isActive ? 'bg-[#4A43EC] border-[#4A43EC]' : 'bg-white border-[#F0F0F0]'}`}
                >
                  <Text className={`text-[13px] font-lato-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {f}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              key={buyFilter}
              onPress={() => handleFilterPress(buyFilter)}
              className="flex-1 h-10 bg-white rounded-xl justify-center items-center border border-[#F0F0F0]"
            >
              <Text className="text-[13px] text-gray-500 font-lato-bold">
                {buyFilter}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="px-[10px] pt-[15px]">
          {/* Hero Banner */}

          <Pressable className="w-full h-[170px] rounded-[20px] overflow-hidden mb-6">
            <Image
              source={require("../../assets/images/home/hero.png")}
              className="w-full h-full"
              resizeMode="stretch"
            />
          </Pressable>

          {/* Categories Grid */}
          <View className="flex-row flex-wrap justify-between mb-[30px] px-2">
            {categories.map((cat, index) => (
              <Pressable
                key={index}
                style={{ width: (width - 80) / 3, height: (width - 80) / 3, marginBottom: 15 }}
                onPress={() => {
                  if (cat.id === "house" || cat.id === "flats") {
                    router.push("/property-type");
                  } else {
                    router.push({ pathname: "/property-type", params: { typeId: cat.id } });
                  }
                }}
                className="bg-[#F4F7FF] rounded-[18px] items-center justify-center"
              >


                <View className="justify-center items-center mb-3">
                  <Image 
                    source={cat.image} 
                    style={{ width: 28, height: 28 }} 
                    resizeMode="contain" 
                  />
                </View>
                <Text className="text-[12px] text-gray-700 font-lato-bold tracking-[0.5px] uppercase">
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Upcoming Projects Header */}
          <View className="mb-4">
            <Text className="text-base text-black font-lato-bold tracking-[0.5px]">
              OUR UPCOMING PROJECT
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {projects.map((project, index) => (
              <View
                key={project.id}
                className="w-[290px] flex-row bg-[#F4F7FF] rounded-lg overflow-hidden mr-[15px] h-[110px]"
              >
                <Image source={project.image} className="w-[35%] h-full" resizeMode="cover" />
                <View className="flex-1 p-2.5 justify-center border-2 border-[#4A43EC] border-l-0 rounded-r-lg">
                  <Text className="text-sm text-black font-lato-bold mb-0.5" numberOfLines={1}>
                    {project.title}
                  </Text>
                  <Text className="text-[10px] text-gray-400 font-lato-regular mb-1">
                    {project.developer}
                  </Text>
                  <Text className="text-[9px] text-gray-500 font-lato-regular mb-2 leading-3">
                    {project.description}
                  </Text>
                  <Text className="text-sm text-black font-lato-bold">
                    {project.price}
                  </Text>
                </View>
              </View>
            ))}
            {projects.length === 0 && (
              <View
                style={{ width: width - 40 }}
                className="h-[110px] justify-center items-center bg-[#F9FAFB] rounded-lg border border-dashed border-gray-300"
              >
                <Text className="text-gray-400 font-lato-regular">No projects found for this category</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
}