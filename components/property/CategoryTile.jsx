import React from 'react';
import { Pressable, Text, View, Dimensions } from 'react-native';
import { SvgXml } from "react-native-svg";

const { width } = Dimensions.get("window");
const TILE_SIZE = (width - 80) / 3;

const CategoryTile = ({ item, onPress }) => {
    return (
        <Pressable
            onPress={() => onPress(item.id)}
            style={{ width: TILE_SIZE, height: TILE_SIZE, marginBottom: 15 }}
            className="bg-[#F4F7FF] rounded-[18px] items-center justify-center active:bg-[#4A43EC]"
        >
            {({ pressed }) => (
                <View className="items-center justify-center">
                    <View className="justify-center items-center mb-3">
                        <SvgXml 
                            xml={item.iconXml} 
                            width={28} 
                            height={28} 
                            color={pressed ? "#fff" : "#000"} 
                        />
                    </View>
                    <Text 
                        className={`text-[12px] font-lato-bold tracking-[0.5px] uppercase ${pressed ? "text-white" : "text-gray-700"}`}
                    >
                        {item.label}
                    </Text>
                </View>
            )}
        </Pressable>
    );
};

export default CategoryTile;
