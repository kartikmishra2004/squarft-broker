import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from "@gorhom/bottom-sheet";

const { width } = Dimensions.get("window");

const steps = [
    { id: 1, title: "Basic Details" },
    { id: 2, title: "Owner Detail" },
    { id: 3, title: "Property Detail" },
    { id: 4, title: "Image & Price" },
];

const mainTypes = [
    {
        id: "residential",
        label: "Residential",
        image: require("../../assets/icons/property-types/House2.png"),
        cloudImage: require("../../assets/icons/property-types/Clouds.png"),
    },
    {
        id: "commercial",
        label: "Commercial",
        image: require("../../assets/icons/property-types/commercial.png"),
    },
];

const subTypesData = {
    residential: [
        { id: "plot", label: "Plot", image: require("../../assets/icons/property-types/plot.png") },
        { id: "villa", label: "Villa", image: require("../../assets/icons/property-types/villa.png") },
        { id: "apartment", label: "Apartment", image: require("../../assets/icons/property-types/apartment.png") },
        { id: "rowhouse", label: "Rowhouse", image: require("../../assets/icons/property-types/rowhouse.png") },
    ],
    commercial: [
        { id: "shop", label: "Shop", image: require("../../assets/icons/property-types/Shop.png") },
        { id: "showroom", label: "Showroom", image: require("../../assets/icons/property-types/showroom.png") },
        { id: "office", label: "Office", image: require("../../assets/icons/property-types/office.png") },
    ]
};

const propertyKinds = [
    { id: "ready", label: "Ready To Move" },
    { id: "bare", label: "Bare Shell" },
    { id: "coworking", label: "Co-Working" },
];

const bhkOptions = [
    { id: "1bhk", label: "1 BHK" },
    { id: "2bhk", label: "2 BHK" },
    { id: "3bhk", label: "3 BHK" },
    { id: "4bhk", label: "4 BHK" },
    { id: "5bhk", label: "5 BHK" },
    { id: "6bhk", label: "5 BHK+" },
];

const bhkSubTypes = ["plot", "villa", "apartment", "rowhouse"];

const areaUnits = [
    { id: "sqft",     label: "Square Feet (sq ft)", short: "sq ft" },
    { id: "sqm",      label: "Square Meter (sq m)", short: "sq m" },
    { id: "acre",     label: "Acre",                short: "Acre" },
    { id: "hectare",  label: "Hectare",             short: "Hect" },
    { id: "sqyard",   label: "Square Yard (gaj)",   short: "Gaj"  },
    { id: "bigha",    label: "Bigha",               short: "Bigh" },
    { id: "biswa",    label: "Biswa",               short: "Bisw" },
    { id: "katha",    label: "Katha / Kattha",      short: "Kath" },
    { id: "guntha",   label: "Guntha",              short: "Gunt" },
    { id: "cent",     label: "Cent",                short: "Cent" },
    { id: "kanal",    label: "Kanal",               short: "Kana" },
    { id: "marla",    label: "Marla",               short: "Marl" },
    { id: "ankanam",  label: "Ankanam",             short: "Anka" },
    { id: "decimal",  label: "Decimal",             short: "Deci" },
];

export default function AddProject() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedMainType, setSelectedMainType] = useState(null);
    const [selectedSubType, setSelectedSubType] = useState(null);
    const [selectedKind, setSelectedKind] = useState("ready");
    const [selectedBhk, setSelectedBhk] = useState("1bhk");
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const [paymentMode, setPaymentMode] = useState("full");
    const [priceNegotiable, setPriceNegotiable] = useState(false);
    const [taxExclude, setTaxExclude] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [otp, setOtp] = useState(["", "", "", ""]);
    const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

    // Area unit state
    const [totalAreaUnit, setTotalAreaUnit] = useState(areaUnits[0]);
    const [carpetAreaUnit, setCarpetAreaUnit] = useState(areaUnits[0]);
    const [activeUnitTarget, setActiveUnitTarget] = useState(null); // 'total' | 'carpet'
    const unitSheetRef = useRef(null);
    const uploadSheetRef = useRef(null);

    const openUnitSheet = useCallback((target) => {
        setActiveUnitTarget(target);
        unitSheetRef.current?.present();
    }, []);

    const selectUnit = useCallback((unit) => {
        if (activeUnitTarget === "total") setTotalAreaUnit(unit);
        else setCarpetAreaUnit(unit);
        unitSheetRef.current?.dismiss();
    }, [activeUnitTarget]);

    const renderBackdrop = useCallback((props) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
    ), []);

    // Upload state
    const [pickerModal, setPickerModal] = useState(null); // null | 'image' | 'document'
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedDocs, setUploadedDocs] = useState([]);

    const requestPermission = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        return status === "granted";
    };

    const pickFromGallery = async () => {
        if (pickerModal === "document") {
            const result = await DocumentPicker.getDocumentAsync({
                type: "*/*",
                multiple: true,
                copyToCacheDirectory: true,
            });
            uploadSheetRef.current?.dismiss();
            setPickerModal(null);
            if (!result.canceled) {
                setUploadedDocs(prev => [...prev, ...result.assets]);
            }
            return;
        }
        const granted = await requestPermission();
        if (!granted) return;
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
        });
        uploadSheetRef.current?.dismiss();
        setPickerModal(null);
        if (!result.canceled) {
            setUploadedImages(prev => [...prev, ...result.assets]);
        }
    };

    const pickFromCamera = async () => {
        if (pickerModal === "document") return; // no camera for documents
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") return;
        const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
        uploadSheetRef.current?.dismiss();
        setPickerModal(null);
        if (!result.canceled) {
            setUploadedImages(prev => [...prev, ...result.assets]);
        }
    };

    const handleOtpChange = (text, index) => {
        const newOtp = [...otp];
        newOtp[index] = text;
        setOtp(newOtp);
        if (text && index < 3) {
            otpRefs[index + 1].current?.focus();
        }
    };

    const handleOtpKeyPress = (e, index) => {
        if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
            otpRefs[index - 1].current?.focus();
        }
    };

    const subTypes = selectedMainType ? (subTypesData[selectedMainType] || []) : [];
    const showBhk = selectedMainType === "residential" && selectedSubType && bhkSubTypes.includes(selectedSubType);
    const showKind = selectedMainType === "commercial" && selectedSubType === "office";

    // Step 1 is valid when:
    // - residential: a sub-type is selected
    // - commercial shop/showroom: sub-type selected (no further options needed)
    // - commercial office: sub-type + kind selected
    const step1Valid = selectedMainType === "residential"
        ? !!selectedSubType
        : selectedMainType === "commercial"
            ? selectedSubType === "office" ? !!selectedKind : !!selectedSubType
            : false;

    useEffect(() => {
        setSelectedSubType(null);
    }, [selectedMainType]);

    useEffect(() => {
        setSelectedBhk("1bhk");
        setSelectedKind("ready");
    }, [selectedSubType]);

    const scrollRef = useRef(null);

    useEffect(() => {

        setHasScrolledToBottom(false);
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [currentStep]);

    const handleScroll = ({ nativeEvent }) => {
        const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
        const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
        setHasScrolledToBottom(isAtBottom);
    };

    return (
        <View className="flex-1 bg-[#F8F9FE]">
            <StatusBar barStyle="light-content" />

                {/* Header Section */}
                <View className="bg-[#4A43EC] pt-12 pb-8 px-5 relative overflow-hidden">
                    {/* Dual Tone Decorative Circle */}
                    <View
                        style={{
                            position: "absolute",
                            right: -width * 0.5,
                            top: -width * 0.25,
                            width: width * 0.85,
                            height: width * 0.85,
                            borderRadius: width * 0.4,
                            backgroundColor: "#3D36C7",
                            opacity: 0.5
                        }}
                    />

                    <View className="flex-row items-center mt-6 justify-between mb-8">
                        <TouchableOpacity
                            onPress={() => {
                                if (currentStep > 1) {
                                    setCurrentStep(prev => prev - 1);
                                } else {
                                    router.back();
                                }
                            }}
                            className="p-1"
                        >
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </TouchableOpacity>
                        <Text className="text-white text-base font-lato-bold">Add Project</Text>
                        <View style={{ width: 20 }} />
                    </View>

                    {/* Step Indicator */}
                    <View className="flex-row justify-between items-start mt-8">
                        {steps.map((step, index) => (
                            <View key={step.id} className="items-center" style={{ width: (width - 40) / 4 }}>
                                <View
                                    className={`w-7 h-7 rounded-full items-center justify-center mb-1.5 ${currentStep === step.id ? 'bg-white' : 'bg-transparent border border-white/40'
                                        }`}
                                >
                                    <Text className={`text-xs font-lato-bold ${currentStep === step.id ? 'text-[#4A43EC]' : 'text-white/60'
                                        }`}>
                                        {step.id}
                                    </Text>
                                </View>
                                <Text className={`text-[8px] text-center font-lato-medium ${currentStep === step.id ? 'text-white' : 'text-white/60'
                                    }`} numberOfLines={1}>
                                    {step.title}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Content Section */}
                <View className="flex-1 bg-white -mt-5 rounded-t-[20px] overflow-hidden">
                    <ScrollView
                        ref={scrollRef}
                        className="flex-1 px-5 pt-6"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        keyboardShouldPersistTaps="handled"
                    >
                        {currentStep === 1 ? (
                            <>
                                {/* Main Property Type */}
                                <Text className="text-sm font-lato-bold text-black mb-3">Property Type</Text>
                                <View className="flex-row justify-between mb-8">
                                    {mainTypes.map((type) => (
                                        <TouchableOpacity
                                            key={type.id}
                                            onPress={() => setSelectedMainType(type.id)}
                                            style={{ width: (width - 50) / 2 }}
                                            className={`bg-white rounded-xl h-28 border ${selectedMainType === type.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-gray-100'
                                                } shadow-sm relative overflow-hidden`}
                                        >
                                            <Text className="text-xs font-lato-bold text-black absolute top-2.5 left-2.5 z-10">{type.label}</Text>

                                            <View className="flex-1 justify-end items-end">
                                                {type.cloudImage && (
                                                    <Image
                                                        source={type.cloudImage}
                                                        className="absolute top-0 right-3 w-20 h-14 opacity-60"
                                                        resizeMode="contain"
                                                    />
                                                )}
                                                <Image
                                                    source={type.image}
                                                    className="w-[80%] h-[70%] mt-auto"
                                                    resizeMode="contain"
                                                    style={{ marginBottom: -2, marginRight: -4 }}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {selectedMainType && (
                                    <>
                                        <Text className="text-sm font-lato-bold text-black mb-3">Property Type</Text>
                                        <View className="flex-row gap-3">
                                            {subTypes.map((type) => (
                                                <TouchableOpacity
                                                    key={type.id}
                                                    onPress={() => setSelectedSubType(type.id)}
                                                    style={{ width: (width - 64) / 4 }}
                                                    className={`bg-white rounded-lg h-20 border ${selectedSubType === type.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-gray-100'
                                                        } shadow-sm items-center overflow-hidden`}
                                                >
                                                    <Text className={`text-[9px] font-lato-bold mt-1.5 mb-0.5 ${selectedSubType === type.id ? 'text-[#4A43EC]' : 'text-black'}`} numberOfLines={1}>{type.label}</Text>
                                                    <View className="flex-1 w-full justify-end">
                                                        <Image
                                                            source={type.image}
                                                            className="w-full h-[80%]"
                                                            resizeMode="contain"
                                                            style={{ marginBottom: -1 }}
                                                        />
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </>
                                )}

                               
                                {showBhk && (
                                    <>
                                        <Text className="text-sm font-lato-bold text-black mt-8 mb-3">what kind of property?</Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {bhkOptions.map((bhk) => (
                                                <TouchableOpacity
                                                    key={bhk.id}
                                                    onPress={() => setSelectedBhk(bhk.id)}
                                                    className={`py-3 rounded-lg border items-center justify-center ${selectedBhk === bhk.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-[#fff] bg-white'}`}
                                                    style={{ width: (width - 60) / 3, }}
                                                >
                                                    <Text className={`text-[10px] font-lato-bold text-center ${selectedBhk === bhk.id ? 'text-[#4A43EC]' : 'text-gray-600'}`}>
                                                        {bhk.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </>
                                )}

                                {/* Property Kind - Commercial only */}
                                {showKind && (
                                    <>
                                        <Text className="text-sm font-lato-bold text-black mt-8 mb-3"> of property?</Text>
                                        <View className="flex-row justify-between gap-2">
                                            {propertyKinds.map((kind) => (
                                                <TouchableOpacity
                                                    key={kind.id}
                                                    onPress={() => setSelectedKind(kind.id)}
                                                    className={`flex-1 py-3 px-1 rounded-lg border items-center justify-center ${selectedKind === kind.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-zinc-300 bg-white'}`}
                                                    style={{ elevation: 2 }}
                                                >
                                                    <Text className={`text-[10px] font-lato-bold text-center ${selectedKind === kind.id ? 'text-[#4A43EC]' : 'text-gray-600'}`}>
                                                        {kind.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </>
                                )}

                                {/* Next Button */}
                                <View className="mt-16 mb-4">
                                    <TouchableOpacity
                                        className="py-4 rounded-xl items-center"
                                        style={{ backgroundColor: step1Valid ? "#4A43EC" : "#C5C3F5" }}
                                        activeOpacity={step1Valid ? 0.8 : 1}
                                        onPress={() => { if (step1Valid) setCurrentStep(prev => prev + 1); }}
                                    >
                                        <Text className="text-white text-sm font-lato-bold">Next</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        ) : currentStep === 2 ? (
                            <View className="gap-7 pt-2">
                                {/* Owner Name */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-3">Owner Name</Text>
                                    <TextInput
                                        className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-sm text-gray-800 font-lato-medium"
                                        placeholder="Enter Owner Name"
                                        placeholderTextColor="#c0c0c0ff"
                                    />
                                </View>

                                {/* Owner Contact No. */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-3">Owner Contact No.</Text>
                                    <View className="flex-row bg-white border border-gray-300 rounded-xl px-4 py-1 items-center">
                                        <TextInput
                                            className="flex-1 text-sm text-gray-800 font-lato-medium"
                                            placeholder="eg. 8120180101"
                                            placeholderTextColor="#C0C0C0"
                                            keyboardType="phone-pad"
                                        />
                                        <TouchableOpacity>
                                            <Text className="text-xs font-lato-bold text-[#4A43EC]">Send / Resend OTP</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Enter OTP */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-4">Enter OTP</Text>
                                    <View className="flex-row flex-row gap-9 ml-4">
                                        {[0, 1, 2, 3].map((i) => (
                                            <View
                                                key={i}
                                                className="bg-white border border-gray-200 rounded-xl items-center justify-center"
                                                style={{ width: (width - 160) / 4, height: (width - 160) / 4 }}
                                            >
                                                <TextInput
                                                    ref={otpRefs[i]}
                                                    className="text-xl font-lato-medium text-black text-center w-full h-full"
                                                    maxLength={1}
                                                    keyboardType="number-pad"
                                                    textAlign="center"
                                                    value={otp[i]}
                                                    onChangeText={(text) => handleOtpChange(text, i)}
                                                    onKeyPress={(e) => handleOtpKeyPress(e, i)}
                                                />
                                            </View>
                                        ))}
                                    </View>
                                </View>

                                {/* Owner Email Address */}
                                <View style={{ marginTop: 38 }}>
                                    <Text className="text-sm font-lato-bold text-black mb-3">Owner Email Address (Optional)</Text>
                                    <TextInput
                                        className="bg-white border border-gray-300 rounded-xl px-4 py-4 text-sm text-gray-800 font-lato-medium"
                                        placeholder="eg. owner@email.com"
                                        placeholderTextColor="#C0C0C0"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                    />
                                </View>

                                {/* Owner Address */}
                                <View style={{ marginTop: 20 }}>
                                    <Text className="text-sm font-lato-bold text-black mb-3">Owner Address</Text>
                                    <View className="flex-row bg-white border border-gray-300 rounded-xl px-4 py-2 items-center">
                                        <TextInput
                                            className="flex-1 text-sm text-gray-800 font-lato-medium"
                                            placeholder="Select Address"
                                            placeholderTextColor="#C0C0C0"
                                        />
                                        <View className="w-9 h-9 rounded-xl bg-[#d2d0fa] items-center justify-center">
                                            <Ionicons name="locate" size={18} color="#4A43EC" />
                                        </View>
                                    </View>
                                </View>

                                {/* Next Button */}
                                <View className="mt-16 mb-4">
                                    <TouchableOpacity
                                        className="bg-[#4A43EC] py-4 rounded-xl items-center"
                                        activeOpacity={0.8}
                                        onPress={() => setCurrentStep(prev => prev + 1)}
                                    >
                                        <Text className="text-white text-sm font-lato-bold">Next</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : currentStep === 3 ? (
                            <View className="gap-5 pt-2">
                                {/* Property Name */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-3">Property Name (if applicable) :</Text>
                                    <TextInput
                                        className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 font-lato-medium"
                                        placeholder="Enter Property name"
                                        placeholderTextColor="#C0C0C0"
                                    />
                                </View>

                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-3 pt-2">Plot / Flat / Villa ,shop, office, showroom  House no.</Text>
                                    <View className="flex-row gap-3">
                                        <TextInput
                                            style={{ width: (width - 52) / 2 }}
                                            className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm text-gray-800 font-lato-medium"
                                            placeholder="Tower no."
                                            placeholderTextColor="#C0C0C0"
                                            keyboardType="numeric"
                                        />
                                        <TextInput
                                            style={{ width: (width - 52) / 2 }}
                                            className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 font-lato-medium"
                                            placeholder="Flat no."
                                            placeholderTextColor="#C0C0C0"
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <Text className="text-[10px] text-gray-800 font-lato-medium mt-1 text-right">tower no . is only  for flat</Text>
                                </View>

                                {/* Location */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-3">Location</Text>
                                    <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-2 items-center">
                                        <TextInput
                                            className="flex-1 text-sm text-gray-800 font-lato-medium"
                                            placeholder="Address & Landmark"
                                            placeholderTextColor="#C0C0C0"
                                        />
                                        <View className="w-9 h-9 rounded-xl bg-[#d2d0fa] items-center justify-center">
                                            <Ionicons name="locate" size={18} color="#4A43EC" />
                                        </View>
                                    </View>
                                </View>

                               
                                <View>
                                    <View className="flex-row gap-2 pt-2">
                                        <View style={{ flex: 1 }}>
                                            <Text className="text-sm font-lato-bold text-black mb-3">City</Text>
                                            <TextInput
                                                className="bg-white border border-gray-200 rounded-xl px-3 py-4 text-sm text-gray-800 font-lato-medium"
                                                placeholder="city"
                                                placeholderTextColor="#C0C0C0"
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text className="text-sm font-lato-bold text-black mb-3">State</Text>
                                            <TextInput
                                                className="bg-white border border-gray-200 rounded-xl px-3 py-4 text-sm text-gray-800 font-lato-medium"
                                                placeholder="state"
                                                placeholderTextColor="#C0C0C0"
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text className="text-sm font-lato-bold text-black mb-3">Pincode</Text>
                                            <TextInput
                                                className="bg-white border border-gray-200 rounded-xl px-3 py-4 text-sm text-gray-800 font-lato-medium"
                                                placeholder="pincode"
                                                placeholderTextColor="#C0C0C0"
                                                keyboardType="number-pad"
                                            />
                                        </View>
                                    </View>
                                </View>

                                {/* Select Project */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-3 pt-2">Select Project</Text>
                                    <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-2 items-center">
                                        <TextInput
                                            className="flex-1 text-sm text-gray-800 font-lato-medium"
                                            placeholder="Select Project Near You"
                                            placeholderTextColor="#C0C0C0"
                                        />
                                        <Ionicons name="heart-outline" size={18} color="#C0C0C0" />
                                    </View>
                                </View>

                                {/* Total Area & Carpet Area */}
                                <View className="flex-row gap-3 pt-2">
                                    <View style={{ flex: 1 }}>
                                        <Text className="text-sm font-lato-bold text-black mb-3">Total Area</Text>
                                        <View className="flex-row bg-white border border-gray-200 rounded-xl overflow-hidden items-center">
                                            <TextInput
                                                className="flex-1 text-sm text-gray-800 font-lato-medium px-3 py-3"
                                                placeholder="eg.1000"
                                                placeholderTextColor="#C0C0C0"
                                                keyboardType="numeric"
                                            />
                                            <TouchableOpacity
                                                onPress={() => openUnitSheet("total")}
                                                className="bg-[#F0EFFD] h-full px-3 items-center justify-center"
                                                style={{ minHeight: 44 }}
                                            >
                                                <Text className="text-xs font-lato-bold text-[#4A43EC]">{totalAreaUnit.short}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <View className="flex-row items-baseline gap-1 mb-3">
                                            <Text className="text-sm font-lato-bold text-black">Carpet Area</Text>
                                            <Text className="text-[9px] text-gray-400 font-lato-medium">(for built)</Text>
                                        </View>
                                        <View className="flex-row bg-white border border-gray-200 rounded-xl overflow-hidden items-center">
                                            <TextInput
                                                className="flex-1 text-sm text-gray-800 font-lato-medium px-3 py-3"
                                                placeholder="eg. 200"
                                                placeholderTextColor="#C0C0C0"
                                                keyboardType="numeric"
                                            />
                                            <TouchableOpacity
                                                onPress={() => openUnitSheet("carpet")}
                                                className="bg-[#F0EFFD] h-full px-3 items-center justify-center"
                                                style={{ minHeight: 44 }}
                                            >
                                                <Text className="text-xs font-lato-bold text-[#4A43EC]">{carpetAreaUnit.short}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                {/* Khasra Number */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-2 pt-3">Khasra number</Text>
                                    <TextInput
                                        className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm text-gray-800 font-lato-medium"
                                        placeholder="Enter khasra number"
                                        placeholderTextColor="#C0C0C0"
                                        keyboardType="numeric"
                                    />
                                </View>

                                {/* Property Age */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-2 pt-3">Property Age</Text>
                                    <TextInput
                                        className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-sm text-gray-800 font-lato-medium"
                                        placeholder="Enter Property age"
                                        placeholderTextColor="#C0C0C0"
                                        keyboardType="numeric"
                                    />
                                </View>

                               
                                <View className="mt-6 mb-4" style={{ opacity: hasScrolledToBottom ? 1 : 0 }} pointerEvents={hasScrolledToBottom ? "auto" : "none"}>
                                    <TouchableOpacity
                                        className="bg-[#4A43EC] py-4 rounded-xl items-center"
                                        activeOpacity={0.8}
                                        onPress={() => setCurrentStep(prev => prev + 1)}
                                    >
                                        <Text className="text-white text-sm font-lato-bold">Next</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <View className="gap-5 pt-2">
                             
                                <Text className="text-md font-lato-bold text-black">Upload Property Images & Documents</Text>

                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-2 mt-5">Upload Images</Text>
                                    <TouchableOpacity
                                        className="rounded-xl items-center justify-center py-10"
                                        style={{ backgroundColor: "#EEF0FB", borderWidth: 1, borderColor: "#D8DBEF", borderStyle: "dashed" }}
                                        activeOpacity={0.7}
                                        onPress={() => { setPickerModal("image"); uploadSheetRef.current?.present(); }}
                                    >
                                        <View className="w-12 h-12 rounded-full bg-[#D8DBEF] items-center justify-center mb-3">
                                            <Ionicons name="image-outline" size={24} color="#4A43EC" />
                                        </View>
                                        <Text className="text-sm font-lato-bold text-[#4A43EC] mb-1">
                                            {uploadedImages.length > 0 ? `${uploadedImages.length} Photo(s) Added` : "Add atleast 5 Photos"}
                                        </Text>
                                        <Text className="text-[11px] text-gray-400 font-lato-medium">click from camera or browse to upload</Text>
                                    </TouchableOpacity>
                                    {uploadedImages.length > 0 && (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
                                            {uploadedImages.map((img, idx) => (
                                                <Image key={idx} source={{ uri: img.uri }} style={{ width: 60, height: 60, borderRadius: 8, marginRight: 8 }} />
                                            ))}
                                        </ScrollView>
                                    )}
                                </View>

                                {/* Upload Documents */}
                                <View>
                                    <View className="flex-row items-center gap-1 mb-2 mt-4">
                                        <Text className="text-sm font-lato-bold text-black">Upload Property Documents</Text>
                                        <Text className="text-xs text-gray-400 font-lato-medium">(Optional)</Text>
                                    </View>
                                    <TouchableOpacity
                                        className="rounded-xl items-center justify-center py-10"
                                        style={{ backgroundColor: "#EEF0FB", borderWidth: 1, borderColor: "#D8DBEF", borderStyle: "dashed" }}
                                        activeOpacity={0.7}
                                        onPress={() => { setPickerModal("document"); uploadSheetRef.current?.present(); }}
                                    >
                                        <View className="w-12 h-12 rounded-full bg-[#D8DBEF] items-center justify-center mb-3">
                                            <Ionicons name="document-outline" size={24} color="#4A43EC" />
                                        </View>
                                        <Text className="text-sm font-lato-bold text-[#4A43EC] mb-1">
                                            {uploadedDocs.length > 0 ? `${uploadedDocs.length} Document(s) Added` : "Upload Documents"}
                                        </Text>
                                        <Text className="text-[11px] text-gray-400 font-lato-medium">click from camera or browse to upload</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Selling Price */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-2 mt-3">Selling Price</Text>
                                    <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-2 items-center">
                                        <Text className="text-lg text-gray-700 mr-2">₹</Text>
                                        <TextInput
                                            className="flex-1 text-sm text-gray-800 font-lato-medium"
                                            keyboardType="numeric"
                                            placeholderTextColor="#C0C0C0"
                                        />
                                    </View>
                                </View>

                                {/* Checkboxes */}
                                <View className="gap-3">
                                    <TouchableOpacity
                                        className="flex-row items-center gap-2"
                                        onPress={() => setPriceNegotiable(v => !v)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            className="w-4 h-4 rounded border items-center justify-center"
                                            style={{ borderColor: priceNegotiable ? "#4A43EC" : "#C0C0C0", backgroundColor: priceNegotiable ? "#4A43EC" : "white" }}
                                        >
                                            {priceNegotiable && <Ionicons name="checkmark" size={10} color="white" />}
                                        </View>
                                        <Text className="text-xs text-gray-600 font-lato-medium">Price Negotiable</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-row items-center gap-2"
                                        onPress={() => setTaxExclude(v => !v)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            className="w-4 h-4 rounded border items-center justify-center"
                                            style={{ borderColor: taxExclude ? "#4A43EC" : "#C0C0C0", backgroundColor: taxExclude ? "#4A43EC" : "white" }}
                                        >
                                            {taxExclude && <Ionicons name="checkmark" size={10} color="white" />}
                                        </View>
                                        <Text className="text-xs text-gray-600 font-lato-medium">Tax and Govt. charges exclude</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Preferred Payment Mode */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-3 mt-4">Preferred Payment Mode</Text>
                                    <View className="flex-row gap-3">
                                        <TouchableOpacity
                                            onPress={() => setPaymentMode("full")}
                                            className="rounded-full px-5 py-2"
                                            style={{ backgroundColor: paymentMode === "full" ? "#cfcef1ff" : "white", borderWidth: 1, borderColor: paymentMode === "full" ? "#6964f6ff" : "#D0D0D0" }}
                                        >
                                            <Text className="text-xs font-lato-bold" style={{ color: paymentMode === "full" ? "#7773f7ff" : "#666" }}>Full Payment</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setPaymentMode("emi")}
                                            className="rounded-full px-5 py-2"
                                            style={{ backgroundColor: paymentMode === "emi" ? "#cfcef1ff" : "white", borderWidth: 1, borderColor: paymentMode === "emi" ? "#6964f6ff" : "#D0D0D0" }}
                                        >
                                            <Text className="text-xs font-lato-bold" style={{ color: paymentMode === "emi" ? "#7773f7ff" : "#666" }}>EMI/ Loan Option Available</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Agreement & Submission */}
                                <View>
                                    <Text className="text-sm font-lato-bold text-black mb-3">Agreement & Submission</Text>
                                    <TouchableOpacity
                                        className="flex-row items-start gap-2"
                                        onPress={() => setAgreed(v => !v)}
                                        activeOpacity={0.7}
                                    >
                                        <View
                                            className="w-4 h-4 rounded border items-center justify-center mt-0.5"
                                            style={{ borderColor: agreed ? "#4A43EC" : "#C0C0C0", backgroundColor: agreed ? "#4A43EC" : "white" }}
                                        >
                                            {agreed && <Ionicons name="checkmark" size={10} color="white" />}
                                        </View>
                                        <Text className="flex-1 text-xs text-gray-600 font-lato-medium leading-5">
                                            I confirm that the provided details are accurate and that I am the legal owner or have the right to list this property for sale.
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Submit Button */}
                                <View className="mt-6 mb-4">
                                    <TouchableOpacity
                                        className="bg-[#4A43EC] py-4 rounded-xl items-center"
                                        activeOpacity={0.8}
                                    >
                                        <Text className="text-white text-sm font-lato-bold">Submit</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </ScrollView>
                </View>

                {/* Area Unit Bottom Sheet */}
                <BottomSheetModal
                    ref={unitSheetRef}
                    snapPoints={["60%"]}
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
                    backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                >
                    <BottomSheetView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}>
                        <Text style={{ fontSize: 15, fontFamily: "Lato-Bold", color: "#000", marginBottom: 16 }}>
                            Select Unit
                        </Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {areaUnits.map((unit) => {
                                const isSelected = activeUnitTarget === "total"
                                    ? totalAreaUnit.id === unit.id
                                    : carpetAreaUnit.id === unit.id;
                                return (
                                    <TouchableOpacity
                                        key={unit.id}
                                        onPress={() => selectUnit(unit)}
                                        style={{
                                            paddingVertical: 14,
                                            borderBottomWidth: 1,
                                            borderBottomColor: "#F3F4F6",
                                            flexDirection: "row",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 14,
                                            fontFamily: isSelected ? "Lato-Bold" : "Lato-Regular",
                                            color: isSelected ? "#4A43EC" : "#374151",
                                        }}>
                                            {unit.label}
                                        </Text>
                                        {isSelected && <Ionicons name="checkmark" size={18} color="#4A43EC" />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </BottomSheetView>
                </BottomSheetModal>

                <BottomSheetModal
                    ref={uploadSheetRef}
                    snapPoints={["32%"]}
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={{ backgroundColor: "#D1D5DB", width: 40 }}
                    backgroundStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
                >
                    <BottomSheetView style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32 }}>
                        <Text style={{ fontSize: 15, fontFamily: "Lato-Bold", color: "#000", marginBottom: 20 }}>
                            {pickerModal === "image" ? "Upload Images" : "Upload Documents"}
                        </Text>
                        {pickerModal === "image" && (
                            <TouchableOpacity
                                style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" }}
                                onPress={pickFromCamera}
                                activeOpacity={0.7}
                            >
                                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0EFFD", alignItems: "center", justifyContent: "center" }}>
                                    <Ionicons name="camera-outline" size={20} color="#4A43EC" />
                                </View>
                                <Text style={{ fontSize: 14, fontFamily: "Lato-Bold", color: "#1F2937" }}>Take a Photo</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={{ flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 14 }}
                            onPress={pickFromGallery}
                            activeOpacity={0.7}
                        >
                            <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0EFFD", alignItems: "center", justifyContent: "center" }}>
                                <Ionicons name={pickerModal === "document" ? "document-outline" : "images-outline"} size={20} color="#4A43EC" />
                            </View>
                            <Text style={{ fontSize: 14, fontFamily: "Lato-Bold", color: "#1F2937" }}>
                                {pickerModal === "document" ? "Browse Files" : "Browse from Gallery"}
                            </Text>
                        </TouchableOpacity>
                    </BottomSheetView>
                </BottomSheetModal>

            </View>
    );
}