import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, StatusBar, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { walletData } from '../../data/wallet';

const WalletScreen = () => {
    const router = useRouter();
    const bottomSheetModalRef = useRef(null);
    const [selectedTransaction, setSelectedTransaction] = useState(null);

    const snapPoints = useMemo(() => ['48%'], []);

    const handlePresentModalPress = useCallback((transaction) => {
        setSelectedTransaction(transaction);
        bottomSheetModalRef.current?.present();
    }, []);

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="light-content" />

            {/* Header Area */}
            <View className="bg-[#4A43EC] pt-[55px] pb-12 px-6">
                <View className="flex-row items-center justify-between">
                    <Pressable onPress={() => router.back()} className="p-1">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </Pressable>
                    <Text className="text-white text-[18px] font-lato-bold">My Wallet</Text>
                    <View style={{ width: 32 }} />
                </View>

                {/* Balance Card */}
                <View
                    style={{
                        backgroundColor: '#5C94FFA6',
                        borderRadius: 18,
                        marginTop: 20,
                        padding: 18,
                        shadowColor: "#4194FF",
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.3,
                        shadowRadius: 20,
                        elevation: 10,
                    }}
                >
                    <Text className="text-blue-100 text-center text-[11px] font-manrope-medium mb-0.5">Main balance</Text>
                    <Text className="text-white text-center text-[26px] font-manrope-extrabold mb-5">₹{walletData.balance}</Text>

                    <View className="flex-row justify-between items-center px-4">
                        <Pressable className="items-center flex-1">
                            <View className="mb-1">
                                <MaterialCommunityIcons name="tray-arrow-down" size={18} color="white" />
                            </View>
                            <Text className="text-white text-[9px] font-manrope-medium">Withdraw</Text>
                        </Pressable>

                        <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)', height: 24 }} />

                        <Pressable
                            onPress={() => router.push("/(screens)/transactions")}
                            className="items-center flex-1"
                        >
                            <View className="mb-1">
                                <MaterialCommunityIcons name="history" size={18} color="white" />
                            </View>
                            <Text className="text-white text-[9px] font-manrope-medium">Transactions</Text>
                        </Pressable>
                    </View>
                </View>
            </View>

            {/* Content Area */}
            <View className="flex-1 px-6 pt-6">
                <View className="flex-row items-center justify-between mb-3">
                    <Text className="text-[14px] font-manrope-extrabold text-[#272727]">Latest Transactions</Text>
                    <Pressable onPress={() => router.push("/(screens)/transactions")}>
                        <Text className="text-[10px] text-gray-400 font-manrope-medium">View all</Text>
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                    {walletData.transactions.slice(0, 7).map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() => handlePresentModalPress(item)}
                            className="flex-row items-center justify-between py-3 border-b border-gray-100"
                        >
                            <View>
                                <Text className="text-[13px] font-manrope-bold text-[#272727]">{item.title}</Text>
                                <Text className="text-[9px] text-gray-400 font-manrope-medium mt-1">{item.date}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <Text className="text-[#22C55E] text-[13px] font-manrope-bold mr-2">{item.amount}</Text>
                                <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Bottom Sheet Modal */}
            <BottomSheetModal
                ref={bottomSheetModalRef}
                index={0}
                snapPoints={snapPoints}
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={{ backgroundColor: '#E1E1E1', width: 40 }}
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -10 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                    elevation: 20,
                }}
            >
                <BottomSheetView className="flex-1 px-6 pt-5">
                    <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-[15px] font-manrope-extrabold text-[#272727]">{selectedTransaction?.title}</Text>
                        <Pressable onPress={() => bottomSheetModalRef.current?.dismiss()}>
                            <Text className="text-[#FF4B4B] font-manrope-bold text-[12px]">Cancel</Text>
                        </Pressable>
                    </View>
                    <Text className="text-gray-400 font-manrope-medium mb-5 text-[11px]">{selectedTransaction?.location}</Text>

                    <View className="bg-[#E8F9EE] rounded-[12px] py-3 items-center mb-5">
                        <Text className="text-[#22C55E] text-[20px] font-manrope-extrabold">{selectedTransaction?.amount}</Text>
                    </View>

                    <View className="bg-white border border-gray-100 rounded-[14px] p-3.5 mb-3.5" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5 }}>
                        <Text className="text-gray-400 text-[9px] font-manrope-medium mb-1 uppercase tracking-wider">Transfer to</Text>
                        <Text className="text-[#272727] text-[13px] font-manrope-bold">{selectedTransaction?.bank}</Text>
                    </View>

                    <View className="bg-white border border-gray-100 rounded-[14px] p-3.5 flex-row items-center justify-between" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 5 }}>
                        <View>
                            <Text className="text-gray-400 text-[9px] font-manrope-medium mb-1 uppercase tracking-wider">Transaction no.</Text>
                            <Text className="text-[#272727] text-[13px] font-manrope-bold">{selectedTransaction?.transactionNo}</Text>
                        </View>
                        <Pressable className="p-2 border border-blue-50 bg-blue-50/30 rounded-xl">
                            <Ionicons name="copy-outline" size={20} color="#4D45ED" />
                        </Pressable>
                    </View>
                </BottomSheetView>
            </BottomSheetModal>
        </View>
    );
};

export default WalletScreen;
