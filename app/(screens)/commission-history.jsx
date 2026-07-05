import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StatusBar, TextInput, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCommissionHistory } from '../../store/slices/walletSlice';

const CommissionHistoryScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { commissions, loading, error } = useSelector((state) => state.wallet);
    const [searchText, setSearchText] = useState('');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all'); // all, credit, pending
    const [dateFilter, setDateFilter] = useState('all'); // all, month, 3months, 6months
    const [tempStatusFilter, setTempStatusFilter] = useState('all');
    const [tempDateFilter, setTempDateFilter] = useState('all');

    useEffect(() => {
        dispatch(fetchCommissionHistory({ page: 1, limit: 100 }));
    }, [dispatch]);

    const hasActiveFilters = statusFilter !== 'all' || dateFilter !== 'all';

    const filtered = useMemo(() => {
        if (!Array.isArray(commissions)) return [];
        
        let result = [...commissions];

        // Search filter
        if (searchText) {
            result = result.filter(item =>
                (item.propertyName || '').toLowerCase().includes(searchText.toLowerCase()) ||
                (item.propertyAddress || '').toLowerCase().includes(searchText.toLowerCase()) ||
                (item.amount?.toString() || '').includes(searchText)
            );
        }

        // Status filter
        if (statusFilter !== 'all') {
            result = result.filter(item => 
                (item.status || 'credit').toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            const cutoffDate = new Date();
            
            if (dateFilter === 'month') {
                cutoffDate.setMonth(now.getMonth() - 1);
            } else if (dateFilter === '3months') {
                cutoffDate.setMonth(now.getMonth() - 3);
            } else if (dateFilter === '6months') {
                cutoffDate.setMonth(now.getMonth() - 6);
            }
            
            result = result.filter(item => {
                if (!item.createdAt) return false;
                const itemDate = new Date(item.createdAt);
                return itemDate >= cutoffDate;
            });
        }

        return result;
    }, [searchText, commissions, statusFilter, dateFilter]);

    const handleOpenFilter = () => {
        setTempStatusFilter(statusFilter);
        setTempDateFilter(dateFilter);
        setFilterModalVisible(true);
    };

    const handleApplyFilters = () => {
        setStatusFilter(tempStatusFilter);
        setDateFilter(tempDateFilter);
        setFilterModalVisible(false);
    };

    const handleResetFilters = () => {
        setTempStatusFilter('all');
        setTempDateFilter('all');
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const formatAmount = (amount) =>
        `\u20B9${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

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
            <View className="flex-row px-6 mt-4 mb-4 gap-2.5">
                <View className="flex-1 flex-row items-center bg-[#EBF1FF] rounded-xl px-3.5 h-[44px]">
                    <Ionicons name="search" size={18} color="#9CA3AF" />
                    <TextInput
                        placeholder="Search by property or amount"
                        placeholderTextColor="#9CA3AF"
                        value={searchText}
                        onChangeText={setSearchText}
                        className="flex-1 text-[13px] text-black ml-2 font-lato-regular"
                    />
                </View>
                <TouchableOpacity 
                    className="w-[44px] h-[44px] bg-[#EBF1FF] rounded-xl items-center justify-center relative"
                    onPress={handleOpenFilter}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="filter-variant" size={22} color="#4A43EC" />
                    {hasActiveFilters && (
                        <View className="absolute top-1 right-1 w-2 h-2 bg-[#FF3B30] rounded-full" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Filter Modal */}
            <Modal
                visible={filterModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View className="bg-white rounded-3xl mx-6 w-[85%] overflow-hidden" style={{ elevation: 10 }}>
                        {/* Header */}
                        <View className="px-6 pt-6 pb-4 border-b border-gray-100">
                            <Text className="text-[18px] font-manrope-bold text-[#1a1a1a] text-center">
                                Filter Commissions
                            </Text>
                        </View>

                        {/* Filter Options */}
                        <ScrollView className="px-6 py-5" style={{ maxHeight: 400 }}>
                            {/* Status Filter */}
                            <View className="mb-6">
                                <Text className="text-[14px] font-manrope-bold text-[#1a1a1a] mb-3">
                                    Status
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {[
                                        { id: 'all', label: 'All Status' },
                                        { id: 'credit', label: 'Credited' },
                                        { id: 'pending', label: 'Pending' },
                                    ].map((status) => (
                                        <TouchableOpacity
                                            key={status.id}
                                            onPress={() => setTempStatusFilter(status.id)}
                                            className={`px-5 py-3 rounded-xl border-2 ${
                                                tempStatusFilter === status.id
                                                    ? 'bg-[#F5F3FF] border-[#4A43EC]'
                                                    : 'bg-white border-[#E5E7EB]'
                                            }`}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                className={`text-[13px] font-manrope-bold ${
                                                    tempStatusFilter === status.id
                                                        ? 'text-[#4A43EC]'
                                                        : 'text-[#6B7280]'
                                                }`}
                                            >
                                                {status.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            {/* Date Range Filter */}
                            <View>
                                <Text className="text-[14px] font-manrope-bold text-[#1a1a1a] mb-3">
                                    Time Period
                                </Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {[
                                        { id: 'all', label: 'All Time' },
                                        { id: 'month', label: 'This Month' },
                                        { id: '3months', label: 'Last 3 Months' },
                                        { id: '6months', label: 'Last 6 Months' },
                                    ].map((period) => (
                                        <TouchableOpacity
                                            key={period.id}
                                            onPress={() => setTempDateFilter(period.id)}
                                            className={`px-5 py-3 rounded-xl border-2 ${
                                                tempDateFilter === period.id
                                                    ? 'bg-[#F5F3FF] border-[#4A43EC]'
                                                    : 'bg-white border-[#E5E7EB]'
                                            }`}
                                            activeOpacity={0.7}
                                        >
                                            <Text
                                                className={`text-[13px] font-manrope-bold ${
                                                    tempDateFilter === period.id
                                                        ? 'text-[#4A43EC]'
                                                        : 'text-[#6B7280]'
                                                }`}
                                            >
                                                {period.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer Buttons */}
                        <View className="flex-row gap-3 px-6 py-4 border-t border-gray-100">
                            <TouchableOpacity
                                className="flex-1 py-3.5 rounded-xl items-center justify-center border-2 border-[#4A43EC]"
                                onPress={handleResetFilters}
                                activeOpacity={0.7}
                            >
                                <Text className="text-[#4A43EC] text-[14px] font-manrope-bold">Reset</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 py-3.5 rounded-xl items-center justify-center bg-[#4A43EC]"
                                onPress={handleApplyFilters}
                                activeOpacity={0.7}
                            >
                                <Text className="text-white text-[14px] font-manrope-bold">Apply</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Minimalistic Filters */}
            <View className="px-6 mb-3">
                {/* Status Filter */}
                <View className="flex-row items-center gap-2 mb-2">
                    <Text className="text-[11px] text-gray-500 font-manrope-medium mr-1">Status:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                        <View className="flex-row gap-2">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'credit', label: 'Credit' },
                                { id: 'pending', label: 'Pending' },
                            ].map((status) => (
                                <TouchableOpacity
                                    key={status.id}
                                    onPress={() => setStatusFilter(status.id)}
                                    className={`px-3 py-1.5 rounded-full ${
                                        statusFilter === status.id
                                            ? 'bg-[#4A43EC]'
                                            : 'bg-gray-100'
                                    }`}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`text-[11px] font-manrope-bold ${
                                            statusFilter === status.id
                                                ? 'text-white'
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        {status.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>

                {/* Date Range Filter */}
                <View className="flex-row items-center gap-2">
                    <Text className="text-[11px] text-gray-500 font-manrope-medium mr-1">Period:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-1">
                        <View className="flex-row gap-2">
                            {[
                                { id: 'all', label: 'All Time' },
                                { id: 'month', label: 'This Month' },
                                { id: '3months', label: 'Last 3M' },
                                { id: '6months', label: 'Last 6M' },
                            ].map((period) => (
                                <TouchableOpacity
                                    key={period.id}
                                    onPress={() => setDateFilter(period.id)}
                                    className={`px-3 py-1.5 rounded-full ${
                                        dateFilter === period.id
                                            ? 'bg-[#4A43EC]'
                                            : 'bg-gray-100'
                                    }`}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`text-[11px] font-manrope-bold ${
                                            dateFilter === period.id
                                                ? 'text-white'
                                                : 'text-gray-600'
                                        }`}
                                    >
                                        {period.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4A43EC" />
                </View>
            ) : error ? (
                <View className="flex-1 items-center justify-center px-10">
                    <MaterialCommunityIcons name="cash-remove" size={56} color="#D1D5DB" />
                    <Text className="text-gray-400 text-[14px] font-manrope-medium mt-4 text-center">
                        {error}
                    </Text>
                    <Pressable
                        onPress={() => dispatch(fetchCommissionHistory({ page: 1, limit: 100 }))}
                        className="bg-[#4A43EC] px-5 py-3 rounded-xl mt-5"
                    >
                        <Text className="text-white text-[12px] font-manrope-bold">Retry</Text>
                    </Pressable>
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
