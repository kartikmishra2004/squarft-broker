import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
  PanResponder,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons, Feather } from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";

const naksha = require("../../assets/images/building_naksha.png");
import { followUpsData } from "../../data/followups";

const { width } = Dimensions.get("window");

const AMENITY_ICONS = {
  Gymnasium: { icon: "dumbbell", color: "#4A43EC" },
  "Swimming Pool": { icon: "pool", color: "#4A43EC" },
  "24/7 Security": { icon: "shield-check-outline", color: "#4A43EC" },
  "Power Backup": { icon: "lightning-bolt", color: "#4A43EC" },
  Landscaping: { icon: "tree-outline", color: "#4A43EC" },
  "Car Parking": { icon: "car-outline", color: "#4A43EC" },
  "Sports Court": { icon: "tennis", color: "#4A43EC" },
  "Wi-Fi Zone": { icon: "wifi", color: "#4A43EC" },
  Clubhouse: { icon: "home-group", color: "#4A43EC" },
  Garden: { icon: "flower-outline", color: "#4A43EC" },
};

function AmenityItem({ label }) {
  const config = AMENITY_ICONS[label] ?? {
    icon: "star-outline",
    color: "#4A43EC",
  };
  return (
    <View className="flex-row items-center gap-2 w-[50%] mb-3">
      <View className="w-8 h-8 rounded-[10px] bg-[#F1F3FF] items-center justify-center">
        <MaterialCommunityIcons
          name={config.icon}
          size={14}
          color={config.color}
        />
      </View>
      <Text className="text-[11px] font-manrope-medium text-[#333] flex-1">
        {label}
      </Text>
    </View>
  );
}

export default function PropertyDetailSheet({
  visible,
  onClose,
  item,
}) {
  const insets = useSafeAreaInsets();
  const [floorPlanVisible, setFloorPlanVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("detail"); // 'detail' or 'followup'
  const translateY = useRef(new Animated.Value(600)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => g.dy > 10,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 80) {
          Animated.timing(translateY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
        tension: 50,
      }).start();
    } else {
      translateY.setValue(600);
    }
  }, [visible]);

  if (!item) return null;

  const amenitiesList = [
    "Gymnasium",
    "Swimming Pool",
    "24/7 Security",
    "Power Backup",
    "Car Parking",
    "Garden"
  ];

  const priceFormatted = `₹${item.price.toLocaleString("en-IN")}/m`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          className="bg-white rounded-t-[28px]"
          style={{ maxHeight: "85%", transform: [{ translateY }] }}
        >
          {/* Handle - swipe target */}
          <View
            {...panResponder.panHandlers}
            className="items-center pt-3 pb-2"
          >
            <View className="w-12 h-1 bg-gray-200 rounded-full" />
            <Text className="text-[16px] font-manrope-bold mt-4 text-[#1A1A1A]">
                {activeTab === "detail" ? "Property detail" : "Follow up"}
            </Text>
          </View>

          {activeTab === "detail" ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            className="mx-4 rounded-[20px] mb-4 border border-gray-50 bg-white"
            contentContainerStyle={{ paddingBottom: 20 }}
            style={{
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.04,
                shadowRadius: 8,
            }}
          >
            {/* Hero Image Section */}
            <View style={{ height: 140, overflow: "hidden", borderRadius: 20 }}>
              <View style={{ flex: 1, flexDirection: "row" }}>
                <Image
                  source={item.image}
                  style={{ flex: 1.4, height: 140 }}
                  resizeMode="cover"
                />
                <View style={{ width: 2, backgroundColor: "#fff" }} />
                <View style={{ flex: 1, height: 140, position: "relative" }}>
                  <Image
                    source={item.image}
                    style={{ width: "100%", height: "100%", opacity: 0.8 }}
                    resizeMode="cover"
                  />
                  <View
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: 6,
                      paddingHorizontal: 6,
                      paddingVertical: 3,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 9, fontWeight: "700" }}>1/8</Text>
                  </View>
                </View>
              </View>

              {/* Verified Badge */}
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#fff",
                  borderRadius: 30,
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  gap: 3,
                  elevation: 4,
                  shadowColor: "#000",
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                }}
              >
                <MaterialCommunityIcons name="check-decagram" size={14} color="#0052CC" />
                <Text style={{ fontSize: 9, fontWeight: "800", color: "#0052CC", letterSpacing: 0.2 }}>VERIFIED</Text>
              </View>

              <TouchableOpacity
                style={{
                  position: "absolute",
                  top: 12,
                  right: 12,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  borderRadius: 15,
                  padding: 6,
                }}
              >
                <Feather name="edit-2" size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Header Details */}
            <View className="flex-row items-center gap-4 mx-5 mt-3 mb-3">
              <Text className="text-[11px] font-manrope-medium text-gray-400">Possession: Immediate</Text>
              <Text className="text-[11px] font-manrope-medium text-gray-400">• Status: {item.status || "Active"}</Text>
            </View>

            <View style={{ marginHorizontal: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: "#F8FAFC", borderStyle: "dashed" }} />

            {/* BHK & Price */}
            <View className="mx-5 mb-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-[9px] font-manrope-bold text-gray-400 mb-0.5 tracking-widest uppercase">{item.category || "Apartment"}</Text>
                  <Text className="text-[15px] font-manrope-extrabold text-[#0F172A]">{item.title}</Text>
                  <Text className="text-[14px] font-manrope-bold text-[#4A43EC] mt-0.5">{priceFormatted}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setFloorPlanVisible(!floorPlanVisible)}
                  className="flex-row items-center gap-1.5 rounded-xl px-3 py-2.5"
                  style={{ backgroundColor: floorPlanVisible ? "#4A43EC" : "#F8F9FF" }}
                >
                  <MaterialCommunityIcons name="floor-plan" size={13} color={floorPlanVisible ? "#fff" : "#4A43EC"} />
                  <Text className="text-[11px] font-manrope-bold" style={{ color: floorPlanVisible ? "#fff" : "#4A43EC" }}>Plan</Text>
                </TouchableOpacity>
              </View>

              {floorPlanVisible && (
                <View className="mt-3 rounded-2xl overflow-hidden bg-[#FBFDFF] items-center py-4 border border-[#EDF2F7]">
                  <Image source={naksha} style={{ width: width * 0.65, height: 140 }} resizeMode="contain" />
                  <Text className="text-[10px] font-manrope-medium text-gray-400 mt-2">{item.beds} BHK · {item.areaSqft || item.area} sq.ft.</Text>
                </View>
              )}
            </View>

            {/* Stats Grid */}
            <View className="flex-row flex-wrap mx-3.5 justify-between mt-2">
              {[
                { label: "AREA", value: `${item.areaSqft || item.area} sqft` },
                { label: "BEDS", value: `${item.beds} Units` },
                { label: "BATHS", value: `${item.baths} Units` },
                { label: "VIEWS", value: item.views || "120+" },
              ].map((stat) => (
                <View
                  key={stat.label}
                  className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-xl p-3 mb-3"
                  style={{ width: (width - 60) / 2 - 6 }}
                >
                  <Text className="text-[9px] font-manrope-bold text-gray-400 tracking-widest mb-0.5">{stat.label}</Text>
                  <Text className="text-[13px] font-manrope-extrabold text-[#0F172A]">{stat.value}</Text>
                </View>
              ))}
            </View>

            {/* Amenities Section */}
            <View className="mx-3.5 bg-white border border-gray-50 rounded-2xl p-4 mt-1">
              <Text className="text-[13px] font-manrope-bold text-[#1A1A1A] mb-4">Amenities</Text>
              <View className="flex-row flex-wrap">
                {amenitiesList.map((a, i) => (
                  <AmenityItem key={i} label={a} />
                ))}
              </View>
            </View>
          </ScrollView>
          ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            className="mx-4 mb-4"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {followUpsData.map((f) => (
                <View key={f.id} className="bg-white border border-gray-100 rounded-[18px] p-4 mb-3" style={{ elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10 }}>
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center gap-2">
                            <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: f.statusBg }}>
                                <Text className="text-[9px] font-manrope-bold" style={{ color: f.statusColor }}>{f.status}</Text>
                            </View>
                            <Text className="text-[10px] font-manrope-bold text-gray-400">{f.unit}</Text>
                        </View>
                    </View>

                    <Text className="text-[14px] font-manrope-extrabold text-[#0F172A]">{f.customerName}</Text>
                    <Text className="text-[10px] font-manrope-medium text-gray-500 mt-0.5">{f.nextEvent}</Text>

                    <View className="h-[1px] bg-gray-50 w-full my-3" />

                    <Text className="text-[9px] font-manrope-bold text-gray-400 uppercase mb-1.5">Sales Officer</Text>
                    <View className="flex-row items-center gap-2.5">
                        <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center border border-gray-100">
                            <Text className="text-[10px] font-manrope-bold text-gray-500">{f.officerInitials}</Text>
                        </View>
                        <Text className="text-[12px] font-manrope-bold text-[#333]">{f.salesOfficer}</Text>
                    </View>
                </View>
            ))}
          </ScrollView>
          )}

          {/* Footer Tabs */}
          <View className="px-5 pt-2.5 pb-8 flex-row gap-2.5 border-t border-gray-50 bg-white">
            <TouchableOpacity
              onPress={() => setActiveTab("detail")}
              className="flex-1 rounded-[14px] py-3.5 items-center justify-center shadow-sm"
              style={{ backgroundColor: activeTab === "detail" ? "#4A43EC" : "#fff", borderWidth: activeTab === "detail" ? 0 : 1, borderColor: "#F1F5F9" }}
            >
              <Text className="text-[13px] font-manrope-bold" style={{ color: activeTab === "detail" ? "#fff" : "#4A43EC" }}>Property Detail</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveTab("followup")}
              className="flex-1 rounded-[14px] py-3.5 items-center justify-center shadow-sm"
              style={{ backgroundColor: activeTab === "followup" ? "#4A43EC" : "#fff", borderWidth: activeTab === "followup" ? 0 : 1, borderColor: "#F1F5F9" }}
            >
              <Text className="text-[13px] font-manrope-bold" style={{ color: activeTab === "followup" ? "#fff" : "#4A43EC" }}>Follow Ups</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
