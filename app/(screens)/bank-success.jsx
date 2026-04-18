import React, { useEffect } from 'react';
import { View, Text, Pressable, StatusBar, BackHandler } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const BankSuccessScreen = () => {
    const router = useRouter();

    // Disable hardware back button on Android
    useEffect(() => {
        const backAction = () => {
            return true; // Return true to prevent default back action
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction,
        );

        return () => backHandler.remove();
    }, []);

    return (
        <View className="flex-1 bg-white items-center justify-center px-6">
            <StatusBar barStyle="dark-content" />

            <View className="items-center">
                {/* Success Icon with Glow */}
                <View
                    style={{
                        width: 110,
                        height: 110,
                        borderRadius: 55,
                        backgroundColor: '#4A43EC',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: "#4A43EC",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.25,
                        shadowRadius: 15,
                        elevation: 10,
                    }}
                >
                    <Ionicons name="checkmark" size={70} color="white" />
                </View>

                <Text className="text-[15px] font-manrope-bold text-black mt-8 text-center text-opacity-80">
                    Account detail added successfully
                </Text>

                <Pressable
                    onPress={() => router.replace("/(screens)/wallet?withdraw=true")}
                    className="mt-8 px-12 py-3.5 rounded-xl"
                    style={{
                        backgroundColor: '#4A43EC',
                        shadowColor: "#4A43EC",
                        shadowOffset: { width: 0, height: 5 },
                        shadowOpacity: 0.2,
                        shadowRadius: 10,
                        elevation: 6,
                    }}
                >
                    <Text className="text-white text-[14px] font-manrope-bold">Go back</Text>
                </Pressable>
            </View>
        </View>
    );
};

export default BankSuccessScreen;
