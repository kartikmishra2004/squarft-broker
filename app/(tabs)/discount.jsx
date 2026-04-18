import { View, Text, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useRouter } from "expo-router";

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
    const router = useRouter();
    const [search, setSearch] = useState("");

    const filtered = DUMMY_DATA.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.location.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View className="flex-1 bg-[#FFF]" style={{ paddingTop: insets.top }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3">
                <TouchableOpacity className="w-9 h-9 rounded-xl items-center justify-center" onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={26} color="#333" />
                </TouchableOpacity>
                <Text className="text-[17px] font-lato-bold text-[#1a1a1a]">Commission History</Text>
                <TouchableOpacity className="w-9 h-9 rounded-xl items-center justify-center">
                    <Ionicons name="notifications" size={22} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="flex-row items-center px-4 mt-4 mb-3 gap-1.5 h-[42px]">
                <View className="flex-1 flex-row items-center bg-[#EBF1FF]/70 rounded-xl px-3">
                    <Ionicons name="search-outline" size={18} color="#aaa" />
                    <TextInput
                        placeholder="Search"
                        placeholderTextColor="#aaa"
                        value={search}
                        onChangeText={setSearch}
                        className="flex-1 ml-1.5 text-[14px] text-[#333]"
                    />
                </View>
                <TouchableOpacity className="w-[42px] rounded-xl bg-[#EEF0FF]/70 items-center justify-center h-[42px]">
                    <Ionicons name="options-outline" size={20} color="#4F46E5" />
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
