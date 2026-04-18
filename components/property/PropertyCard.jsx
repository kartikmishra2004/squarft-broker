import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';

const PropertyCard = ({ item, propertyTypeLabel }) => {
    return (
        <Pressable
            className="w-[48%] mb-6"
            onPress={() => router.push({ pathname: "/property-detail", params: { id: item.id } })}
        >
            <View
                className="w-full border border-gray-100"
            style={{
                backgroundColor: 'white',
                borderRadius: 36,
                elevation: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                padding: 10,
            }}
        >
            <View className="relative">
                <Image
                    source={item.image}
                    className="w-full h-[140px] rounded-[26px] border border-gray-100"
                    resizeMode="cover"
                />
                <View className="absolute top-2 right-2 flex-row items-center bg-white/95 px-2 py-0.5 rounded-full shadow-sm">
                    <Ionicons name="eye" size={12} color="black" />
                    <Text className="text-black text-[10px] ml-1 font-lato-bold">{item.views}</Text>
                </View>
            </View>

            <View className="px-1 py-2.5">
                <Text className="text-[13px] font-lato-bold text-[#1F2937] mb-1" numberOfLines={1}>
                    {propertyTypeLabel} {item.category}
                </Text>

                <View className="flex-row items-center mb-1">
                    <Ionicons name="location" size={13} color="#FF7B54" />
                    <Text className="text-[10px] text-[#6B7280] ml-1 font-lato-medium" numberOfLines={1}>{item.location}</Text>
                </View>

                <View className="flex-row items-center justify-between mt-0.5">
                    <View className="flex-row items-center">
                        <Ionicons name="calendar" size={13} color="#FF7B54" />
                        <Text className="text-[10px] text-[#6B7280] ml-1 font-lato-italic">{item.date}</Text>
                    </View>

                    <View className={`flex-row items-center px-2 py-0.5 rounded-full ${item.status === 'approved' ? 'bg-[#159900]' :
                        item.status === 'pending' ? 'bg-[#F2994A]' : 'bg-[#EB5757]'
                        }`}>
                        <View className="w-1 h-1 rounded-full bg-white mr-1" />
                        <Text className="text-[8px] text-white font-lato-bold capitalize">{item.status}</Text>
                    </View>
                </View>
            </View>
        </View>
    </Pressable>
);
};

export default PropertyCard;
