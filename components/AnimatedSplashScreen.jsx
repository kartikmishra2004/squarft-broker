import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Image } from 'expo-image';

const { width, height } = Dimensions.get('window');

export default function AnimatedSplashScreen({ onFinish }) {
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Auto-hide splash after 3 seconds with fade out
        const timer = setTimeout(() => {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                onFinish?.();
            });
        }, 3000);

        return () => clearTimeout(timer);
    }, [fadeAnim, onFinish]);

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <Image
                source={require('../assets/images/splash-mobile.gif')}
                style={styles.image}
                contentFit="cover"
                priority="high"
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: width,
        height: height,
        backgroundColor: '#4A43EC',
        zIndex: 9999,
    },
    image: {
        width: '100%',
        height: '100%',
    },
});
