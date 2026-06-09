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
    ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useLocalSearchParams, Stack } from "expo-router";
import { propertyTypes } from "../../data/listingData";
import { upcomingProjectsData } from "../../data/properties";
import BottomSheet, { BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import Slider from "@react-native-community/slider";
import PropertyCard from "../../components/property/PropertyCard";
import CategoryTile from "../../components/property/CategoryTile";
import PropertyDetailSheet from "../../components/property/PropertyDetailSheet";
// ✅ FIXED: Imported the correct action that matches your slice definition parameters
import { fetchShortlistedProperties } from "../../store/slices/propertySlice";

export default function PropertyType() {
    // ✅ FIXED: Unwrapped both typeId and category routing parameters forwarded from Home screen
    const { typeId, category } = useLocalSearchParams();
    const dispatch = useDispatch();
    const [view, setView] = useState(typeId ? "list" : "types");
    const [selectedTypeId, setSelectedTypeId] = useState(typeId || null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("approved");

    // ✅ FIXED: Redirected state selector properties to pull directly from your real shortlisted arrays
    const properties = useSelector(state => state.property.shortlistedProperties || []);
    const loading = useSelector(state => state.property.shortlistedLoading || false);
  
    const unwatchedCount = useSelector(state => state.notifications?.list?.filter(n => !n.watched).length || 0);
    const router = useRouter();

    const [priceRange, setPriceRange] = useState(null);
    const [facilityFilter, setFacilityFilter] = useState(null);

    const [tempPriceRange, setTempPriceRange] = useState(null);
    const [tempFacilityFilter, setTempFacilityFilter] = useState(null);

    const bottomSheetRef = useRef(null);
    const snapPoints = useMemo(() => ["65%"], []);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [propertySheetVisible, setPropertySheetVisible] = useState(false);

    // ✅ FIXED: Wired up your real fetch thunk to handle category and property_type filters cleanly
    useEffect(() => {
        const activeCategory = category || "residential"; // Safe fallback query criteria
        if (selectedTypeId && view === "list") {
            console.log('🔍 [PropertyType Screen] Requesting network collection payload for:', {
                category: activeCategory,
                property_type: selectedTypeId
            });
            dispatch(fetchShortlistedProperties({
                category: activeCategory,
                property_type: selectedTypeId
            }));
        }
    }, [selectedTypeId, view, category, dispatch]);

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

    const handlePropertyPress = (item) => {
        setSelectedProperty(item);
        setPropertySheetVisible(true);
    };

    const currentTypeLabel = useMemo(() => {
        const predefined = propertyTypes.find(t => t.id === selectedTypeId);
        if (predefined) return predefined.label;
        if (!selectedTypeId) return 'Listing';
        return selectedTypeId.replace(/(\d+)([a-z]+)/i, '$1 $2').charAt(0).toUpperCase() + selectedTypeId.slice(1).replace(/(\d+)([a-z]+)/i, '$1 $2');
    }, [selectedTypeId]);

    const filteredProperties = useMemo(() => {
        if (!properties || properties.length === 0) return [];
        
        return properties.filter(p => {
            const matchSearch = searchQuery ? 
                (p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false) : true;
            // Handle both base_price or min_price structures safely
            const itemPrice = p.base_price || p.min_price || 0;
            const matchPrice = priceRange ? itemPrice <= priceRange : true;
            return matchSearch && matchPrice;
        });
    }, [properties, searchQuery, priceRange]);

    const currentProperties = {
        filtered: filteredProperties,
        total: properties?.length || 0,
        statusCount: filteredProperties.length
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
                        <Ionicons name="notifications" size={22} color="black" />
                        {unwatchedCount > 0 ? (
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
                    </View>

                    {loading ? (
                        <View className="items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#4A43EC" />
                            <Text className="text-gray-500 mt-4 font-lato-regular">Loading properties...</Text>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap px-2.5 justify-between">
                            {currentProperties.filtered.map((item) => (
                                <PropertyCard key={item.id} item={item} propertyTypeLabel={currentTypeLabel} onPress={handlePropertyPress} />
                            ))}
                            {currentProperties.filtered.length === 0 && (
                                <View className="w-full items-center mt-20 px-8">
                                    <Text className="text-gray-400 font-lato-medium text-center text-xs">
                                        No properties found for {currentTypeLabel}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
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
                            <View className="flex-row justify-between mt-2">
                                {[4000, 50000, 100000, 150000, 200000].map(val => (
                                    <Text key={val} className="text-[9px] text-gray-400 font-lato-medium">₹{val}</Text>
                                ))}
                            </View>
                        </View>

                        <View className="mb-10">
                            <Text className="text-[14px] font-lato-bold mb-4">Facilities</Text>
                            <View className="flex-row gap-3">
                                {['Furnished', 'Semi-Furnished', 'Unfurnished'].map(fac => (
                                    <Pressable
                                        key={fac}
                                        onPress={() => setTempFacilityFilter(prev => prev === fac ? null : fac)}
                                        className={`px-4 py-2.5 rounded-lg border flex-1 items-center justify-center ${tempFacilityFilter === fac ? 'bg-[#4A43EC] border-[#4A43EC]' : 'bg-white border-blue-200'}`}
                                    >
                                        <Text className={`text-[10px] font-lato-medium whitespace-nowrap ${tempFacilityFilter === fac ? 'text-white' : 'text-[#4A43EC]'}`}>{fac}</Text>
                                    </Pressable>
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

                <PropertyDetailSheet 
                    visible={propertySheetVisible}
                    item={selectedProperty} 
                    onClose={() => setPropertySheetVisible(false)}
                />
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
                    <Ionicons name="notifications" size={22} color="black" />
                    {unwatchedCount > 0 ? (
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

                <View className="flex-row flex-wrap justify-between mb-[30px] px-5">
                    {propertyTypes.map((item) => (
                        <CategoryTile key={item.id} item={item} onPress={handleTypePress} />
                    ))}
                </View>

                <View className="px-5 mb-4">
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