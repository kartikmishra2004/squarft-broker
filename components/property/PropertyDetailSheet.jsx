import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import ZoomableImage from "./ZoomableImage";

const naksha = require("../../assets/images/building_naksha.png");

const { width } = Dimensions.get("window");

const AMENITY_ICONS = {
  Gymnasium: { icon: "dumbbell", color: "#4A43EC" },
  "Swimming Pool": { icon: "pool", color: "#4A43EC" },
  "24/7 Security": { icon: "shield-check-outline", color: "#4A43EC" },
  "Power Backup": { icon: "lightning-bolt", color: "#4A43EC" },
  Landscaping: { icon: "tree-outline", color: "#4A43EC" },
  "Car Parking": { icon: "car-outline", color: "#4A43EC" },
  "Sports Court": { icon: "tennis", color: "#4A43EC" },
  "Wi-Fi Zone": { icon: "wifi", color: "#4A43EC" },
  Clubhouse: { icon: "home-group", color: "#4A43EC" },
  Garden: { icon: "flower-outline", color: "#4A43EC" },
};

function AmenityItem({ label }) {
  const config = AMENITY_ICONS[label] ?? {
    icon: "star-outline",
    color: "#4A43EC",
  };
  return (
    <View className="flex-row items-center gap-3 w-[50%] mb-4">
      <View className="w-10 h-10 rounded-[14px] bg-[#F1F3FF] items-center justify-center">
        <MaterialCommunityIcons
          name={config.icon}
          size={18}
          color={config.color}
        />
      </View>
      <Text className="text-[13px] font-manrope-medium text-[#101010] flex-1">
        {label}
      </Text>
    </View>
  );
}

const firstValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
};

const formatTextValue = (value, fallback = "N/A") => {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value)
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatReaStatus = (value) => {
  if (value === undefined || value === null || value === "") return "N/A";
  if (typeof value === "boolean") return value ? "Approved" : "Not Approved";

  const normalized = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "approved" || normalized === "yes" || normalized === "true") return "Approved";
  if (
    normalized === "not_approved" ||
    normalized === "unapproved" ||
    normalized === "no" ||
    normalized === "false"
  ) {
    return "Not Approved";
  }
  return formatTextValue(value);
};

const normalizeAmenities = (item) => {
  const raw = firstValue(item, [
    "amenities",
    "world_class_amenities",
    "worldClassAmenities",
    "admin_amenities",
  ]);

  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map((amenity) => {
        if (typeof amenity === "string") return amenity;
        return amenity?.name || amenity?.label || amenity?.title || amenity?.amenity_name;
      })
      .filter(Boolean);
  }

  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return normalizeAmenities({ amenities: parsed });
    } catch {
      // Plain comma-separated amenities are also supported.
    }

    return raw.split(",").map((amenity) => amenity.trim()).filter(Boolean);
  }

  return [];
};

const getInitials = (name) => {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "--";
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join("");
};

const getFollowUpStyles = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized.includes("visit") || normalized.includes("pending")) {
    return { statusColor: "#FE8A71", statusBg: "#FFF1EF" };
  }
  return { statusColor: "#4A43EC", statusBg: "#F1F3FF" };
};

const normalizeFollowUps = (item) => {
  const raw = firstValue(item, [
    "follow_ups",
    "followups",
    "followUps",
    "admin_follow_ups",
    "adminFollowUps",
  ]);

  if (!Array.isArray(raw)) return [];

  return raw.map((followUp, index) => {
    const customerName = firstValue(followUp, [
      "customerName",
      "customer_name",
      "client_name",
      "lead_name",
      "name",
    ]) || "Customer";
    const salesOfficer = firstValue(followUp, [
      "salesOfficer",
      "sales_officer",
      "assigned_to_name",
      "officer_name",
      "broker_name",
    ]) || "Unassigned";
    const status = firstValue(followUp, ["status", "stage", "lead_status"]) || "Follow Up";
    const styles = getFollowUpStyles(status);

    return {
      id: firstValue(followUp, ["id", "follow_up_id", "lead_id"]) || String(index),
      status,
      statusColor: followUp.statusColor || followUp.status_color || styles.statusColor,
      statusBg: followUp.statusBg || followUp.status_bg || styles.statusBg,
      unit: firstValue(followUp, ["unit", "unit_no", "unit_number", "property_unit"]) || "Unit not set",
      customerName,
      nextEvent: firstValue(followUp, [
        "nextEvent",
        "next_event",
        "next_follow_up",
        "next_followup",
        "next_payment",
        "event_label",
      ]) || "Next action not set",
      salesOfficer,
      officerInitials: firstValue(followUp, ["officerInitials", "officer_initials"]) || getInitials(salesOfficer),
    };
  });
};

export default function PropertyDetailSheet({
  visible,
  onClose,
  item,
  loading = false,
}) {
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["99%"], []);
  
  const floorPlanVisible = false;
  const [zoomVisible, setZoomVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("detail"); 

  useEffect(() => {
    if (visible) {
      bottomSheetModalRef.current?.present();
    } else {
      bottomSheetModalRef.current?.dismiss();
    }
  }, [visible]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
      />
    ),
    []
  );

  if (!item) return null;

  const amenitiesList = normalizeAmenities(item);
  const followUps = normalizeFollowUps(item);
  const propertySubtype = formatTextValue(firstValue(item, [
    "property_sub_type",
    "property_subtype",
    "property_subtype_name",
    "sub_type",
    "subtype",
    "property_type",
  ]));
  const reaStatus = formatReaStatus(firstValue(item, [
    "rea_status",
    "reaStatus",
    "rea_approval_status",
    "rea_approved",
    "is_rea_approved",
  ]));
  const views = firstValue(item, [
    "views",
    "view_count",
    "total_views",
    "users_seen_count",
    "seen_count",
    "unique_view_count",
  ]);

  // Handle different price formats from API
  const getFormattedPrice = () => {
    // Check if price exists and is a number (dummy data)
    if (item.price && typeof item.price === 'number') {
      return `₹${item.price.toLocaleString("en-IN")}/m`;
    }
    
    // Use base_price as fallback if min_price/max_price are not set
    const basePrice = item.base_price || 0;
    const priceFrom = item.price_from || item.min_price || basePrice;
    const priceTo = item.price_to || item.max_price || basePrice;
    
    // Check for range pricing
    if (priceTo > priceFrom) {
      return `₹${(priceFrom / 100000).toFixed(2)}L - ₹${(priceTo / 100000).toFixed(2)}L`;
    }
    // Single price value
    if (basePrice > 0) {
      return `₹${(basePrice / 100000).toFixed(2)}L`;
    }
    return 'Price on request';
  };

  const priceFormatted = getFormattedPrice();

  // Get image source - handle both dummy data and API data
  const getImageSource = () => {
    // If item.image is already a require() object (dummy data)
    if (item.image && typeof item.image === 'number') {
      return item.image;
    }
    // If item has media array (API data)
    if (item.media && item.media.length > 0) {
      const coverImage = item.media.find(m => m.is_cover && m.media_type === 'image');
      if (coverImage) return { uri: coverImage.url };
      const firstImage = item.media.find(m => m.media_type === 'image');
      if (firstImage) return { uri: firstImage.url };
    }
    // If item has cover_image_url (API data)
    if (item.cover_image_url) {
      return { uri: item.cover_image_url };
    }
    // Fallback to item.image if it's a URI string
    if (item.image && typeof item.image === 'string') {
      return { uri: item.image };
    }
    // Default fallback
    return item.image || require("../../assets/images/home/hero.png");
  };

  const imageSource = getImageSource();

  return (
    <>
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={onClose}
        backdropComponent={renderBackdrop}
        handleComponent={() => (
          <View className="items-center pt-4 pb-6">
            <View className="w-20 h-1.5 bg-gray-300 rounded-full" />
          </View>
        )}
        backgroundStyle={{ borderRadius: 28 }}
      >
        <View style={{ flex: 1 }}>
          {activeTab === "followup" && (
            <View className="items-center py-3 ">
              <Text className="text-[16px] font-manrope-bold text-[#0F172A] mb-6">Follow Up</Text>
            </View>
          )}

          {activeTab === "detail" ? (
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              className="mx-5 rounded-2xl mb-14 border border-gray-300"
              contentContainerStyle={{ paddingBottom: 16 }}
            >
              {/* Hero Image Section */}
              <View style={{ height: 145, overflow: "hidden" }}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                  <Image
                    source={imageSource}
                    style={{ flex: 1.4, height: 145 }}
                    resizeMode="cover"
                  />
                  <View style={{ width: 2, backgroundColor: "#fff" }} />
                  <View style={{ flex: 1, height: 145, position: "relative" }}>
                    <Image
                      source={imageSource}
                      style={{ width: "100%", height: "100%", opacity: 0.9 }}
                      resizeMode="cover"
                    />
                    <View
                      style={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        backgroundColor: "rgba(0,0,0,0.55)",
                        borderRadius: 6,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>1/8</Text>
                    </View>
                  </View>
                </View>

                {/* Verified Badge */}
                <View
                  style={{
                    position: "absolute",
                    top: 12,
                    left: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#fff",
                    borderRadius: 30,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    gap: 3,
                    shadowColor: "#000",
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <MaterialCommunityIcons name="check-decagram" size={16} color="#0052CC" />
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#0052CC", letterSpacing: 0.2 }}>SQUARFT VERIFIED</Text>
                </View>

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    borderRadius: 20,
                    padding: 6,
                  }}
                >
            
                </TouchableOpacity>
              </View>

              {/* Header Details */}
              <View className="flex-row items-center gap-5 mx-5 mt-3 mb-3.5">
                <Text className="text-[12px] font-manrope-regular text-gray-500">Possession: Immediate</Text>
                <Text className="text-[12px] font-manrope-regular text-gray-500">• Status: {item.status || "Active"}</Text>
              </View>

              <View style={{ marginHorizontal: 20, marginBottom: 9, borderBottomWidth: 1, borderBottomColor: "#D1D5DB", borderStyle: "dashed" }} />

              {/* BHK & Price */}
              <View className="mx-5 mb-2">
                <View className="flex-row items-center justify-between mb-2">
                  <View>
                    <Text className="text-[12px] font-manrope-bold text-gray-500 uppercase">{item.category || "Apartment"}</Text>
                    <Text className="text-[16px] font-manrope-extrabold text-[#0F172A]">{item.title || item.name || 'Property'}</Text>
                    <Text className="text-[15px] font-manrope-bold text-[#4A43EC] mt-0.5">{priceFormatted}</Text>
                  </View>
              
                </View>

                {floorPlanVisible && (
                  <View className="mt-2 rounded-2xl overflow-hidden bg-[#F8FAFC] items-center py-5" style={{ borderWidth: 1, borderColor: "#E0E8FF" }}>
                    <TouchableOpacity onPress={() => setZoomVisible(true)} activeOpacity={0.85}>
                      <Image source={naksha} style={{ width: width * 0.75, height: 200 }} resizeMode="contain" />
                      <View style={{ position: "absolute", bottom: 6, right: 6, backgroundColor: "rgba(0,0,0,0.45)", borderRadius: 12, padding: 5 }}>
                        <MaterialCommunityIcons name="magnify-plus-outline" size={16} color="#fff" />
                      </View>
                    </TouchableOpacity>
                    <Text className="text-[11px] font-manrope-regular text-gray-400 mt-2">{propertySubtype} · {item.areaSqft || item.area} sq.ft.</Text>
                  </View>
                )}
              </View>

              {/* Stats Grid */}
              <View className="flex-row flex-wrap mx-4 justify-between mb-3 mt-4">
                {[
                  { label: "AREA", value: `${item.total_area_sqft || item.areaSqft || item.total_aRERA|| 'N/A'} sqft` },
                  { label: "PROPERTY SUB-TYPE", value: propertySubtype },
                  { label: "RERA STATUS", value: reaStatus },
                  { label: "VIEWS", value: views ?? "0" },
                ].map((stat) => (
                  <View
                    key={stat.label}
                    className="bg-[#F1F3FF] border border-[#E0E8FF] rounded-2xl p-4 py-4 mb-4"
                    style={{ width: (width - 68) / 2 - 6 }}
                  >
                    <Text className="text-[10px] font-manrope-bold text-gray-400 tracking-widest">{stat.label}</Text>
                    <Text className="text-[16px] font-manrope-bold text-[#041B3C]">{stat.value}</Text>
                  </View>
                ))}
              </View>

              {/* Amenities Section */}
              <View className="mx-4 bg-white border border-gray-100 rounded-2xl p-4 px-5 mb-2">
                <Text className="text-[15px] font-manrope-regular text-[#1A1A1A] mb-4">World-Class Amenities</Text>
                {loading ? (
                  <View className="py-5 items-center">
                    <ActivityIndicator size="small" color="#4A43EC" />
                  </View>
                ) : amenitiesList.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {amenitiesList.map((a, i) => (
                      <AmenityItem key={`${a}-${i}`} label={a} />
                    ))}
                  </View>
                ) : (
                  <Text className="text-[12px] font-manrope-medium text-gray-400">No amenities added from admin yet.</Text>
                )}
              </View>
            </BottomSheetScrollView>
          ) : (
            <BottomSheetScrollView
              showsVerticalScrollIndicator={false}
              className="mx-5 mb-5"
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {loading ? (
                <View className="py-10 items-center">
                  <ActivityIndicator size="small" color="#4A43EC" />
                  <Text className="text-[12px] font-manrope-medium text-gray-400 mt-3">Loading follow ups...</Text>
                </View>
              ) : followUps.length > 0 ? (
                followUps.map((f) => (
                  <View key={f.id} className="bg-white border border-gray-100 rounded-[18px] p-4 mb-3" style={{ elevation: 1, shadowColor: '#8d8c8cff', shadowOpacity: 0.03, shadowRadius: 2 }}>
                    <View className="flex-row items-center justify-between mb-2">
                      <View className="flex-row items-center gap-2">
                        <View className="px-2.5 py-0.5 rounded-full" style={{ backgroundColor: f.statusBg }}>
                          <Text className="text-[9px] font-manrope-bold" style={{ color: f.statusColor }}>{f.status}</Text>
                        </View>
                        <Text className="text-[10px] font-manrope-bold text-gray-400">{f.unit}</Text>
                      </View>
                    </View>

                    <Text className="text-[14px] font-manrope-extrabold text-[#0F172A]">{f.customerName}</Text>
                    <Text className="text-[10px] font-manrope-medium text-gray-500 mt-0.5">{f.nextEvent}</Text>

                    <View className="h-[1px] bg-gray-200 w-full my-3" />

                    <Text className="text-[9px] font-manrope-bold text-gray-600 uppercase mb-1.5">Sales Officer</Text>
                    <View className="flex-row items-center gap-2.5">
                      <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center border border-gray-400">
                        <Text className="text-[10px] font-manrope-bold text-gray-800 ">{f.officerInitials}</Text>
                      </View>
                      <Text className="text-[12px] font-manrope-bold text-[#333]">{f.salesOfficer}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <View className="py-10 items-center px-6">
                  <Feather name="clipboard" size={34} color="#CBD5E1" />
                  <Text className="text-[13px] font-manrope-bold text-[#64748B] mt-3 text-center">No follow ups added yet</Text>
                  <Text className="text-[11px] font-manrope-medium text-gray-400 mt-1 text-center">
                    Follow-up details will appear here once admin sends them.
                  </Text>
                </View>
              )}
            </BottomSheetScrollView>
          )}

          {/* Footer Tabs */}
          <View className="px-5 pt-3 pb-8 flex-row gap-3 border-t border-gray-100 bg-white">
            <TouchableOpacity
              onPress={() => setActiveTab("detail")}
              className="flex-1 rounded-2xl py-4 items-center justify-center"
              style={{ 
                backgroundColor: activeTab === "detail" ? "#4A43EC" : "#fff", 
                borderWidth: 1, 
                borderColor: activeTab === "detail" ? "#4A43EC" : "#E2E8F0" 
              }}
            >
              <Text className="text-[14px] font-manrope-bold" style={{ color: activeTab === "detail" ? "#fff" : "#4A43EC" }}>Property Detail</Text>
            </TouchableOpacity>
       <TouchableOpacity
              onPress={() => setActiveTab("followup")}
              className="flex-1 rounded-2xl py-4 items-center justify-center"
              style={{ 
                backgroundColor: activeTab === "followup" ? "#4A43EC" : "#fff", 
                borderWidth: 1, 
                borderColor: activeTab === "followup" ? "#4A43EC" : "#E2E8F0" 
              }}
            >
              <Text className="text-[14px] font-manrope-bold" style={{ color: activeTab === "followup" ? "#fff" : "#4A43EC" }}>Follow Ups</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>

      <ZoomableImage
        visible={zoomVisible}
        onClose={() => setZoomVisible(false)}
        source={naksha}
      />
    </>
  );
}
