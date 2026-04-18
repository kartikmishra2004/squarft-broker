import { View, Text, FlatList, TextInput, TouchableOpacity, StatusBar, Platform } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";

const DUMMY_DATA = [
    { id: 1, title: "Sunset Villa", location: "Mahalakshmi Nagar, Indore", price: 2510000, commission: 5, earned: 125000, date: "Mar 15, 2025", status: "Paid" },
    { id: 2, title: "Fully Furnished 1 bhk Flat", location: "Mahalakshmi Nagar, Indore", price: 3050000, commission: 5, earned: 325000, date: "Mar 15, 2025", status: "Paid" },
    { id: 3, title: "2 BHK Apartment", location: "Vijay Nagar, Indore", price: 4500000, commission: 3, earned: 135000, date: "Apr 2, 2025", status: "Pending" },
];

function CommissionCard({ item }) {
    const isPaid = item.status === "Paid";
    return (
        <View className="bg-white rounded-2xl mb-4 px-4 py-4" style={{ elevation: 3, shadowColor: "#6B7280", shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.15, shadowRadius: 6 }}>
            <View className="flex-row items-start justify-between mb-1">
                <Text className="text-[15px] font-lato-bold text-[#1a1a1a] flex-1 mr-2" numberOfLines={1}>{item.title}</Text>
                <View className={`px-5 py-0.5 rounded-full ${isPaid ? "bg-[#1E9500]" : "bg-[#FFC107]"}`}>
                    <Text className="text-white text-[10px] font-roboto-medium">{item.status}</Text>
                </View>
            </View>
            <View className="flex-row items-center mb-5 mt-1">
                <FontAwesome6 name="location-dot" size={15} color="#4A43EC" />
                <Text className="text-[12px] text-gray-500 ml-2 font-lato">{item.location}</Text>
            </View>
            <View className="flex-row items-center justify-between">
                <Text className="text-[16px] font-roboto-regular tracking-wide text-[#4F46E5]">₹{item.price.toLocaleString("en-IN")}</Text>
                <Text className="text-[16px] font-roboto-medium text-[#1E9500]">{item.commission}%</Text>
            </View>
            <View className="flex-row items-center justify-between mt-1">
                <Text className="text-[16px] font-lato-medium text-[#1E9500]">₹{item.earned.toLocaleString("en-IN")}</Text>
                <Text className="text-[12px] text-gray-400 font-roboto italic">{item.date}</Text>
            </View>
        </View>
    );
}

export default function Discount() {
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();
    const router = useRouter();
    const unwatchedCount = useSelector(state => state.notifications?.list?.filter(n => !n.watched).length || 0);
    const [search, setSearch] = useState("");

    const filtered = DUMMY_DATA.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pb-3" style={{ paddingTop: insets.top + 8 }}>
                <View />
                <Text className="text-[16px] text-black font-lato-bold ml-8">Commission History</Text>
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
                renderItem={({ item }) => <CommissionCard item={item} />}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}
