import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { propertyTypes, propertiesByRoomType } from "../../data/listingData";
import { upcomingProjectsData } from "../../data/properties";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import Slider from "@react-native-community/slider";
import PropertyCard from "../../components/property/PropertyCard";
import CategoryTile from "../../components/property/CategoryTile";

export default function PropertyType() {
  const { typeId } = useLocalSearchParams();
  const [view, setView] = useState(typeId ? "list" : "types");
  const [selectedTypeId, setSelectedTypeId] = useState(typeId || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("approved");

  // Use a safe selector in case notifications store isn't present in broker app
  const unwatchedCount = useSelector(state => state.notifications?.list?.filter(n => !n.watched).length || 0);
  const router = useRouter();

  const [priceRange, setPriceRange] = useState(null);
  const [facilityFilter, setFacilityFilter] = useState(null);

  const [tempPriceRange, setTempPriceRange] = useState(null);
  const [tempFacilityFilter, setTempFacilityFilter] = useState(null);

  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["65%"], []);

  useEffect(() => {
    if (typeId) {
      setSelectedTypeId(typeId);
      setView("list");
    }
  }, [typeId]);

  const handleOpenFilter = () => {
    setTempPriceRange(priceRange);
    setTempFacilityFilter(facilityFilter);
    bottomSheetRef.current?.expand();
  };

  const handleCloseFilter = () => bottomSheetRef.current?.close();

  const handleApplyFilters = () => {
    setPriceRange(tempPriceRange);
    setFacilityFilter(tempFacilityFilter);
    handleCloseFilter();
  };

  const handleResetFilters = () => {
    setTempPriceRange(null);
    setTempFacilityFilter(null);
  };

  const handleTypePress = (id) => {
    setSelectedTypeId(id);
    setView("list");
  };

  const currentTypeLabel = useMemo(() => {
    const predefined = propertyTypes.find(t => t.id === selectedTypeId);
    if (predefined) return predefined.label;
    if (!selectedTypeId) return 'Listing';
    // Handle plots, lands, etc. and also formats like "1bhk" if needed
    return selectedTypeId.replace(/(\d+)([a-z]+)/i, '$1 $2').charAt(0).toUpperCase() + selectedTypeId.slice(1).replace(/(\d+)([a-z]+)/i, '$1 $2');
  }, [selectedTypeId]);



  const rawList = selectedTypeId ? (propertiesByRoomType[selectedTypeId] || []) : [];
  const statusFiltered = rawList.filter(p => p.status?.toLowerCase() === statusFilter?.toLowerCase());

  const finalFiltered = statusFiltered.filter(p => {
    const matchSearch = searchQuery ? p.title.toLowerCase().includes(searchQuery.toLowerCase()) : true;
    const matchPrice = priceRange ? p.price <= priceRange : true;
    const matchFacility = facilityFilter ? p.facility === facilityFilter : true;
    return matchSearch && matchPrice && matchFacility;
  });

  const currentProperties = {
    filtered: finalFiltered,
    total: rawList.length,
    statusCount: statusFiltered.length
  };

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop {...props} disappearsAt={-1} appearsAt={0.5} opacity={0.5} />
    ),
    []
  );

  if (view === "list") {
    return (
      <View className="flex-1 bg-white">
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />

        <View className="flex-row items-center justify-between px-5 pb-3 mt-2" style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 8 : 45 }}>
          <Pressable onPress={() => {
            if (typeId) {
              router.back();
            } else {
              setView("types");
              setSearchQuery("");
              setStatusFilter("approved");
              setPriceRange(null);
              setFacilityFilter(null);
            }
          }} className="p-1">
            <Ionicons name="arrow-back" size={22} color="black" />
          </Pressable>
          <Text className="text-[16px] text-black font-lato-bold">{currentTypeLabel}</Text>
          <Pressable
            className="p-1 relative"
            onPress={() => router.push("/notifications")}
          >
            <Ionicons name="notifications" size={22} color="black" />{unwatchedCount > 0 ? (
              <View className="absolute top-0 right-0 bg-[#FF3B30] min-w-[14px] h-[14px] rounded-full items-center justify-center border border-white">
                <Text className="text-white text-[8px] font-manrope-bold">{unwatchedCount}</Text>
              </View>
            ) : null}
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View className="flex-row px-5 mt-3 gap-2.5">
            <View className="flex-1 flex-row items-center bg-[#EBF1FF] rounded-xl px-3.5 h-[44px]">
              <Ionicons name="search" size={18} color="#9CA3AF" />
              <TextInput
                className="flex-1 text-[13px] text-black ml-2 font-lato-regular"
                placeholder="Search"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable onPress={handleOpenFilter} className="w-[44px] h-[44px] bg-[#EBF1FF] rounded-xl items-center justify-center">
              <MaterialCommunityIcons name="filter-variant" size={22} color="#4A43EC" />
            </Pressable>
          </View>

          <View className="flex-row items-center justify-between px-5 mt-8 mb-4">
            <Text className="text-sm text-black font-lato-bold">Listing Property ({currentProperties.filtered.length})</Text>
            <View className="flex-row gap-2">
              {['approved', 'pending', 'rejected'].map(status => (
                <Pressable
                  key={status}
                  onPress={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-full border ${statusFilter === status ? 'bg-[#4A43EC] border-[#4A43EC]' : 'bg-white border-[#4A43EC]'}`}
                ><Text className={`text-[10px] font-lato-medium capitalize ${statusFilter === status ? 'text-white' : 'text-[#4A43EC]'}`}>{status}</Text></Pressable>
              ))}
            </View>
          </View>

          <View className="flex-row flex-wrap px-2.5 justify-between">{currentProperties.filtered.map((item) => (
            <PropertyCard key={item.id} item={item} propertyTypeLabel={currentTypeLabel} />
          ))}{currentProperties.filtered.length === 0 && (
            <View className="w-full items-center mt-20 px-8">
              <Text className="text-gray-400 font-lato-medium text-center text-xs">No {statusFilter} properties match your filters</Text>
            </View>
          )}
          </View>
        </ScrollView>

        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          backgroundStyle={{ borderRadius: 40 }}
        >
          <BottomSheetView className="flex-1 p-6">
            <Text className="text-[18px] font-lato-bold text-center mb-6">Filter</Text>

            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[16px] font-lato-bold">Apply Filter</Text>
              <Pressable onPress={handleResetFilters}>
                <Text className="text-[13px] font-lato-bold text-[#4A43EC]">Clear All</Text>
              </Pressable>
            </View>

            <View className="mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-[13px] font-lato-bold">Price Range</Text>
                <Text className="text-[13px] font-lato-bold text-[#4A43EC]">{tempPriceRange ? `₹${tempPriceRange}` : 'Not Applied'}</Text>
              </View>
              <View className="h-10 justify-center">
                <Slider
                  style={{ width: '100%', height: 40 }}
                  minimumValue={0}
                  maximumValue={200000}

                  step={1000}
                  value={tempPriceRange || 200000}
                  onValueChange={setTempPriceRange}
                  minimumTrackTintColor="#4A43EC"
                  maximumTrackTintColor="#EBF1FF"
                  thumbTintColor="#4A43EC"
                />
              </View>
              <View className="flex-row justify-between mt-2">{[4000, 50000, 100000, 150000, 200000].map(val => (
                <Text key={val} className="text-[9px] text-gray-400 font-lato-medium">₹{val}</Text>
              ))}</View>
            </View>


            <View className="mb-10">
              <Text className="text-[14px] font-lato-bold mb-4">Facilities</Text>
              <View className="flex-row gap-3">
                {['Furnished', 'Semi-Furnished', 'Unfurnished'].map(fac => (
                  <Pressable
                    key={fac}
                    onPress={() => setTempFacilityFilter(prev => prev === fac ? null : fac)}

                    className={`px-4 py-2.5 rounded-lg border flex-1 items-center justify-center ${tempFacilityFilter === fac ? 'bg-[#4A43EC] border-[#4A43EC]' : 'bg-white border-blue-200'}`}
                  ><Text className={`text-[10px] font-lato-medium whitespace-nowrap ${tempFacilityFilter === fac ? 'text-white' : 'text-[#4A43EC]'}`}>{fac}</Text></Pressable>
                ))}
              </View>
            </View>

            <View className="flex-row gap-4 mt-auto">
              <Pressable
                onPress={handleCloseFilter}
                className="flex-1 h-12 rounded-xl border border-dashed border-gray-400 items-center justify-center"
              >
                <Text className="text-[14px] font-lato-bold text-black">Back</Text>
              </Pressable>
              <Pressable
                onPress={handleApplyFilters}
                className="flex-1 h-12 rounded-xl bg-[#4A43EC] items-center justify-center"
              >
                <Text className="text-[14px] font-lato-bold text-white">Apply</Text>
              </Pressable>
            </View>
          </BottomSheetView>
        </BottomSheet>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View
        className="flex-row items-center justify-between px-5 pb-3 mt-2"
        style={{ paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 8 : 45 }}
      >
        <Pressable onPress={() => router.back()} className="p-1">
          <Ionicons name="arrow-back" size={22} color="black" />
        </Pressable>
        <Text className="text-[16px] text-black font-lato-bold">Property type</Text>
        <Pressable
          className="p-1 relative"
          onPress={() => router.push("/(screens)/notifications")}
        >
          <Ionicons name="notifications" size={22} color="black" />{unwatchedCount > 0 ? (
            <View className="absolute top-0 right-0 bg-[#FF3B30] min-w-[14px] h-[14px] rounded-full items-center justify-center border border-white">
              <Text className="text-white text-[8px] font-manrope-bold">{unwatchedCount}</Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="flex-row px-5 mt-3 gap-2.5">
          <View className="flex-1 flex-row items-center bg-[#EBF1FF] rounded-xl px-3.5 h-[44px]">
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-[13px] text-black ml-2 font-lato-regular"
              placeholder="Search"
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View className="px-5 mt-8 mb-4">
          <Text className="text-[15px] text-black font-lato-bold tracking-wider">PROPERTY TYPES</Text>
        </View>


        <View className="flex-row flex-wrap justify-between mb-[30px] px-5">{propertyTypes.map((item) => (
          <CategoryTile key={item.id} item={item} onPress={handleTypePress} />
        ))}</View>

        <View className="px-5 mb-4">
          <Text className="text-[15px] text-black font-lato-bold tracking-wider">RECENT ADDED</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-1" contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}>{(propertiesByRoomType["1bhk"] || []).slice(0, 3).map((item) => (


          <Pressable
            key={item.id}
            onPress={() => router.push({ pathname: "/property-detail", params: { id: item.id } })}
            className="w-[220px] bg-white rounded-[16px] mr-4 border border-gray-200 overflow-hidden shadow-sm mb-4"
          >

            <Image source={item.image} className="w-full h-44" />
            <View className="p-4">
              <View className="flex-row justify-between items-center mb-2">
                <View className="px-2 py-0.5 rounded-xl border border-[#E0E7FF]">
                  <Text className="text-[10px] text-[#4A43EC] font-lato-medium">{item.category}</Text>
                </View>
                <Text className="text-[15px] text-[#4A43EC] font-lato-bold">
                  ₹{item.price}<Text className="text-[11px]">/m</Text>
                </Text>
              </View>
              <Text className="text-[15px] text-[#1F2937] font-manrope-extrabold mb-2" numberOfLines={1}>
                {item.title}
              </Text>
              <View className="flex-row items-center gap-1">
                <Ionicons name="location" size={13} color="#FF7B54" />
                <Text className="text-[12px] text-[#6B7280] font-lato-medium" numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            </View>
          </Pressable>
        ))}
        </ScrollView>

        <View className="px-5 mb-4 mt-4">
          <Text className="text-[15px] text-black font-lato-bold tracking-wider">UPCOMING PROJECTS</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 10 }}>
          {upcomingProjectsData.map((project) => (
            <View key={project.id} className="w-[290px] flex-row bg-[#F4F7FF] rounded-lg overflow-hidden mr-[15px] h-[130px]">
              <Image source={project.image} className="w-[35%] h-full" resizeMode="cover" />
              <View className="flex-1 p-2.5 justify-center border-2 border-[#4A43EC] border-l-0 rounded-r-lg">
                <Text className="text-[15px] text-black font-lato-bold mb-0.5" numberOfLines={1}>
                  {project.title}
                </Text>
                <Text className="text-[12px] text-gray-400 font-lato-regular mb-3">
                  {project.developer}
                </Text>
                <Text className="text-[12px] text-gray-500 font-lato-regular mb-3">
                  {project.description}
                </Text>
                <Text className="text-[15px] text-black font-lato-bold">
                  {project.price}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </ScrollView>
    </View>
  );
}