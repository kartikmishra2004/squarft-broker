import React, { useState } from 'react';
import { View, Text, Pressable, StatusBar, ScrollView, Image, StyleSheet, Dimensions, Alert, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { setKycCompleted } from '../../store/slices/authSlice';
import { updateDocument } from '../../store/slices/documentSlice';

const { width } = Dimensions.get('window');

const KycScreen = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const dispatch = useDispatch();

    const [adharFront, setAdharFront] = useState(null);
    const [adharBack, setAdharBack] = useState(null);
    const [panCard, setPanCard] = useState(null);
    const [selfie, setSelfie] = useState(null);

    const pickImage = async (setter, type = 'library') => {
        let result;
        if (type === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required to take a selfie.');
                return;
            }
            result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });
        }

        if (!result.canceled) {
            setter(result.assets[0]);
        }
    };

    const handleDone = () => {
        if (!adharFront || !adharBack || !panCard || !selfie) {
            Alert.alert("Incomplete KYC", "Please upload all required documents and a selfie.");
            return;
        }

        // Sync with My Documents state
        const docsToUpdate = [
            { id: 'adhar_front', data: adharFront, type: 'ADHAR_FRONT', name: 'Adharcard Front' },
            { id: 'adhar_back', data: adharBack, type: 'ADHAR_BACK', name: 'Adharcard Back' },
            { id: 'pan', data: panCard, type: 'PAN', name: 'PAN Card' },
            { id: 'selfie', data: selfie, type: 'SELFIE', name: 'Selfie' },
        ];

        docsToUpdate.forEach(doc => {
            dispatch(updateDocument({
                id: doc.id,
                name: doc.name,
                type: doc.type,
                imageUrl: doc.data.uri,
                status: 'approved', // Assuming automated approval for demo purposes
                size: 'Uploaded',
            }));
        });

        // Update Redux state
        dispatch(setKycCompleted(true));

        // Navigate to home (or appropriate screen)
        router.replace("/(tabs)/home");
    };

    const UploadBox = ({ label, value, onPick, onRemove, icon, isCamera = false }) => (
        <View className="mb-6">
            <Text className="text-[14px] font-manrope-medium text-[#272727] mb-3">{label}</Text>
            {value ? (
                <View className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center flex-1 mr-2">
                            <View className="bg-[#F4F7FF] p-2 rounded-lg mr-3">
                                <MaterialCommunityIcons name={isCamera ? "camera" : "file-image"} size={20} color="#4A43EC" />
                            </View>
                            <Text className="text-[14px] font-manrope-bold text-[#272727] flex-1" numberOfLines={1}>
                                {value.fileName || (isCamera ? 'Selfie_Captured.jpg' : 'Document_Uploaded.jpg')}
                            </Text>
                        </View>
                        <Pressable
                            onPress={onRemove}
                            className="bg-red-50 rounded-full p-2"
                        >
                            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                        </Pressable>
                    </View>
                    <View className="w-full h-[180px] rounded-xl overflow-hidden">
                        <Image
                            source={{ uri: value.uri }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </View>
                </View>
            ) : (
                <Pressable
                    onPress={() => onPick(isCamera ? 'camera' : 'library')}
                    style={styles.dashedBox}
                    className="w-full h-[180px] bg-[#F4F7FF] rounded-2xl items-center justify-center"
                >
                    <View className="bg-white p-4 rounded-full mb-3 shadow-sm">
                        <MaterialCommunityIcons name={icon} size={32} color="#4A43EC" />
                    </View>
                    <Text className="text-[16px] font-manrope-bold text-[#1a1a1a]">
                        {isCamera ? "Open Camera to Upload" : "Click to Upload or "}
                        {!isCamera && <Text className="text-[#4A43EC] underline">Browse</Text>}
                    </Text>
                    <Text className="text-[10px] text-gray-400 mt-2 font-manrope-regular">
                        Supported formats: PDF, PNG, JPG
                    </Text>
                </Pressable>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View className="pt-[55px] pb-4 px-6 flex-row items-center justify-between">
                <Pressable onPress={() => router.back()} className="p-1">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </Pressable>
                <Text className="text-black text-[18px] font-manrope-bold">KYC</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 40 : 90 }}>
                <UploadBox
                    label="Upload Adhar Card Front View"
                    value={adharFront}
                    onPick={(type) => pickImage(setAdharFront, type)}
                    onRemove={() => setAdharFront(null)}
                    icon="cloud-upload-outline"
                />

                <UploadBox
                    label="Upload Adhar Card Back View"
                    value={adharBack}
                    onPick={(type) => pickImage(setAdharBack, type)}
                    onRemove={() => setAdharBack(null)}
                    icon="cloud-upload-outline"
                />

                <UploadBox
                    label="Upload Pan Card"
                    value={panCard}
                    onPick={(type) => pickImage(setPanCard, type)}
                    onRemove={() => setPanCard(null)}
                    icon="cloud-upload-outline"
                />

                <UploadBox
                    label="Upload Profile Picture / Selfie"
                    value={selfie}
                    onPick={(type) => pickImage(setSelfie, type)}
                    onRemove={() => setSelfie(null)}
                    icon="camera-outline"
                    isCamera={true}
                />

                <Pressable
                    onPress={handleDone}
                    className="bg-[#4A43EC] py-4 rounded-xl items-center justify-center mt-6 shadow-lg shadow-blue-300"
                >
                    <Text className="text-white text-[16px] font-manrope-bold">Done</Text>
                </Pressable>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    dashedBox: {
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#B0C4FF',
    }
});

export default KycScreen;
