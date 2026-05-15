import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StatusBar, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCommissionHistory } from '../../store/slices/walletSlice';

const CommissionHistoryScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { commissions, loading } = useSelector((state) => state.wallet);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        dispatch(fetchCommissionHistory({ page: 1, limit: 100 }));
    }, [dispatch]);

    const filtered = useMemo(() => {
        if (!searchText || !Array.isArray(commissions)) return commissions || [];
        return commissions.filter(item =>
            (item.propertyName || '').toLowerCase().includes(searchText.toLowerCase()) ||
            (item.amount?.toString() || '').includes(searchText)
        );
    }, [searchText, commissions]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatAmount = (amount) =>
        `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="pt-[55px] pb-4 px-6 flex-row items-center justify-between border-b border-gray-50">
                <Pressable onPress={() => router.back()} className="p-1">
                    <Ionicons name="arrow-back" size={22} color="black" />
                </Pressable>
                <Text className="text-black text-[18px] font-manrope-bold">Commission History</Text>
                <View style={{ width: 28 }} />
            </View>

            {/* Search */}
            <View className="px-6 mt-4 mb-2">
                <View className="flex-row items-center bg-[#EBF1FF] rounded-xl px-3.5 h-[44px]">
                    <Ionicons name="search" size={18} color="#9CA3AF" />
                    <TextInput
                        placeholder="Search by property or amount"
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                        className="flex-1 text-[13px] text-black ml-2 font-lato-regular"
                    />
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4A43EC" />
                </View>
            ) : filtered.length === 0 ? (
                <View className="flex-1 items-center justify-center px-10">
                    <MaterialCommunityIcons name="cash-remove" size={56} color="#D1D5DB" />
                    <Text className="text-gray-400 text-[14px] font-manrope-medium mt-4 text-center">
                        {searchText ? 'No commissions match your search' : 'No commission history yet'}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    className="flex-1 px-6 pt-4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {filtered.map((item) => (
                        <View
                            key={item.id}
                            className="flex-row items-center justify-between py-4 border-b border-gray-50"
                        >
                            <View className="flex-row items-center flex-1 mr-3">
                                <View className="w-10 h-10 rounded-full bg-[#E8F9EE] items-center justify-center mr-3">
                                    <MaterialCommunityIcons name="cash-plus" size={20} color="#22C55E" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[13px] font-manrope-bold text-[#272727]" numberOfLines={1}>
                                        {item.propertyName || 'Commission Earned'}
                                    </Text>
                                    <Text className="text-[10px] text-gray-400 font-manrope-medium mt-0.5">
                                        {formatDate(item.createdAt)}
                                    </Text>
                                </View>
                            </View>
                            <View className="items-end">
                                <Text className="text-[14px] font-manrope-bold text-[#22C55E]">
                                    +{formatAmount(item.amount)}
                                </Text>
                                <View className="bg-[#E8F9EE] px-2 py-0.5 rounded-full mt-1">
                                    <Text className="text-[9px] font-manrope-bold text-[#22C55E] uppercase">
                                        {item.status || 'CREDIT'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

export default CommissionHistoryScreen;
