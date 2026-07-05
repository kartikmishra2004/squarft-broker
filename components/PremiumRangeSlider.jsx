import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 64; // 32px padding on each side
const THUMB_SIZE = 28;
const TRACK_HEIGHT = 6;
const ACTIVE_COLOR = '#4A43EC';
const INACTIVE_COLOR = '#E5E7EB';
const THUMB_BORDER_WIDTH = 4;

/**
 * Ultra-smooth premium range slider with Airbnb-quality interaction
 * Optimized for 60 FPS performance on low-end Android devices
 */
const PremiumRangeSlider = ({
    min = 0,
    max = 100,
    initialMin,
    initialMax,
    step = 1,
    onValuesChange,
    onValuesChangeFinish,
    formatLabel,
}) => {
    // Memoize initial values to prevent unnecessary re-initialization
    const initialMinValue = useMemo(() => initialMin ?? min, [initialMin, min]);
    const initialMaxValue = useMemo(() => initialMax ?? max, [initialMax, max]);

    // Use Animated.Value for 60fps native-driven animations
    const minThumbPosition = useRef(new Animated.Value(0)).current;
    const maxThumbPosition = useRef(new Animated.Value(SLIDER_WIDTH)).current;

    // Track current values without causing re-renders during drag
    const currentMinValue = useRef(initialMinValue);
    const currentMaxValue = useRef(initialMaxValue);

    // Local state only updated on drag end to minimize re-renders
    const [displayMin, setDisplayMin] = useState(initialMinValue);
    const [displayMax, setDisplayMax] = useState(initialMaxValue);

    // Active thumb tracking (for visual feedback)
    const [activeThumb, setActiveThumb] = useState(null);

    // Convert value to position
    const valueToPosition = useCallback((value) => {
        const range = max - min;
        const percentage = (value - min) / range;
        return percentage * SLIDER_WIDTH;
    }, [min, max]);

    // Convert position to value
    const positionToValue = useCallback((position) => {
        const percentage = Math.max(0, Math.min(1, position / SLIDER_WIDTH));
        const rawValue = min + percentage * (max - min);
        const steppedValue = Math.round(rawValue / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
    }, [min, max, step]);

    // Initialize thumb positions
    React.useEffect(() => {
        const minPos = valueToPosition(initialMinValue);
        const maxPos = valueToPosition(initialMaxValue);
        
        minThumbPosition.setValue(minPos);
        maxThumbPosition.setValue(maxPos);
        
        currentMinValue.current = initialMinValue;
        currentMaxValue.current = initialMaxValue;
    }, [initialMinValue, initialMaxValue, valueToPosition, minThumbPosition, maxThumbPosition]);

    // Optimized value update - minimizes re-renders
    const updateValues = useCallback((newMin, newMax, isFinal = false) => {
        currentMinValue.current = newMin;
        currentMaxValue.current = newMax;

        if (isFinal) {
            // Only update display state on drag end
            setDisplayMin(newMin);
            setDisplayMax(newMax);
            onValuesChangeFinish?.([newMin, newMax]);
        } else {
            // Call live callback without re-rendering
            onValuesChange?.([newMin, newMax]);
        }
    }, [onValuesChange, onValuesChangeFinish]);

    // MIN THUMB PAN RESPONDER
    const minPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setActiveThumb('min');
            },
            onPanResponderMove: (_, gestureState) => {
                const currentMaxPos = valueToPosition(currentMaxValue.current);
                const newPosition = Math.max(
                    0,
                    Math.min(
                        currentMaxPos - THUMB_SIZE, // Prevent overlap
                        valueToPosition(currentMinValue.current) + gestureState.dx
                    )
                );

                minThumbPosition.setValue(newPosition);
                const newValue = positionToValue(newPosition);
                
                if (newValue !== currentMinValue.current) {
                    updateValues(newValue, currentMaxValue.current, false);
                }
            },
            onPanResponderRelease: () => {
                setActiveThumb(null);
                updateValues(currentMinValue.current, currentMaxValue.current, true);
            },
        })
    ).current;

    // MAX THUMB PAN RESPONDER
    const maxPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                setActiveThumb('max');
            },
            onPanResponderMove: (_, gestureState) => {
                const currentMinPos = valueToPosition(currentMinValue.current);
                const newPosition = Math.max(
                    currentMinPos + THUMB_SIZE, // Prevent overlap
                    Math.min(
                        SLIDER_WIDTH,
                        valueToPosition(currentMaxValue.current) + gestureState.dx
                    )
                );

                maxThumbPosition.setValue(newPosition);
                const newValue = positionToValue(newPosition);
                
                if (newValue !== currentMaxValue.current) {
                    updateValues(currentMinValue.current, newValue, false);
                }
            },
            onPanResponderRelease: () => {
                setActiveThumb(null);
                updateValues(currentMinValue.current, currentMaxValue.current, true);
            },
        })
    ).current;

    // Calculate active track width and position
    const activeTrackStyle = useMemo(() => ({
        left: minThumbPosition.interpolate({
            inputRange: [0, SLIDER_WIDTH],
            outputRange: [0, SLIDER_WIDTH],
            extrapolate: 'clamp',
        }),
        width: Animated.subtract(maxThumbPosition, minThumbPosition).interpolate({
            inputRange: [0, SLIDER_WIDTH],
            outputRange: [0, SLIDER_WIDTH],
            extrapolate: 'clamp',
        }),
    }), [minThumbPosition, maxThumbPosition]);

    // Format display labels
    const formattedMin = formatLabel?.(displayMin) ?? `₹${displayMin}`;
    const formattedMax = formatLabel?.(displayMax) ?? `₹${displayMax}`;

    return (
        <View style={styles.container}>
            {/* Value Labels */}
            <View style={styles.labelsContainer}>
                <Text style={styles.labelText}>{formattedMin}</Text>
                <Text style={styles.labelText}>{formattedMax}</Text>
            </View>

            {/* Slider Track Container */}
            <View style={styles.sliderContainer}>
                {/* Inactive Track */}
                <View style={[styles.track, styles.inactiveTrack]} />

                {/* Active Track */}
                <Animated.View 
                    style={[
                        styles.track, 
                        styles.activeTrack,
                        activeTrackStyle
                    ]} 
                />

                {/* Min Thumb */}
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            transform: [
                                { translateX: minThumbPosition },
                                { 
                                    scale: activeThumb === 'min' 
                                        ? 1.15  // Subtle scale on active
                                        : 1 
                                },
                            ],
                        },
                        activeThumb === 'min' && styles.thumbActive,
                    ]}
                    {...minPanResponder.panHandlers}
                >
                    <View style={styles.thumbInner} />
                </Animated.View>

                {/* Max Thumb */}
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            transform: [
                                { translateX: maxThumbPosition },
                                { 
                                    scale: activeThumb === 'max' 
                                        ? 1.15 
                                        : 1 
                                },
                            ],
                        },
                        activeThumb === 'max' && styles.thumbActive,
                    ]}
                    {...maxPanResponder.panHandlers}
                >
                    <View style={styles.thumbInner} />
                </Animated.View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 4,
    },
    labelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    labelText: {
        fontSize: 14,
        fontWeight: '600',
        color: ACTIVE_COLOR,
    },
    sliderContainer: {
        height: THUMB_SIZE + 20, // Extra space for thumb
        justifyContent: 'center',
        position: 'relative',
    },
    track: {
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        position: 'absolute',
    },
    inactiveTrack: {
        width: SLIDER_WIDTH,
        backgroundColor: INACTIVE_COLOR,
    },
    activeTrack: {
        backgroundColor: ACTIVE_COLOR,
    },
    thumb: {
        position: 'absolute',
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        borderRadius: THUMB_SIZE / 2,
        backgroundColor: '#FFFFFF',
        borderWidth: THUMB_BORDER_WIDTH,
        borderColor: ACTIVE_COLOR,
        marginLeft: -THUMB_SIZE / 2, // Center on position
        marginTop: -(THUMB_SIZE - TRACK_HEIGHT) / 2, // Center vertically
        shadowColor: ACTIVE_COLOR,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbActive: {
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 8,
    },
    thumbInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ACTIVE_COLOR,
    },
});

export default React.memo(PremiumRangeSlider);
