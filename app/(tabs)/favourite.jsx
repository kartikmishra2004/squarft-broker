import { View, Text, FlatList, TextInput, TouchableOpacity, Image, Modal, StatusBar, Platform } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useState } from "react";
import { removeProperty } from "../../store/slices/myAddedSlice";

function PropertyCard({ item, onDeletePress }) {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <View className="flex-row bg-white rounded-[20px] mb-4 p-4 items-start" style={{ elevation: 4, shadowColor: "#6B7280", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.20, shadowRadius: 8 }}>
            <Image source={item.image} className="w-[108px] h-[105px] rounded-2xl" resizeMode="cover" />
            <View className="flex-1 ml-2.5">
                <View className="flex-row items-center mb-0.5">
                    <View className="w-[7px] h-[7px] rounded-full bg-[#FFC107] mr-1" />
                    <Text className="text-[10px] text-[#FFC107] italic">{item.status}</Text>
                </View>
                <Text className="text-[14px] font-roboto-medium text-[#1a1a1a] mb-0.5" numberOfLines={1}>{item.title}</Text>
                <View className="flex-row items-center mb-0.5">
                    <Ionicons name="location" size={13} color="#FE8A71" />
                    <Text className="text-[10px] tracking-wide font-roboto text-gray-500 ml-1" numberOfLines={1}>{item.location}</Text>
                </View>
                <View className="flex-row gap-2.5 mb-1">
                    <View className="flex-row items-center gap-1.5">
                        <MaterialCommunityIcons name="floor-plan" size={13} color="#FE8A71" />
                        <Text className="text-[10px] italic text-gray-500">{item.area}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                        <MaterialCommunityIcons name="bed" size={13} color="#FE8A71" />
                        <Text className="text-[10px] italic text-gray-500">{item.beds}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                        <MaterialCommunityIcons name="shower" size={13} color="#FE8A71" />
                        <Text className="text-[10px] italic text-gray-500">{item.baths}</Text>
                    </View>
                    <View className="flex-row items-center gap-1.5">
                        <MaterialCommunityIcons name="car-outline" size={13} color="#FE8A71" />
                        <Text className="text-[10px] italic text-gray-500">{item.parking}</Text>
                    </View>
                </View>
                <Text className="text-[16px] font-bold text-[#4F46E5] ">
                    ₹{item.price.toLocaleString("en-IN")}
                    <Text className="text-[11px] font-normal text-[#4F46E5]">/Month</Text>
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
                            onPress={() => setMenuOpen(false)}
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
        </View>
    );
}

export default function Favourite() {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const router = useRouter();
    const properties = useSelector((state) => state.myAdded.list);
    const unwatchedCount = useSelector(state => state.notifications?.list?.filter(n => !n.watched).length || 0);
    const [search, setSearch] = useState("");
    const [deleteId, setDeleteId] = useState(null);

    const filtered = properties.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
    );

    const handleConfirmDelete = () => {
        dispatch(removeProperty(deleteId));
        setDeleteId(null);
    };

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
            <View className="flex-row px-5 mt-3 gap-2.5">
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
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <PropertyCard item={item} onDeletePress={setDeleteId} />}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            />

            {/* Delete Confirm Modal */}
            <Modal visible={deleteId !== null} transparent animationType="fade">
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <View className="bg-white rounded-3xl mx-6 px-6 py-8 w-[85%]" style={{ elevation: 10 }}>
                        <Text className="text-[18px] font-roboto-bold text-[#1a1a1a] text-center mb-8">
                            Are you sure you want to{"\n"}delete this item?
                        </Text>
                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                className="flex-1 py-3.5 rounded-2xl items-center justify-center border-2 border-[#4F46E5]"
                                onPress={() => setDeleteId(null)}
                            >
                                <Text className="text-[#4F46E5] text-[15px] font-roboto-bold">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 py-3.5 rounded-2xl items-center justify-center bg-[#E53935]"
                                onPress={handleConfirmDelete}
                            >
                                <Text className="text-white text-[15px] font-roboto-bold">Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
