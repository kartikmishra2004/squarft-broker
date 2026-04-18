import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SvgXml } from "react-native-svg";

const CategoryTile = ({ item, onPress }) => {
    return (
        <Pressable
            onPress={() => onPress(item.id)}
            className="w-[30%] aspect-square rounded-[20px] py-7 items-center justify-center mb-4 mx-[1.5%] bg-[#EBF1FF] active:bg-[#4A43EC]"
        >
            {({ pressed }) => (
                <View className="items-center justify-center">
                    <SvgXml xml={item.iconXml} width={24} height={24} color={pressed ? "#fff" : "#282D2F"} />
                    <Text className={`text-[12px] mt-1.5 font-lato ${pressed ? "text-white" : "text-[#282D2F]"}`}>{item.label}</Text>
                </View>
            )}
        </Pressable>
    );
};

export default CategoryTile;
