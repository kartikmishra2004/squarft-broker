import { View, Text, FlatList, TextInput, TouchableOpacity, Image, Modal, StatusBar, Platform, ActivityIndicator } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { fetchMyAddedProperties, deleteProject } from "../../store/slices/myAddedSlice";
import PropertyDetailSheet from "../../components/property/PropertyDetailSheet";

function PropertyCard({ item, onDeletePress, onEditPress, onPress }) {
    const [menuOpen, setMenuOpen] = useState(false);
    
    // Get cover image from media array
    const coverImage = item.media?.find(m => m.is_cover && m.media_type === 'image')?.url || 
                       item.media?.find(m => m.media_type === 'image')?.url ||
                       item.cover_image_url;
    
    // Format location
    const location = `${item.area || ''}, ${item.city || ''}`.trim().replace(/^,\s*/, '');
    
    // Format price
    const priceFrom = item.price_from || 0;
    const priceTo = item.price_to || 0;
    const priceDisplay = priceTo > priceFrom 
        ? `₹${(priceFrom / 100000).toFixed(2)}L - ₹${(priceTo / 100000).toFixed(2)}L`
        : `₹${(priceFrom / 100000).toFixed(2)}L`;

    return (
        <TouchableOpacity 
            activeOpacity={0.7}
            onPress={() => onPress?.(item)}
            className="flex-row bg-white border border-[#E5E7EB] rounded-[20px] mb-4 p-3 items-start" 
        >
            {coverImage ? (
                <Image 
                    source={{ uri: coverImage }} 
                    className="w-[108px] h-[105px] rounded-2xl" 
                    resizeMode="cover" 
                />
            ) : (
                <View className="w-[108px] h-[105px] rounded-2xl bg-gray-200 items-center justify-center">
                    <Ionicons name="image-outline" size={40} color="#9CA3AF" />
                </View>
            )}
            <View className="flex-1 ml-2.5">
                <View className="flex-row items-center mb-0.5">
                    <View className="w-[7px] h-[7px] rounded-full bg-[#4A43EC] mr-1" />
                    <Text className="text-[10px] text-[#4A43EC] italic capitalize">{item.category || 'Property'}</Text>
                </View>
                <Text className="text-[14px] font-roboto-medium text-[#1a1a1a] mb-0.5" numberOfLines={1}>
                    {item.name || 'Untitled Property'}
                </Text>
                <View className="flex-row items-center mb-0.5">
                    <Ionicons name="location" size={13} color="#FE8A71" />
                    <Text className="text-[10px] tracking-wide font-roboto text-gray-500 ml-1" numberOfLines={1}>{location}</Text>
                </View>
                <View className="flex-row gap-2.5 mb-1">
                    {item.total_area && (
                        <View className="flex-row items-center gap-1.5">
                            <MaterialCommunityIcons name="floor-plan" size={13} color="#FE8A71" />
                            <Text className="text-[10px] italic text-gray-500">{item.total_area} {item.area_unit || 'sqft'}</Text>
                        </View>
                    )}
                    {item.property_subtype && (
                        <View className="flex-row items-center gap-1.5">
                            <MaterialCommunityIcons name="bed" size={13} color="#FE8A71" />
                            <Text className="text-[10px] italic text-gray-500">{item.property_subtype}</Text>
                        </View>
                    )}
                </View>
                <Text className="text-[16px] font-bold text-[#4F46E5]">
                    {priceDisplay}
                </Text>
            </View>

            {/* 3-dot menu */}
            <View className="items-end">
                <TouchableOpacity className="p-1" onPress={() => setMenuOpen((v) => !v)}>
                    <Feather name="more-vertical" size={18} color="#333" />
                </TouchableOpacity>
                {menuOpen && (
                    <View className="absolute top-7 right-0 bg-[#4F46E5] rounded-xl overflow-hidden z-10" style={{ elevation: 8, minWidth: 120 }}>
                        <TouchableOpacity
                            className="flex-row items-center gap-2.5 px-4 py-3 border-b border-[#6B63F0]"
                            onPress={() => { setMenuOpen(false); onEditPress?.(item); }}
                        >
                            <Feather name="edit-2" size={15} color="#fff" />
                            <Text className="text-white text-[14px] font-roboto-medium">Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="flex-row items-center gap-2.5 px-4 py-3"
                            onPress={() => { setMenuOpen(false); onDeletePress(item.id); }}
                        >
                            <Feather name="trash-2" size={15} color="#fff" />
                            <Text className="text-white text-[14px] font-roboto-medium">Delete</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
}

export default function Favourite() {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const router = useRouter();
    const properties = useSelector((state) => state.myAdded.list);
    const loading = useSelector((state) => state.myAdded.loading);
    const unwatchedCount = useSelector(state => state.notifications?.list?.filter(n => !n.watched).length || 0);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState(null);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [propertySheetVisible, setPropertySheetVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Fetch properties on mount
    useEffect(() => {
        dispatch(fetchMyAddedProperties());
    }, [dispatch]);

    // Refresh properties every time the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            dispatch(fetchMyAddedProperties());
        }, [dispatch])
    );

    const filtered = properties.filter((p) =>
        (p.name?.toLowerCase().includes(search.toLowerCase()) || false) ||
        (p.city?.toLowerCase().includes(search.toLowerCase()) || false) ||
        (p.area?.toLowerCase().includes(search.toLowerCase()) || false)
    );

    const handleConfirmDelete = async () => {
        setDeleting(true);
        try {
            await dispatch(deleteProject(deleteId)).unwrap();
            setDeleteId(null);
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete project. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const handleEditPress = (item) => {
        // Navigate to edit screen or show edit modal
        // For now, we'll just log it
        console.log('Edit project:', item.id);
        alert('Edit functionality will be implemented in the add project flow');
    };

    if (loading && properties.length === 0) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#4A43EC" />
                <Text className="text-gray-500 mt-4 font-lato-regular">Loading properties...</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pb-3" style={{ paddingTop: insets.top + 8 }}>
                <View />
                <Text className="text-[16px] text-black font-lato-bold ml-8">My Added</Text>
                <TouchableOpacity
                    className="p-1 relative"
                    onPress={() => router.push("/notifications")}
                >
                    <Ionicons name="notifications" size={22} color="black" />
                    {unwatchedCount > 0 ? (
                        <View className="absolute top-0 right-0 bg-[#FF3B30] min-w-[14px] h-[14px] rounded-full items-center justify-center border border-white">
                            <Text className="text-white text-[8px] font-manrope-bold">{unwatchedCount}</Text>
                        </View>
                    ) : null}
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="flex-row px-5 mt-3 gap-2.5 mb-5">
                <View className="flex-1 flex-row items-center bg-[#EBF1FF] rounded-xl px-3.5 h-[44px]">
                    <Ionicons name="search" size={18} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 text-[13px] text-black ml-2 font-lato-regular"
                        placeholder="Search"
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity className="w-[44px] h-[44px] bg-[#EBF1FF] rounded-xl items-center justify-center">
                    <MaterialCommunityIcons name="filter-variant" size={22} color="#4A43EC" />
                </TouchableOpacity>
            </View>

            {/* List */}
            {filtered.length === 0 && !loading ? (
                <View className="flex-1 items-center justify-center px-8">
                    <Ionicons name="folder-open-outline" size={64} color="#D1D5DB" />
                    <Text className="text-gray-400 font-lato-medium text-center text-sm mt-4">
                        {search ? 'No properties match your search' : 'No properties added yet'}
                    </Text>
                    <Text className="text-gray-400 font-lato-regular text-center text-xs mt-2">
                        {!search && 'Add properties from the "Add Project" tab'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <PropertyCard 
                            item={item} 
                            onDeletePress={setDeleteId}
                            onEditPress={handleEditPress}
                            onPress={(prop) => {
                                setSelectedProperty(prop);
                                setPropertySheetVisible(true);
                            }} 
                        />
                    )}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 150, paddingTop: 10 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Delete Confirm Modal */}
            <Modal visible={deleteId !== null} transparent animationType="fade">
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <View className="bg-white rounded-3xl mx-6 px-6 py-8 w-[85%]" style={{ elevation: 10 }}>
                        <Text className="text-[18px] font-roboto-bold text-[#1a1a1a] text-center mb-8">
                            Are you sure you want to{"\n"}delete this project?
                        </Text>
                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                className="flex-1 py-3.5 rounded-2xl items-center justify-center border-2 border-[#4F46E5]"
                                onPress={() => setDeleteId(null)}
                                disabled={deleting}
                            >
                                <Text className="text-[#4F46E5] text-[15px] font-roboto-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 py-3.5 rounded-2xl items-center justify-center bg-[#E53935]"
                                onPress={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text className="text-white text-[15px] font-roboto-bold">Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <PropertyDetailSheet 
                visible={propertySheetVisible}
                item={selectedProperty}
                onClose={() => setPropertySheetVisible(false)}
            />
        </View>
    );
}
