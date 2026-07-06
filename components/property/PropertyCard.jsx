import { View, Text, Image, Pressable } from 'react-native';
import { Ionicons } from "@expo/vector-icons";

const PropertyCard = ({ item, propertyTypeLabel, onPress }) => {
    // Handle different image formats
    const imageSource = item.image 
        ? item.image 
        : item.cover_image 
        ? { uri: item.cover_image }
        : item.cover_image_url
        ? { uri: item.cover_image_url }
        : item.media?.find(m => m.is_cover)?.url
        ? { uri: item.media.find(m => m.is_cover).url }
        : require('../../assets/images/Image.png'); // fallback image

    // Handle title
    const title = item.title || item.name || 'Property';
    
    // Handle location
    const location = item.location || `${item.area || ''}, ${item.city || ''}`.trim().replace(/^,\s*/, '') || 'Location';
    
    // Handle date
    const date = item.date || new Date(item.created_at || Date.now()).toLocaleDateString();
    
    // 🔄 FIXED: Strictly check the 'approval_status' column values exclusively
    const rawStatus = String(item.approval_status || '').trim().toLowerCase();
    
    let status = 'Pending'; // Default state if it's empty or processing
    if (rawStatus === 'approved') {
        status = 'Approved';
    } else if (rawStatus === 'not approved' || rawStatus === 'rejected') {
        status = 'Not Approved';
    } else if (rawStatus === 'pending') {
        status = 'Pending';
    } else if (rawStatus === '') {
        status = 'N/A'; // Keeps your baseline fallback clean if columns are unpopulated
    } else {
        // Fallback for any other custom string the backend might pass (e.g., "In Review")
        status = item.approval_status; 
    }
    
    // Handle views - check multiple possible fields
    const views = item.views || item.view_count || item.total_views || item.users_seen_count || item.seen_count || item.unique_view_count || 0;

    return (
        <Pressable
            className="w-[48.5%] mb-6"
            onPress={() => onPress?.(item)}
        >
            <View
                className="w-full border border-gray-100 rounded-[30px]"
                style={{
                    backgroundColor: 'white',
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    padding: 8,
                }}
            >
                <View className="relative">
                    <Image
                        source={imageSource}
                        className="w-full h-[140px] rounded-[30px] border border-gray-100"
                        resizeMode="cover"
                    />
                    <View className="absolute top-3 right-3 flex-row items-center bg-white/95 px-2 py-0.5 rounded-full shadow-sm">
                        <Ionicons name="eye" size={12} color="black" />
                        <Text className="text-black text-[10px] ml-1 font-lato-bold">{views}</Text>
                    </View>
                </View>

                <View className="px-1 py-2.5">
                    <Text className="text-[14px] font-manrope-extrabold text-[#333333] mb-1" numberOfLines={1}>
                        {title}
                    </Text>

                    <View className="flex-row items-center mb-1">
                        <Ionicons name="location" size={13} color="#FF7B54" />
                        <Text className="text-[11px] text-[#393030] ml-1 font-lato-medium" numberOfLines={1}>{location}</Text>
                    </View>

                    <View className="flex-row items-center justify-between mt-0.5">
                        <View className="flex-row items-center">
                            <Ionicons name="calendar" size={13} color="#FF7B54" />
                            <Text className="text-[11px] text-[#393030] ml-1 font-lato-italic">{date}</Text>
                        </View>

                        <View className={`flex-row items-center px-2 py-1 rounded-full ${
                            status === 'Approved' ? 'bg-[#1E9500]' :
                            status === 'Not Approved' ? 'bg-[#EB5757]' : 
                            'bg-[#F2994A]'
                        }`}>
                            <View className="w-1 h-1 rounded-full bg-white mr-1" />
                            <Text className="text-[8px] text-white font-lato-bold">{status}</Text>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    );
};

export default PropertyCard;