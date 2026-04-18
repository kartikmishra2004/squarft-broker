import { useState, useMemo } from "react";
import { Image, Pressable, ScrollView, StatusBar, Text, View, Platform, Dimensions } from "react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { propertiesByRoomType } from "../../data/listingData";

const amenities = [
  { label: "Area", value: "1200sqft" },
  { label: "Type", value: "Modern" },
  { label: "Furnishing", value: "Furnished" },
  { label: "Built year", value: "2014" },
];

export default function PropertyDetail() {
  const { id } = useLocalSearchParams();

  // Find the property across all room types
  const item = useMemo(() => {
    for (const type in propertiesByRoomType) {
      const found = propertiesByRoomType[type].find(p => p.id === id);
      if (found) return found;
    }
    return null;
  }, [id]);

  const [facilitiesOpen, setFacilitiesOpen] = useState(false);
  const [restrictionOpen, setRestrictionOpen] = useState(false);
  const [interiorOpen, setInteriorOpen] = useState(false);

  if (!item) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-5">
        <Stack.Screen options={{ headerShown: false }} />
        <Text className="text-gray-500 font-lato-bold mb-4">Property not found</Text>
        <Pressable onPress={() => router.back()} className="px-6 py-2 bg-[#4A43EC] rounded-xl">
          <Text className="text-white font-lato-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const thumbs = [item.image, item.image, item.image, item.image];

  return (
    <View className="flex-1 bg-white">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pb-3 mb-5 bg-white"
        style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 14 : 56 }}
      >
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text className="text-[17px] font-bold text-gray-900">Property detail</Text>
        <Pressable hitSlop={10}>
          <Feather name="edit" size={22} color="#111827" />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Images card — full width, shadow bottom */}
        <View
          className="bg-white px-7 pt-3.5 pb-2 rounded-b-[30px]"
          style={{
            elevation: 10,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.05,
            shadowRadius: 5,
            zIndex: 10
          }}
        >
          {/* Main image */}
          <Image
            source={item.image}
            className="w-full rounded-[22px]"
            style={{ height: 180 }}
            resizeMode="cover"
          />

          {/* For Rent badge */}
          <View className="absolute top-6 right-10 bg-indigo-600 rounded-full px-3.5 py-1.5 flex-row items-center gap-1.5">
            <Ionicons name="home-outline" size={13} color="#fff" />
            <Text className="text-white text-[12px] font-semibold">For Rent</Text>
          </View>

          {/* Thumbnails */}
          <View className="flex-row gap-2.5 mx-3 mt-3">
            {thumbs.map((src, i) => (
              <View key={i} className="flex-1 rounded-xl overflow-hidden">
                <Image source={src} className="w-full" style={{ height: 62 }} resizeMode="cover" />
                {i === 3 && (
                  <View className="absolute inset-0 bg-black/45 items-center justify-center">
                    <Text className="text-white font-bold text-[15px]">+4</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Title + Price */}
          <View className="flex-row items-start justify-between mx-2 mt-4">
            <View className="flex-1 mr-3">
              <Text className="text-[16px] font-bold mb-1.5 text-gray-900">{item.title}</Text>
              <Text className="text-[11px] font-bold italic left-2 text-gray-500">{item.location}</Text>
            </View>
            <Text className="text-[18px] font-extrabold text-indigo-600">₹{item.price}</Text>
          </View>

          {/* Stats */}
          <View className="flex-row items-center justify-end -top-4 gap-3.5 mx-1">
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name="floor-plan" size={15} color="#FE8A71" />
              <Text className="text-[12px] text-gray-500">{item.areaSqft}(sqft)</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed-outline" size={15} color="#FE8A71" />
              <Text className="text-[12px] text-gray-500">{item.beds}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name="shower" size={15} color="#FE8A71" />
              <Text className="text-[12px] text-gray-500">{item.baths}</Text>
            </View>
          </View>
        </View>

        {/* Amenities */}
        <View className="px-5 mt-8 mb-3">
          <Text className="text-[15.5px] font-bold text-gray-800 mb-3.5">Amenities</Text>
          <View className="flex-row gap-3">
            {[
              { label: "Area", value: `${item.areaSqft}sqft` },
              { label: "Type", value: item.category },
              { label: "Furnishing", value: item.facility },
              { label: "Built year", value: "2014" },
            ].map((a) => (
              <View key={a.label} className="flex-1 bg-[#EBF1FF] rounded-2xl py-6 items-center">
                <Text className="text-[11px] text-gray-500 mb-1.5">{a.label}</Text>
                <Text className="text-[12px] font-semibold text-gray-900" numberOfLines={1}>{a.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Accordions */}
        {[
          { label: "Facilities", open: facilitiesOpen, toggle: () => setFacilitiesOpen(!facilitiesOpen), content: "Swimming Pool, Gym, Parking, 24/7 Security, Power Backup" },
          { label: "Restriction", open: restrictionOpen, toggle: () => setRestrictionOpen(!restrictionOpen), content: "No Pets, No Smoking, No Parties" },
          { label: "Interior Details", open: interiorOpen, toggle: () => setInteriorOpen(!interiorOpen), content: "Modular Kitchen, Wooden Flooring, False Ceiling, AC in all rooms" },
        ].map((sec) => (
          <View key={sec.label} className="mx-5 mt-1.5">

            <Pressable onPress={sec.toggle} className="flex-row items-center mt-2 mb-2 justify-between">
              <Text className="text-[15.5px] font-bold text-gray-800">{sec.label}</Text>
              <Ionicons name={sec.open ? "chevron-up" : "chevron-down"} size={20} color="#374151" />
            </Pressable>
            {sec.open && (
              <Text className="text-[13px] text-gray-500 mt-2.5 leading-5">{sec.content}</Text>
            )}
          </View>
        ))}

        {/* Map tabs */}

        <View className="px-5 mt-5">
          <View className="flex-row gap-2.5 mb-3.5">
            <Pressable
              className="px-5 py-2 rounded-xl items-center bg-[#FE8A71]"
            >
              <Text className="text-[13px] font-semibold text-white">Location Map</Text>
            </Pressable>
          </View>
          {/* Map placeholder */}
          <View className="h-[200px] rounded-[18px] overflow-hidden bg-gray-200">
            <View className="absolute inset-0 items-center justify-center">
              <Ionicons name="map-outline" size={48} color="#9CA3AF" />
              <Text className="text-gray-500 mt-1.5 text-[13px]">Map View</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
