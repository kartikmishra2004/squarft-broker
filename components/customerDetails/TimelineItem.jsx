import { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TimelineItem = ({
    status,
    title,
    time,
    badge,
    iconName,
    children,
    index = 0,
    isLast = false,
    connectorCompleted = false,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.6)).current;
    const slideAnim = useRef(new Animated.Value(12)).current;

    useEffect(() => {
        const delay = index * 120;
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 350,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 80,
                friction: 8,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 300,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [fadeAnim, index, scaleAnim, slideAnim]);

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
            }}
            className="flex-row mb-7 relative z-10"
        >
            {/* Dot */}
            <View className="w-7 mr-4 items-center mt-0.5">
                {!isLast && (
                    <View
                        className={`absolute top-[27px] bottom-[-30px] w-[2px] ${
                            connectorCompleted ? 'bg-[#6231FF]' : 'bg-[#E5E7EB]'
                        }`}
                    />
                )}
                {status === 'completed' && (
                    <Animated.View
                        style={{ transform: [{ scale: scaleAnim }] }}
                        className="w-7 h-7 rounded-full bg-[#6231FF] justify-center items-center z-10"
                    >
                        <Ionicons name="checkmark" size={15} color="white" />
                    </Animated.View>
                )}
                {status === 'current' && (
                    <Animated.View
                        style={{ transform: [{ scale: scaleAnim }] }}
                        className="w-7 h-7 rounded-full border-[3px] border-[#6231FF] bg-white justify-center items-center z-10"
                    >
                        <View className="w-3 h-3 bg-[#6231FF] rounded-full" />
                    </Animated.View>
                )}
                {status === 'pending' && (
                    <Animated.View
                        style={{ transform: [{ scale: scaleAnim }] }}
                        className="w-7 h-7 rounded-full border border-gray-200 bg-white justify-center items-center z-10"
                    >
                        <Ionicons name={iconName} size={13} color="#D1D5DB" />
                    </Animated.View>
                )}
            </View>

            {/* Content */}
            <View className="flex-1">
                <View className="flex-row items-center gap-2 min-h-7">
                    <Text className={`text-[15px] font-manrope-bold ${
                            status === 'current' ? 'text-[#6231FF]'
                        : status === 'pending' ? 'text-[#B8BBC1]'
                        : 'text-[#1F2937]'
                    }`}>
                        {title}
                    </Text>
                    {badge && (
                        <View className="bg-[#6231FF] px-2 py-1 rounded-[5px]">
                            <Text className="text-[8px] font-manrope-bold text-white tracking-wider">{badge}</Text>
                        </View>
                    )}
                </View>
                {time && (
                    <Text className={`text-[11px] mt-0.5 font-manrope-medium ${
                        status === 'pending' ? 'text-[#D1D5DB]' : 'text-[#6B7280]'
                    }`}>
                        {time}
                    </Text>
                )}
                {children}
            </View>
        </Animated.View>
    );
};

export default TimelineItem;
