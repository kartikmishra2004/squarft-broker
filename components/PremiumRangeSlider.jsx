import React, { useRef, useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Platform } from 'react-native';
const TRACK_HEIGHT = 6; 

// Redfin Signature Style Palette
const ACTIVE_COLOR = '#4A43EC'; 
const INACTIVE_COLOR = '#D1D5DB'; 
const TEXT_COLOR = '#222222'; 

// Redfin Rectangular Handle Metrics
const THUMB_WIDTH = 24; 
const THUMB_HEIGHT = 24;
const THUMB_RADIUS = 20;

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
    const initialMinValue = useMemo(() => initialMin ?? min, [initialMin, min]);
    const initialMaxValue = useMemo(() => initialMax ?? max, [initialMax, max]);

    const minThumbPosition = useRef(new Animated.Value(0)).current;
    const maxThumbPosition = useRef(new Animated.Value(0)).current;

    const currentMinValue = useRef(initialMinValue);
    const currentMaxValue = useRef(initialMaxValue);

    const [displayMin, setDisplayMin] = useState(initialMinValue);
    const [displayMax, setDisplayMax] = useState(initialMaxValue);
    const [activeThumb, setActiveThumb] = useState(null);
    const [sliderWidth, setSliderWidth] = useState(0);
    const dragStart = useRef(0);

    // Convert value to position coordinates
    const valueToPosition = useCallback((value) => {
        const range = max - min;
        const percentage = (value - min) / range;
        return percentage * sliderWidth;
    }, [min, max, sliderWidth]);

    // Convert screen coordinates directly back to target steps values
    const positionToValue = useCallback((position) => {
        const percentage = sliderWidth ? Math.max(0, Math.min(1, position / sliderWidth)) : 0;
        const rawValue = min + percentage * (max - min);
        const steppedValue = min + Math.round((rawValue - min) / step) * step;
        return Math.max(min, Math.min(max, steppedValue));
    }, [min, max, step, sliderWidth]);

    React.useEffect(() => {
        const minPos = valueToPosition(initialMinValue);
        const maxPos = valueToPosition(initialMaxValue);
        
        minThumbPosition.setValue(minPos);
        maxThumbPosition.setValue(maxPos);
        
        currentMinValue.current = initialMinValue;
        currentMaxValue.current = initialMaxValue;
    }, [initialMinValue, initialMaxValue, valueToPosition, minThumbPosition, maxThumbPosition]);

    const updateValues = useCallback((newMin, newMax, isFinal = false) => {
        currentMinValue.current = newMin;
        currentMaxValue.current = newMax;

        if (isFinal) {
            setDisplayMin(newMin);
            setDisplayMax(newMax);
            onValuesChangeFinish?.([newMin, newMax]);
        } else {
            onValuesChange?.([newMin, newMax]);
        }
    }, [onValuesChange, onValuesChangeFinish]);

    // MIN THUMB PAN RESPONDER WITH POSITION FRICTION
    const minPanResponder = useMemo(() =>
        PanResponder.create({
            // Do not capture the initial touch. This lets the parent bottom-sheet
            // scroll view take over when a vertical swipe starts on a thumb.
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, { dx, dy }) =>
                Math.abs(dx) > 3 && Math.abs(dx) > Math.abs(dy),
            onPanResponderGrant: () => {
                dragStart.current = valueToPosition(currentMinValue.current);
                setActiveThumb('min');
            },
            onPanResponderMove: (_, gestureState) => {
                const currentMaxPos = valueToPosition(currentMaxValue.current);
                
                // FIXED: Calculates location based on absolute screen coordinates relative to container start padding.
                // This eliminates fluid vector drift and acts as infinite immediate drag friction.
                const absoluteTargetPosition = dragStart.current + gestureState.dx;
                
                const newPosition = Math.max(
                    0,
                    Math.min(
                        currentMaxPos,
                        absoluteTargetPosition
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
            onPanResponderTerminate: () => setActiveThumb(null),
            onPanResponderTerminationRequest: () => true,
        }), [positionToValue, updateValues, valueToPosition, minThumbPosition]);

    // MAX THUMB PAN RESPONDER WITH POSITION FRICTION
    const maxPanResponder = useMemo(() =>
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, { dx, dy }) =>
                Math.abs(dx) > 3 && Math.abs(dx) > Math.abs(dy),
            onPanResponderGrant: () => {
                dragStart.current = valueToPosition(currentMaxValue.current);
                setActiveThumb('max');
            },
            onPanResponderMove: (_, gestureState) => {
                const currentMinPos = valueToPosition(currentMinValue.current);
                
                // FIXED: Calculates location based on absolute screen coordinates relative to container start padding.
                const absoluteTargetPosition = dragStart.current + gestureState.dx;
                
                const newPosition = Math.max(
                    currentMinPos,
                    Math.min(
                        sliderWidth,
                        absoluteTargetPosition
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
            onPanResponderTerminate: () => setActiveThumb(null),
            onPanResponderTerminationRequest: () => true,
        }), [positionToValue, sliderWidth, updateValues, valueToPosition, maxThumbPosition]);

    const activeTrackStyle = useMemo(() => ({
        left: minThumbPosition.interpolate({
            inputRange: [0, Math.max(1, sliderWidth)],
            outputRange: [0, Math.max(1, sliderWidth)],
            extrapolate: 'clamp',
        }),
        width: Animated.subtract(maxThumbPosition, minThumbPosition).interpolate({
            inputRange: [0, Math.max(1, sliderWidth)],
            outputRange: [0, Math.max(1, sliderWidth)],
            extrapolate: 'clamp',
        }),
    }), [minThumbPosition, maxThumbPosition, sliderWidth]);

    const formattedMin = formatLabel?.(displayMin) ?? `₹${displayMin}`;
    const formattedMax = formatLabel?.(displayMax) ?? `₹${displayMax}`;

    return (
        <View style={styles.container}>
            {/* Value Labels Header */}
            <View style={styles.labelsContainer}>
                <Text style={styles.labelText}>{formattedMin}</Text>
                <Text style={styles.labelSeparator}>—</Text>
                <Text style={styles.labelText}>{formattedMax}</Text>
            </View>

            {/* Slider Track Body Field */}
            <View style={styles.sliderContainer} onLayout={(event) => setSliderWidth(event.nativeEvent.layout.width)}>
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

                {/* Min Thumb Rectangular Pill */}
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            transform: [
                                { translateX: minThumbPosition },
                                { 
                                    scale: activeThumb === 'min' ? 1.05 : 1 
                                },
                            ],
                        },
                    ]}
                    {...minPanResponder.panHandlers}
                />

                {/* Max Thumb Rectangular Pill */}
                <Animated.View
                    style={[
                        styles.thumb,
                        {
                            transform: [
                                { translateX: maxThumbPosition },
                                { 
                                    scale: activeThumb === 'max' ? 1.05 : 1 
                                },
                            ],
                        },
                    ]}
                    {...maxPanResponder.panHandlers}
                />
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
        alignItems: 'center',
        marginBottom: 20,
    },
    labelText: {
        fontSize: 15,
        fontWeight: '700',
        color: TEXT_COLOR,
        fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    },
    labelSeparator: {
        marginHorizontal: 8,
        fontSize: 14,
        color: '#666666',
    },
    sliderContainer: {
        height: THUMB_HEIGHT + 10, 
        justifyContent: 'center',
        position: 'relative',
    },
    track: {
        height: TRACK_HEIGHT,
        borderRadius: TRACK_HEIGHT / 2,
        position: 'absolute',
    },
    inactiveTrack: {
        left: 0,
        right: 0,
        backgroundColor: INACTIVE_COLOR,
    },
    activeTrack: {
        backgroundColor: ACTIVE_COLOR,
    },
    thumb: {
        position: 'absolute',
        width: THUMB_WIDTH,
        height: THUMB_HEIGHT,
        borderRadius: THUMB_RADIUS,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#CCCCCC',
        marginLeft: -THUMB_WIDTH / 2, 
        marginTop: -(THUMB_HEIGHT - TRACK_HEIGHT) / 2, 
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.18,
        shadowRadius: 4,
        elevation: 4,
    },
});

export default React.memo(PremiumRangeSlider);
