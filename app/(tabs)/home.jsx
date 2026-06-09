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
import { upcomingProjectsData } from "../../data/properties";
import { fetchBrokerStats, fetchMyProjects } from "../../store/slices/brokerSlice";
import { fetchUserProfile } from "../../store/slices/authSlice";
import { fetchShortlistedProperties } from "../../store/slices/propertySlice";

const { width } = Dimensions.get("window");

const mainTabs = ["SELL"];
const buyFilter = "Customer Requirement";

// Property type categories - matching FilterModal structure
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
  const [selectedCategory, setSelectedCategory] = useState(null); // null, "residential", or "commercial"
  const [selectedPropertyType, setSelectedPropertyType] = useState(null); // Single selection
  
  const dispatch = useDispatch();
  const unwatchedCount = useSelector(state => state.notifications?.list?.filter(n => !n.watched).length || 0);
  const brokerStats = useSelector(state => state.broker?.stats);
  const apiProjects = useSelector(state => state.broker?.projects || []);
  const user = useSelector(state => state.auth?.user);
  const shortlistedProperties = useSelector(state => state.property?.shortlistedProperties || []);
  const shortlistedLoading = useSelector(state => state.property?.shortlistedLoading || false);

  useEffect(() => {
    dispatch(fetchBrokerStats());
    dispatch(fetchMyProjects());
    dispatch(fetchUserProfile());
  }, []);

  const stats = [
    { label: "Total Properties", count: brokerStats?.total_properties ?? 0 },
    { label: "Total Sale",       count: brokerStats?.sales            ?? 0 },
    { label: "Pending",          count: brokerStats?.pending          ?? 0 },
    { label: "Rejected",         count: brokerStats?.rejected         ?? 0 },
  ];

  const projects = useMemo(() => {
    if (apiProjects.length > 0) return apiProjects;
    return upcomingProjectsData;
  }, [apiProjects]);
  
  // Get subtypes based on selected category
  const currentSubTypes = useMemo(() => {
    if (!selectedCategory) return [];
    const category = propertyCategories.find(c => c.id === selectedCategory);
    return category?.subTypes || [];
  }, [selectedCategory]);
  
  // Count shortlisted properties for the selected property type
  const shortlistedCount = useMemo(() => {
    return shortlistedProperties.length;
  }, [shortlistedProperties]);

  const handleFilterPress = (filter) => {
    if (filter === "Customer Requirement") {
      router.push("/customer-requirement");
    } else {
      setActiveFilter(filter);
    }
  };
  
  // Handle category selection (Residential/Commercial)
  const handleCategoryPress = (categoryId) => {
    if (selectedCategory === categoryId) {
      // Deselect if clicking the same category
      setSelectedCategory(null);
      setSelectedPropertyType(null);
    } else {
      // Select new category and reset property type
      setSelectedCategory(categoryId);
      setSelectedPropertyType(null);
    }
  };
  
  // Handle property type selection (single selection only)
  const handlePropertyTypePress = (typeId) => {
    setSelectedPropertyType(typeId);
    
    // Fetch shortlisted properties for this category and type
    if (selectedCategory && typeId) {
      console.log('🔍 [Home] Fetching shortlisted properties:', {
        category: selectedCategory,
        property_type: typeId
      });
      
      dispatch(fetchShortlistedProperties({
        category: selectedCategory,
        property_type: typeId
      }));
    }
    
    // Navigate to property-type screen with the selected type
    router.push({ pathname: "/property-type", params: { typeId,
        category: selectedCategory } });
  };

  // Format date for display
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 200 }} bounces={false}>
        <View
          style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 70 }}
          className="bg-[#4A43EC] px-6 pb-[80px]"
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
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="#3AFF08"
                  />
                </View>
                <Text className="text-xs text-white/70 mt-0.5">{displayDate}</Text>
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
            {/* Promotional Image - Replace "23 Channel Partner" section */}
          <View className="mb-6 px-2">
            <Pressable className="w-full h-[100px] rounded-[20px] overflow-hidden">
              <Image
                source={require("../../assets/images/avgearning.png")}
                className="w-full h-full"
                resizeMode="cover"
              />
            </Pressable>
          </View>

          {/* Property Type Selection - New Design */}
          <View className="mb-6">
            {/* Section Header */}
            <View className="px-2 mb-4">
              <Text className="text-[15px] text-black font-lato-bold tracking-wider">
                PROPERTY TYPES
              </Text>
            </View>

            {/* Category Selection (Residential/Commercial) */}
            <View className="flex-row gap-3 px-2 mb-4">
              {propertyCategories.map((category) => (
                <Pressable
                  key={category.id}
                  onPress={() => handleCategoryPress(category.id)}
                  style={{ flex: 1 }}
                  className={`border-2 rounded-xl p-4 items-center ${
                    selectedCategory === category.id 
                      ? 'bg-[#F5F3FF] border-[#7C3AED]' 
                      : 'bg-white border-[#E5E7EB]'
                  }`}
                >
                  <View className="relative w-[60px] h-[60px] mb-2 items-center justify-center">
                    <Image
                      source={category.image}
                      style={{ width: 60, height: 60 }}
                      resizeMode="contain"
                    />
                    {category.cloudImage && (
                      <Image
                        source={category.cloudImage}
                        style={{ position: 'absolute', top: -8, right: -8, width: 30, height: 30 }}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                  <Text 
                    className={`text-[14px] font-lato-bold ${
                      selectedCategory === category.id ? 'text-[#7C3AED]' : 'text-[#6B7280]'
                    }`}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Property Sub-Types Grid (shows when category is selected) */}
            {selectedCategory && currentSubTypes.length > 0 && (
              <View className="flex-row flex-wrap justify-between px-2 mt-2">
                {currentSubTypes.map((subType) => (
                  <Pressable
                    key={subType.id}
                    onPress={() => handlePropertyTypePress(subType.id)}
                    style={{ 
                      width: (width - 52) / 2,
                      marginBottom: 12
                    }}
                    className={`border-2 rounded-xl p-4 items-center ${
                      selectedPropertyType === subType.id
                        ? 'bg-[#F5F3FF] border-[#7C3AED]'
                        : 'bg-white border-[#E5E7EB]'
                    }`}
                  >
                    <Image
                      source={subType.image}
                      style={{ width: 50, height: 50, marginBottom: 8 }}
                      resizeMode="contain"
                    />
                    <Text 
                      className={`text-[14px] font-lato-bold ${
                        selectedPropertyType === subType.id ? 'text-[#7C3AED]' : 'text-[#6B7280]'
                      }`}
                    >
                      {subType.label}
                    </Text>
                    
                    {/* Show count for selected property type */}
                    {selectedPropertyType === subType.id && shortlistedCount > 0 && (
                      <View className="mt-2 bg-[#7C3AED] px-2 py-1 rounded-full">
                        <Text className="text-white text-[10px] font-lato-bold">
                          {shortlistedCount} {shortlistedCount === 1 ? 'property' : 'properties'}
                        </Text>
                      </View>
                    )}
                    
                    {/* Show loading indicator */}
                    {selectedPropertyType === subType.id && shortlistedLoading && (
                      <View className="mt-2">
                        <Text className="text-[#7C3AED] text-[10px] font-lato-regular">
                          Loading...
                        </Text>
                      </View>
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