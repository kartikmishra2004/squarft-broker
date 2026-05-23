import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Circle, Ellipse, G } from 'react-native-svg';

const KycIllustration = ({ width = 400, height = 400 }) => {
    return (
        <View style={[styles.container, { width, height }]}>
            <Svg width={width} height={height} viewBox="0 0 400 400">
                {/* Background */}
                <Rect x="0" y="0" width="400" height="400" fill="#4F46E5" rx="20" />
                
                {/* Filing Cabinet */}
                <G>
                    {/* Cabinet body */}
                    <Rect x="220" y="240" width="80" height="140" fill="#1F2937" />
                    <Rect x="225" y="245" width="70" height="30" fill="#374151" />
                    <Rect x="225" y="280" width="70" height="30" fill="#374151" />
                    <Rect x="225" y="315" width="70" height="30" fill="#374151" />
                    <Rect x="225" y="350" width="70" height="25" fill="#374151" />
                    
                    {/* Drawer handles */}
                    <Rect x="255" y="257" width="10" height="6" fill="#6B7280" rx="1" />
                    <Rect x="255" y="292" width="10" height="6" fill="#6B7280" rx="1" />
                    <Rect x="255" y="327" width="10" height="6" fill="#6B7280" rx="1" />
                    <Rect x="255" y="360" width="10" height="6" fill="#6B7280" rx="1" />
                </G>
                
                {/* Person */}
                <G>
                    {/* Body */}
                    <Ellipse cx="120" cy="320" rx="35" ry="50" fill="#1F2937" />
                    
                    {/* Shirt */}
                    <Path d="M 85 300 Q 85 280 120 280 Q 155 280 155 300 L 155 340 Q 155 350 120 350 Q 85 350 85 340 Z" fill="#4F46E5" />
                    <Circle cx="100" cy="310" r="3" fill="#E0E7FF" />
                    <Circle cx="100" cy="320" r="3" fill="#E0E7FF" />
                    <Circle cx="100" cy="330" r="3" fill="#E0E7FF" />
                    
                    {/* Neck */}
                    <Rect x="110" y="250" width="20" height="30" fill="#FDB4B4" rx="3" />
                    
                    {/* Head */}
                    <Circle cx="120" cy="240" r="25" fill="#FDB4B4" />
                    
                    {/* Hair */}
                    <Path d="M 95 235 Q 95 210 120 210 Q 145 210 145 235 Q 145 245 140 250 L 100 250 Q 95 245 95 235 Z" fill="#1F2937" />
                    
                    {/* Eyes */}
                    <Circle cx="112" cy="240" r="2" fill="#1F2937" />
                    <Circle cx="128" cy="240" r="2" fill="#1F2937" />
                    
                    {/* Smile */}
                    <Path d="M 110 248 Q 120 252 130 248" stroke="#1F2937" strokeWidth="1.5" fill="none" />
                    
                    {/* Arms */}
                    <Ellipse cx="80" cy="310" rx="12" ry="35" fill="#4F46E5" transform="rotate(-20 80 310)" />
                    <Ellipse cx="160" cy="310" rx="12" ry="35" fill="#4F46E5" transform="rotate(20 160 310)" />
                    
                    {/* Hands */}
                    <Circle cx="70" cy="330" r="10" fill="#FDB4B4" />
                    <Circle cx="170" cy="330" r="10" fill="#FDB4B4" />
                    
                    {/* Legs */}
                    <Rect x="100" y="350" width="15" height="30" fill="#1F2937" rx="3" />
                    <Rect x="125" y="350" width="15" height="30" fill="#1F2937" rx="3" />
                    
                    {/* Shoes */}
                    <Ellipse cx="107" cy="380" rx="12" ry="6" fill="#4F46E5" />
                    <Ellipse cx="132" cy="380" rx="12" ry="6" fill="#4F46E5" />
                </G>
                
                {/* Floating Documents */}
                <G>
                    {/* Document 1 - Top Left */}
                    <Rect x="60" y="120" width="50" height="60" fill="white" rx="3" transform="rotate(-15 85 150)" />
                    <Rect x="68" y="130" width="34" height="4" fill="#E5E7EB" rx="1" transform="rotate(-15 85 150)" />
                    <Rect x="68" y="140" width="34" height="4" fill="#E5E7EB" rx="1" transform="rotate(-15 85 150)" />
                    <Rect x="68" y="150" width="25" height="4" fill="#E5E7EB" rx="1" transform="rotate(-15 85 150)" />
                    
                    {/* Document 2 - Top Center */}
                    <Rect x="140" y="100" width="55" height="65" fill="white" rx="3" transform="rotate(10 167 132)" />
                    <Rect x="148" y="110" width="39" height="4" fill="#E5E7EB" rx="1" transform="rotate(10 167 132)" />
                    <Rect x="148" y="120" width="39" height="4" fill="#E5E7EB" rx="1" transform="rotate(10 167 132)" />
                    <Rect x="148" y="130" width="30" height="4" fill="#E5E7EB" rx="1" transform="rotate(10 167 132)" />
                    
                    {/* Document 3 - Top Right */}
                    <Rect x="250" y="115" width="60" height="70" fill="white" rx="3" transform="rotate(-8 280 150)" />
                    <Rect x="258" y="125" width="44" height="4" fill="#E5E7EB" rx="1" transform="rotate(-8 280 150)" />
                    <Rect x="258" y="135" width="44" height="4" fill="#E5E7EB" rx="1" transform="rotate(-8 280 150)" />
                    <Rect x="258" y="145" width="35" height="4" fill="#E5E7EB" rx="1" transform="rotate(-8 280 150)" />
                    
                    {/* Document 4 - Left Side */}
                    <Rect x="30" y="200" width="45" height="55" fill="white" rx="3" transform="rotate(20 52 227)" />
                    <Rect x="38" y="210" width="29" height="4" fill="#E5E7EB" rx="1" transform="rotate(20 52 227)" />
                    <Rect x="38" y="220" width="29" height="4" fill="#E5E7EB" rx="1" transform="rotate(20 52 227)" />
                    
                    {/* Document 5 - Right Side with Icon */}
                    <Rect x="310" y="200" width="65" height="75" fill="white" rx="3" transform="rotate(12 342 237)" />
                    <Circle cx="342" cy="225" r="15" fill="#4F46E5" opacity="0.2" transform="rotate(12 342 237)" />
                    <Path d="M 335 220 L 342 227 L 349 215" stroke="#4F46E5" strokeWidth="2" fill="none" transform="rotate(12 342 237)" />
                    <Rect x="318" y="245" width="48" height="4" fill="#E5E7EB" rx="1" transform="rotate(12 342 237)" />
                    <Rect x="318" y="255" width="38" height="4" fill="#E5E7EB" rx="1" transform="rotate(12 342 237)" />
                    
                    {/* Document 6 - Bottom Right */}
                    <Rect x="280" y="300" width="50" height="60" fill="white" rx="3" transform="rotate(-12 305 330)" />
                    <Rect x="288" y="310" width="34" height="4" fill="#E5E7EB" rx="1" transform="rotate(-12 305 330)" />
                    <Rect x="288" y="320" width="34" height="4" fill="#E5E7EB" rx="1" transform="rotate(-12 305 330)" />
                </G>
                
                {/* Document in hand */}
                <G>
                    <Rect x="55" y="310" width="40" height="50" fill="white" rx="2" transform="rotate(-25 75 335)" />
                    <Rect x="62" y="318" width="26" height="3" fill="#4F46E5" rx="1" transform="rotate(-25 75 335)" />
                    <Rect x="62" y="326" width="26" height="3" fill="#E5E7EB" rx="1" transform="rotate(-25 75 335)" />
                    <Rect x="62" y="334" width="20" height="3" fill="#E5E7EB" rx="1" transform="rotate(-25 75 335)" />
                </G>
                
                {/* Decorative shapes */}
                <Circle cx="320" cy="80" r="25" fill="#6366F1" opacity="0.3" />
                <Circle cx="50" cy="350" r="20" fill="#818CF8" opacity="0.2" />
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default KycIllustration;
