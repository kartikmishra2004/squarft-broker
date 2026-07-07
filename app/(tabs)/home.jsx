import { useState, useMemo, useEffect } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSelector, useDispatch } from "react-redux";
import { fetchBrokerStats, fetchMyProjects } from "../../store/slices/brokerSlice";
import { fetchUserProfile } from "../../store/slices/authSlice";
import { fetchShortlistedProperties } from "../../store/slices/propertySlice";

const { width } = Dimensions.get("window");

const mainTabs = ["SELL"];
const buyFilter = "Customer Requirement";

const formatIndianEarningAmount = (amount) => {
  const numericAmount = Number(amount);

  if (amount === null || amount === undefined || !Number.isFinite(numericAmount)) {
    return "0";
  }

  if (numericAmount <= 0) return "0";

  if (numericAmount >= 10000000) {
    return `${(numericAmount / 10000000).toFixed(numericAmount % 10000000 === 0 ? 0 : 1)} Cr`;
  }

  if (numericAmount >= 100000) {
    return `${(numericAmount / 100000).toFixed(numericAmount % 100000 === 0 ? 0 : 1)} Lakh`;
  }

  return numericAmount.toLocaleString("en-IN");
};

const propertyCategories = [
  {
    id: "residential",
    label: "Residential",
    image: require("../../assets/icons/property-types/House2.png"),
    cloudImage: require("../../assets/icons/property-types/Clouds.png"),
    subTypes: [
      { id: "plot", label: "Plot", image: require("../../assets/icons/property-types/plot.png") },
      { id: "villa", label: "Villa", image: require("../../assets/icons/property-types/villa.png") },
      { id: "apartment", label: "Apartment", image: require("../../assets/icons/property-types/apartment.png") },
      { id: "rowhouse", label: "Rowhouse", image: require("../../assets/icons/property-types/rowhouse.png") },
    ]
  },
  {
    id: "commercial",
    label: "Commercial",
    image: require("../../assets/icons/property-types/commercial.png"),
    subTypes: [
      { id: "shop", label: "Shop", image: require("../../assets/icons/property-types/Shop.png") },
      { id: "showroom", label: "Showroom", image: require("../../assets/icons/property-types/showroom.png") },
      { id: "office", label: "Office", image: require("../../assets/icons/property-types/office.png") },
    ]
  }
];

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("SELL");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  
  const dispatch = useDispatch();
  const unwatchedCount = useSelector(state => state.notifications?.list?.filter(n => !n.watched).length || 0);
  const brokerStats = useSelector(state => state.broker?.stats);
  const user = useSelector(state => state.auth?.user);
  const shortlistedProperties = useSelector(state => state.property?.shortlistedProperties || []);
  const shortlistedLoading = useSelector(state => state.property?.shortlistedLoading || false);

  useEffect(() => {
    dispatch(fetchBrokerStats());
    dispatch(fetchMyProjects());
    dispatch(fetchUserProfile());
  }, [dispatch]);

  const stats = [
    { label: "Total Properties", count: brokerStats?.total_properties ?? 0 },
    { label: "Total Sale",       count: brokerStats?.sales            ?? 0 },
    { label: "Pending",          count: brokerStats?.pending          ?? 0 },
    { label: "Rejected",         count: brokerStats?.rejected         ?? 0 },
  ];

  const currentSubTypes = useMemo(() => {
    if (!selectedCategory) return [];
    const category = propertyCategories.find(c => c.id === selectedCategory);
    return category?.subTypes || [];
  }, [selectedCategory]);
  
  const shortlistedCount = useMemo(() => {
    return shortlistedProperties.length;
  }, [shortlistedProperties]);

  const branchEarningSummary = useMemo(() => {
    const summary = brokerStats?.branch_channel_partner_earning_summary || brokerStats?.branchEarningSummary || {};
    const channelPartnerCount =
      summary.channel_partner_count ??
      summary.channelPartnerCount ??
      brokerStats?.branch_channel_partner_count ??
      brokerStats?.branchChannelPartnerCount ??
      brokerStats?.channel_partner_count ??
      0;
    const monthlyEarningLabel =
      summary.max_monthly_earning_label ??
      summary.maxMonthlyEarningLabel ??
      brokerStats?.branch_max_monthly_earning_label ??
      brokerStats?.branchMaxMonthlyEarningLabel ??
      formatIndianEarningAmount(
        summary.max_monthly_earning ??
        summary.maxMonthlyEarning ??
        brokerStats?.branch_max_monthly_earning ??
        brokerStats?.branchMaxMonthlyEarning
      );
    const branchName =
      summary.branch_name ??
      summary.branchName ??
      brokerStats?.branch_name ??
      brokerStats?.branchName ??
      null;

    return {
      channelPartnerCount,
      monthlyEarningLabel,
      branchName,
    };
  }, [brokerStats]);

  const handleFilterPress = (filter) => {
    if (filter === "Customer Requirement") {
      router.push("/customer-requirement");
    } else {
      setActiveFilter(filter);
    }
  };
  
  const handleCategoryPress = (categoryId) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedPropertyType(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedPropertyType(null);
    }
  };
  
  const handlePropertyTypePress = (typeId) => {
    setSelectedPropertyType(typeId);
    
    if (selectedCategory && typeId) {
      dispatch(fetchShortlistedProperties({
        category: selectedCategory,
        property_type: typeId
      }));
    }
    
    router.push({ pathname: "/property-type", params: { typeId, category: selectedCategory } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently joined";
    const date = new Date(dateString);
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const displayName = user?.full_name || user?.first_name || "User";
  const displayDate = user?.created_at ? formatDate(user.created_at) : "Recently joined";
  const avatarUrl = user?.avatar_url;

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 160 }} 
        bounces={false}
        className="bg-white"
      >
        
        {/* 🔵 COHESIVE NATIVE BLUE DECK BLOCK (Houses top profile element layers perfectly) */}
        <View style={{ backgroundColor: '#362ddc', position: 'relative' }}>
          
          {/* User Profile Info Layer */}
          <View
            style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 70 }}
            className="px-6 pb-[75px]"
          >
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center gap-3">
                {avatarUrl ? (
                  <Image
                    source={{ uri: avatarUrl }}
                    className="w-14 h-14 rounded-full border border-white"
                  />
                ) : (
                  <View className="w-14 h-14 rounded-full border border-white bg-[#5B54ED] items-center justify-center">
                    <Text className="text-white text-[20px] font-lato-bold">
                      {displayName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View>
                  <View className="flex-row items-center gap-1">
                    <Text className="text-white text-lg font-lato-bold">
                      {displayName}
                    </Text>
                    <MaterialCommunityIcons name="check-circle" size={16} color="#3AFF08" />
                  </View>
                  <Text className="text-xs text-white/70 mt-0.5">{displayDate}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center gap-3">
                <Pressable className="p-1" onPress={() => router.push("/(screens)/wallet")}>
                  <MaterialCommunityIcons name="wallet-outline" size={24} color="white" />
                </Pressable>
                <Pressable className="p-1 relative" onPress={() => router.push("/notifications")}>
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

          {/* 📊 FLOATING MATRIX SUB-DECK BAR (Overlayed via calculated margin offsets natively) */}
          <View
            className="bg-white rounded-[24px] p-[12px] mx-[16px] shadow-xl shadow-black/10"
            style={{ 
              position: 'absolute',
              bottom: -105, // Standard anchor pushes exactly half the element below the blue background barrier
              left: 0,
              right: 0,
              zIndex: 10,
              elevation: 8 
            }}
          >
            <View className="flex-row justify-between gap-2.5">
              {stats.map((s, i) => (
                <View key={i} className="flex-1 bg-[#F4F7FF] rounded-xl py-3.5 items-center justify-center border border-[#EDF2F7]">
                  <Text className="text-base text-[#1A1A1A] font-manrope-bold">{s.count}</Text>
                  <Text className="text-[9px] mt-0.5 text-gray-500 text-center font-manrope-semibold">{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 🎞️ NATIVE GRAPHIC MARKETING BANNER SLIDER (Rendered inside natural linear stream to eliminate grey rendering traps) */}
        <View style={{ backgroundColor: '#3d34e5ff', paddingTop: 110, paddingBottom: 9}}>
          <Image
            source={require("../../assets/images/banner2.png")}
            style={{ width: '100%', height: 175 }}
            resizeMode="cover"
          />
        </View>

        {/* 🏛️ CLEAN LOWER MAIN WHITE CONTENT SECTION */}
        <View 
          style={{ 
            paddingTop: 20, 
            backgroundColor: '#ffffff', 
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            marginTop: -20, // Clean overlap style match with the image above
            zIndex: 100,
          }}
          className="px-4"
        >
          {/* Action Button Switch row */}
          <View className="flex-row gap-3 mb-6">
            {mainTabs.map((f) => {
              const isActive = activeFilter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => handleFilterPress(f)}
                  className={`flex-1 h-11 rounded-full justify-center items-center border shadow-xs ${isActive ? 'bg-[#4A43EC] border-[#4A43EC]' : 'bg-white border-[#E5E7EB]'}`}
                >
                  <Text className={`text-[13px] font-lato-bold ${isActive ? 'text-white' : 'text-gray-600'}`}>
                    {f === "SELL" ? "☰   Resale" : f}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              key={buyFilter}
              onPress={() => handleFilterPress(buyFilter)}
              className="flex-1 h-11 bg-white rounded-full justify-center items-center border border-[#E5E7EB] shadow-xs"
            >
              <Text className="text-[13px] text-gray-600 font-lato-bold">＋ {buyFilter}</Text>
            </Pressable>
          </View>

          {/* Branch channel partner earning summary banner layout */}
          <View className="mb-6">
            <View className="w-full overflow-hidden rounded-[20px] bg-white border border-[#E5E7EB] shadow-xs">
              <View className="h-[6px] bg-[#C8B8FF]" />
              <View className="flex-row items-center py-5 px-4 gap-3">
                <Image
                  source={require("../../assets/images/wallet.png")} 
                  style={{ width: 44, height: 44 }}
                  resizeMode="contain"
                />
                <View className="flex-1">
                  <Text className="text-[14px] font-lato-bold text-[#1F2937]">
                    {branchEarningSummary.channelPartnerCount} Channel Partner{Number(branchEarningSummary.channelPartnerCount) === 1 ? "" : "s"} earn upto{" "}
                    <Text className="text-[#11B980] font-lato-black">{branchEarningSummary.monthlyEarningLabel}</Text>
                  </Text>
                  <Text className="mt-0.5 text-[11px] font-lato-semibold text-gray-400">
                    {branchEarningSummary.branchName ? `In ${branchEarningSummary.branchName}` : "In Your Area"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Property Type Grid Section Container */}
          <View className="mb-6">
            <View className="mb-4">
              <Text className="text-[14px] text-gray-800 font-lato-bold tracking-wider uppercase">Property Type</Text>
            </View>

            <View className="flex-row gap-3 mb-4">
              {propertyCategories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPress(category.id)}
                  style={{ flex: 1 }}
                  className={`border-2 rounded-2xl p-4 items-center shadow-xs ${
                    selectedCategory === category.id 
                      ? 'bg-[#F5F3FF] border-[#7C3AED]' 
                      : 'bg-white border-[#E5E7EB]'
                  }`}
                >
                  <View className="relative w-[60px] h-[60px] mb-2 items-center justify-center">
                    <Image source={category.image} style={{ width: 60, height: 60 }} resizeMode="contain" />
                    {category.cloudImage && (
                      <Image
                        source={category.cloudImage}
                        style={{ position: 'absolute', top: -8, right: -8, width: 30, height: 30 }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <Text className={`text-[14px] font-lato-bold ${selectedCategory === category.id ? 'text-[#7C3AED]' : 'text-[#6B7280]'}`}>
                    {category.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Nested Sub-categories grid rendering */}
            {selectedCategory && currentSubTypes.length > 0 && (
              <View className="flex-row flex-wrap justify-between mt-2">
                {currentSubTypes.map((subType) => (
                  <Pressable
                    key={subType.id}
                    onPress={() => handlePropertyTypePress(subType.id)}
                    style={{ width: (width - 48) / 4, marginBottom: 12 }}
                    className={`border-2 rounded-xl p-2 items-center justify-center ${
                      selectedPropertyType === subType.id ? 'bg-[#F5F3FF] border-[#7C3AED]' : 'bg-white border-[#E5E7EB]'
                    }`}
                  >
                    <Image source={subType.image} style={{ width: 36, height: 36, marginBottom: 4 }} resizeMode="contain" />
                    <Text 
                      className={`text-[11px] font-lato-bold text-center ${selectedPropertyType === subType.id ? 'text-[#7C3AED]' : 'text-[#6B7280]'}`}
                      numberOfLines={1}
                    >
                      {subType.label}
                    </Text>
                    
                    {selectedPropertyType === subType.id && shortlistedCount > 0 && (
                      <View className="mt-1 bg-[#7C3AED] px-1.5 py-0.5 rounded-full">
                        <Text className="text-white text-[8px] font-lato-bold">{shortlistedCount}</Text>
                      </View>
                    )}
                    
                    {selectedPropertyType === subType.id && shortlistedLoading && (
                      <View className="mt-1"><Text className="text-[#7C3AED] text-[8px] font-lato-regular">...</Text></View>
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}