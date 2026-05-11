import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOtpDigit, clearOtp, loginUser, verifyOtpApi, registerUser, clearError, sendOtpApi } from "../../store/slices/authSlice";
import { ActivityIndicator } from "react-native";

const logo = require("../../assets/icons/app-icon.png");

export default function OtpVerification() {
    const dispatch = useDispatch();
    const { otp, otpFlow, otpToken, name, mobile, password, loading, error } = useSelector((state) => state.auth);
    const inputs = useRef([]);

    const handleChange = (text, index) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        dispatch(setOtpDigit({ index, value: digit }));
        if (digit && index < 5) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const otpCode = otp.join('');
        if (otpCode.length < 6) {
            alert("Please enter full OTP");
            return;
        }

        try {
            const verifyResult = await dispatch(verifyOtpApi({ otp_token: otpToken, otp: otpCode })).unwrap();
            
            if (otpFlow === 'register') {
                // Now register the user
                const [first_name, ...last_name_parts] = name.split(' ');
                const last_name = last_name_parts.join(' ');
                
                await dispatch(registerUser({
                    phone: mobile,
                    password: password,
                    first_name,
                    last_name,
                })).unwrap();

                // Auto-login after registration
                const loginResult = await dispatch(loginUser({ phone: mobile, password })).unwrap();
                if (loginResult.token) {
                    dispatch(clearOtp());
                    router.replace("/(tabs)/home");
                }
            } else if (otpFlow === 'forgot-password') {
                router.push("/change-password");
            }
        } catch (err) {
            alert(err || "Verification failed");
        }
    };

    const handleResend = async () => {
        try {
            await dispatch(sendOtpApi({ phone: mobile, purpose: otpFlow === 'forgot-password' ? 'reset_password' : 'register' })).unwrap();
            dispatch(clearOtp());
            inputs.current[0]?.focus();
            alert("OTP resent successfully");
        } catch (err) {
            alert(err || "Failed to resend OTP");
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
            <StatusBar style="light" />

            <View className="bg-[#4A43EC] pt-16 pb-10 px-6">
                <View style={{ width: 60, height: 60, overflow: 'hidden' }} className="mb-6">
                    <Image source={logo} style={{ width: 110, height: 110, margin: -20 }} resizeMode="contain" />
                </View>
                <Text className="text-white text-[36px] font-bold mb-1">OTP Verification</Text>
                <Text className="text-white/80 text-[14px]">OTP has been sent to your registered mobile number</Text>
            </View>

            <View className="flex-1 bg-white px-6 pt-10">

                <View className="flex-row justify-between mb-10">
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputs.current[index] = ref)}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={1}
                            style={{
                                width: 50,
                                height: 60,
                                borderWidth: 1,
                                borderColor: digit ? '#4A43EC' : '#E5E7EB',
                                borderRadius: 12,
                                textAlign: 'center',
                                fontSize: 20,
                                color: '#000',
                            }}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    onPress={handleVerify}
                    disabled={loading}
                    className={`bg-[#4A43EC] rounded-2xl py-4 items-center mb-6 ${loading ? 'opacity-70' : ''}`}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white text-[16px] font-semibold">Submit</Text>
                    )}
                </TouchableOpacity>

                <View className="flex-row justify-center items-center">
                    <Text className="text-gray-500 text-[14px]">Didn't get the OTP?  </Text>
                    <TouchableOpacity onPress={handleResend}>
                        <Text className="text-[#4A43EC] text-[14px] font-semibold">Resend OTP</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </View>
    );
}
