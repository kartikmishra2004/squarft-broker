import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Platform,
    Image,
    Dimensions,
    TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

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

export default function AddProject() {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedMainType, setSelectedMainType] = useState("residential");
    const [selectedSubType, setSelectedSubType] = useState("plot");
    const [selectedKind, setSelectedKind] = useState("ready");

    const subTypes = subTypesData[selectedMainType] || [];

    useEffect(() => {
        if (subTypes.length > 0) {
            setSelectedSubType(subTypes[0].id);
        }
    }, [selectedMainType]);

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
                        backgroundColor: "#3D36C7", // Slightly darker blue
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
                    className="flex-1 px-5 pt-6"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
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

                            {/* Sub Property Type */}
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

                            {/* Property Kind Section */}
                            <Text className="text-sm font-lato-bold text-black mt-8 mb-3">what kind of property?</Text>
                            <View className="flex-row justify-between gap-2">
                                {propertyKinds.map((kind) => (
                                    <TouchableOpacity
                                        key={kind.id}
                                        onPress={() => setSelectedKind(kind.id)}
                                        className={`flex-1 py-3 px-1 rounded-lg border items-center justify-center ${selectedKind === kind.id ? 'border-[#4A43EC] bg-[#F4F7FF]' : 'border-zinc-300 bg-white'
                                            }`}
                                        style={{ elevation: 2 }}
                                    >
                                        <Text className={`text-[10px] font-lato-bold text-center ${selectedKind === kind.id ? 'text-[#4A43EC]' : 'text-gray-600'}`}>
                                            {kind.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    ) : currentStep === 2 ? (
                        <View className="gap-6">
                            {/* Owner Name */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-2.5">Owner Name</Text>
                                <TextInput
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-xs text-gray-800 font-lato-medium"
                                    placeholder="Enter Owner Name"
                                    placeholderTextColor="#A0A0A0"
                                />
                            </View>

                            {/* Owner Contact No. */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-2.5">Owner Contact No.</Text>
                                <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-3.5 items-center">
                                    <TextInput
                                        className="flex-1 text-xs text-gray-800 font-lato-medium"
                                        placeholder="eg. 8120180101"
                                        placeholderTextColor="#A0A0A0"
                                        keyboardType="phone-pad"
                                    />
                                    <TouchableOpacity>
                                        <Text className="text-[10px] font-lato-bold text-[#4A43EC]">Send / Resend OTP</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Enter OTP */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-2.5">Enter OTP</Text>
                                <View className="flex-row gap-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <View key={i} className="w-14 h-14 bg-white border border-gray-100 rounded-xl items-center justify-center border-zinc-300" style={{ elevation: 1 }}>
                                            <TextInput
                                                className="text-lg font-lato-bold text-black text-center w-full"
                                                maxLength={1}
                                                keyboardType="number-pad"
                                            />
                                        </View>
                                    ))}
                                </View>
                            </View>

                            {/* Owner Email */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-2.5">Owner Email Address (Optional)</Text>
                                <TextInput
                                    className="bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-xs text-gray-800 font-lato-medium"
                                    placeholder="eg. squarft@gmail.com"
                                    placeholderTextColor="#A0A0A0"
                                    keyboardType="email-address"
                                />
                            </View>

                            {/* Owner Address */}
                            <View>
                                <Text className="text-sm font-lato-bold text-black mb-2.5">Owner Address</Text>
                                <View className="flex-row bg-white border border-gray-200 rounded-xl px-4 py-3.5 items-center">
                                    <TextInput
                                        className="flex-1 text-xs text-gray-800 font-lato-medium"
                                        placeholder="Select Address"
                                        placeholderTextColor="#A0A0A0"
                                    />
                                    <View className="bg-[#4A43EC]/10 p-1.5 rounded-md">
                                        <Ionicons name="locate" size={16} color="#4A43EC" />
                                    </View>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View className="flex-1 items-center justify-center pt-16">
                            <Text className="text-base font-lato-bold text-gray-400">
                                {steps.find(s => s.id === currentStep)?.title} Content Coming Soon
                            </Text>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Next Button */}
            <View className="absolute bottom-32 left-5 right-5">
                <TouchableOpacity
                    className="bg-[#4A43EC] py-3.5 rounded-lg items-center shadow-lg shadow-[#4A43EC]/30"
                    activeOpacity={0.8}
                    onPress={() => {
                        if (currentStep < 4) {
                            setCurrentStep(prev => prev + 1);
                        }
                    }}
                >
                    <Text className="text-white text-sm font-lato-bold">Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}