import { Text, View, TextInput, TouchableOpacity, Image, Platform, ScrollView, Keyboard } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Link, router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { setMobile, setPassword, toggleRememberMe, loginUser, clearError } from "../../store/slices/authSlice";
import { ActivityIndicator } from "react-native";
const logo = require("../../assets/icons/app-icon.png");

export default function Login() {
    const dispatch = useDispatch();
    const { mobile, password, rememberMe, loading, error } = useSelector((state) => state.auth);
    const [showPassword, setShowPassword] = useState(false);
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

    const handleLogin = async () => {
        if (!mobile || !password) {
            alert("Please enter mobile number and password");
            return;
        }

        try {
            const result = await dispatch(loginUser({ phone: mobile, password })).unwrap();
            if (result.token) {
                router.replace("/(tabs)/home");
            }
        } catch (err) {
            alert(err || "Login failed");
        }
    };

    useEffect(() => {
        if (error) {
            alert(error);
            dispatch(clearError());
        }
    }, [error]);

    return (
        <View className="flex-1">
            <View className="flex-1">
                    <StatusBar style="light" />

                    <View className="bg-[#4A43EC] pt-16 pb-5 px-6">
                        <View style={{ width: 70, height: 70, overflow: 'hidden' }} className="mb-2 self-start">
                            <Image source={logo} style={{ width: 120, height: 120, marginTop: -20, marginLeft: -28 }} resizeMode="contain" />
                        </View>
                        <Text className="text-white text-[36px] font-bold mb-3">Login</Text>
                        <View className="flex-row items-center">
                            <Text className="text-white/80 text-[14px]">Don't have an account? </Text>
                            <Link href="/register">
                                <Text className="text-white text-[14px] font-semibold underline">Sign Up</Text>
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


                        <Text className="text-gray-500 text-[13px] mb-1.5">Mobile Number</Text>
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
                            className="border border-gray-200 rounded-xl px-4 py-2 flex-row items-center mb-4"
                            onLayout={(event) => handleFieldLayout("password", event)}
                        >
                            <TextInput
                                value={password}
                                onChangeText={(val) => dispatch(setPassword(val))}
                                placeholder="••••••••"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showPassword}
                                className="flex-1 text-[15px] text-black"
                                onFocus={() => handleFocus("password")}
                            />
                            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                <Ionicons
                                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                                    size={20}
                                    color="#aaa"
                                />
                            </TouchableOpacity>
                        </View>


                        <View className="flex-row items-center justify-between mb-7">
                            <TouchableOpacity
                                className="flex-row items-center gap-2"
                                onPress={() => dispatch(toggleRememberMe())}
                            >
                                <View className={`w-4 h-4 border rounded-sm items-center justify-center ${rememberMe ? "bg-[#4A43EC] border-[#4A43EC]" : "border-gray-400"}`}>
                                    {rememberMe && <Ionicons name="checkmark" size={11} color="white" />}
                                </View>
                                <Text className="text-gray-500 text-[13px]">Remember me</Text>
                            </TouchableOpacity>
                            <Link href="/forgot-password">
                                <Text className="text-[#4A43EC] text-[13px]">Forgot Password ?</Text>
                            </Link>
                        </View>


                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            className={`bg-[#4A43EC] rounded-2xl py-4 items-center mb-8 ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white text-[16px] font-lato-bold">Log In</Text>
                            )}
                        </TouchableOpacity>

                    </ScrollView>
            </View>
        </View>
    );
}