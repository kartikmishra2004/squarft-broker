import { Text, View, TextInput, TouchableOpacity, Image, Platform, ScrollView, Keyboard } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { setName, setMobile, setPassword, setConfirmPassword, setOtpFlow, setProfileImage, clearProfileImage } from "../../store/slices/authSlice";

const logo = require("../../assets/icons/app-icon.png");

export default function Register() {
    const dispatch = useDispatch();
    const { name, mobile, password, confirmPassword, profileImage } = useSelector((state) => state.auth);
    const [showConfirm, setShowConfirm] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [fieldOffsets, setFieldOffsets] = useState({});
    const scrollRef = useRef(null);

    useEffect(() => {
        const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
        const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

        const showSub = Keyboard.addListener(showEvent, (event) => {
            setKeyboardHeight(event.endCoordinates?.height || 0);
        });

        const hideSub = Keyboard.addListener(hideEvent, () => {
            setKeyboardHeight(0);
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
    }, []);

    const handleFocus = (fieldKey) => {
        const y = fieldOffsets[fieldKey] ?? 0;
        scrollRef.current?.scrollTo({ y: Math.max(0, y - 130), animated: true });
    };

    const handleFieldLayout = (fieldKey, event) => {
        const y = event?.nativeEvent?.layout?.y;
        if (typeof y !== "number") {
            return;
        }

        setFieldOffsets((prev) => ({ ...prev, [fieldKey]: y }));
    };

    const handlePickProfileImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled || !result.assets?.length) {
            return;
        }

        const asset = result.assets[0];
        dispatch(
            setProfileImage({
                uri: asset.uri,
                fileName: asset.fileName || null,
                mimeType: asset.mimeType || null,
            })
        );
    };

    const handleRegister = () => {
        dispatch(setOtpFlow('register'));
        router.push("/otp-verification");
    };

    return (
        <View className="flex-1">
            <StatusBar style="light" />

            <View className="bg-[#4A43EC] pt-16 pb-5 px-6">
                <View style={{ width: 70, height: 70, overflow: 'hidden' }} className="mb-2 self-start">
                    <Image source={logo} style={{ width: 120, height: 120, marginTop: -20, marginLeft: -28 }} resizeMode="contain" />
                </View>
                <Text className="text-white text-[36px] font-bold mb-3">Login</Text>
                <View className="flex-row items-center">
                    <Text className="text-white/80 text-[14px]">Already have an account? </Text>
                    <Link href="/login">
                        <Text className="text-white text-[14px] font-semibold underline">Login</Text>
                    </Link>
                </View>
            </View>

            <ScrollView
                ref={scrollRef}
                className="flex-1 bg-white"
                contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: keyboardHeight + 24 }}
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >

                <Text className="text-gray-500 text-[13px] mb-1.5">Enter Your Name</Text>
                <View
                    className="border border-gray-200 rounded-xl px-4 py-2 mb-5"
                    onLayout={(event) => handleFieldLayout("name", event)}
                >
                    <TextInput
                        value={name}
                        onChangeText={(val) => dispatch(setName(val))}
                        placeholder="Name"
                        placeholderTextColor="#aaa"
                        className="text-[15px] text-black"
                        onFocus={() => handleFocus("name")}
                    />
                </View>

                <Text className="text-gray-500 text-[13px] mb-1.5">Enter Your Mobile Number</Text>
                <View
                    className="border border-gray-200 rounded-xl px-4 py-2 mb-5"
                    onLayout={(event) => handleFieldLayout("mobile", event)}
                >
                    <TextInput
                        value={mobile}
                        onChangeText={(val) => dispatch(setMobile(val))}
                        placeholder="Number"
                        placeholderTextColor="#aaa"
                        keyboardType="phone-pad"
                        className="text-[15px] text-black"
                        onFocus={() => handleFocus("mobile")}
                    />
                </View>

                <Text className="text-gray-500 text-[13px] mb-1.5">Password</Text>
                <View
                    className="border border-gray-200 rounded-xl px-4 py-2 flex-row items-center mb-8"
                    onLayout={(event) => handleFieldLayout("password", event)}
                >
                    <TextInput
                        value={password}
                        onChangeText={(val) => dispatch(setPassword(val))}
                        placeholder="••••••••"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!showConfirm}
                        className="flex-1 text-[15px] text-black"
                        onFocus={() => handleFocus("password")}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                        <Ionicons
                            name={showConfirm ? "eye-outline" : "eye-off-outline"}
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>

                </View>


                <Text className="text-gray-500 text-[13px] mb-1.5">Confirm Password</Text>
                <View
                    className="border border-gray-200 rounded-xl px-4 py-2 flex-row items-center mb-8"
                    onLayout={(event) => handleFieldLayout("confirmPassword", event)}
                >
                    <TextInput
                        value={confirmPassword}
                        onChangeText={(val) => dispatch(setConfirmPassword(val))}
                        placeholder="••••••••"
                        placeholderTextColor="#aaa"
                        secureTextEntry={!showConfirm}
                        className="flex-1 text-[15px] text-black"
                        onFocus={() => handleFocus("confirmPassword")}
                    />
                    <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                        <Ionicons
                            name={showConfirm ? "eye-outline" : "eye-off-outline"}
                            size={20}
                            color="#aaa"
                        />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={handleRegister}
                    className="bg-[#4A43EC] rounded-2xl py-4 items-center"
                >
                    <Text className="text-white text-[16px] font-semibold">Register</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}
