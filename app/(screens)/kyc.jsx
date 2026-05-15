import React, { useState, useEffect } from 'react';
import {
    View, Text, Pressable, StatusBar, ScrollView, Image,
    StyleSheet, Alert, Platform, TextInput, ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { setKycCompleted, uploadKyc, fetchKyc } from '../../store/slices/authSlice';
import { updateDocument } from '../../store/slices/documentSlice';


const KycScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { loading, kyc } = useSelector((state) => state.auth);

    const [aadharFront, setAadharFront] = useState(null);
    const [aadharBack, setAadharBack]   = useState(null);
    const [panCard, setPanCard]         = useState(null);
    const [selfie, setSelfie]           = useState(null);
    const [aadharNumber, setAadharNumber] = useState('');
    const [panNumber, setPanNumber]       = useState('');

    // Pre-fill if KYC already exists
    useEffect(() => {
        dispatch(fetchKyc());
    }, []);

    useEffect(() => {
        if (kyc) {
            if (kyc.aadhar_number) setAadharNumber(kyc.aadhar_number);
            if (kyc.pan_number)    setPanNumber(kyc.pan_number);
        }
    }, [kyc]);

    const pickImage = async (setter, type = 'library') => {
        let result;
        if (type === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required.');
                return;
            }
            result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
        }
        if (!result.canceled) setter(result.assets[0]);
    };

    const handleDone = async () => {
        if (!aadharFront || !aadharBack || !panCard || !selfie) {
            Alert.alert("Incomplete KYC", "Please upload all required documents and a selfie.");
            return;
        }
        if (!aadharNumber.trim() || !panNumber.trim()) {
            Alert.alert("Missing Info", "Please enter your Aadhar number and PAN number.");
            return;
        }

        try {
            await dispatch(uploadKyc({
                aadharFront,
                aadharBack,
                panCard,
                profilePhoto: selfie,
                aadharNumber: aadharNumber.trim(),
                panNumber: panNumber.trim(),
            })).unwrap();

            // Update local document store
            [
                { id: 'adhar_front', data: aadharFront, type: 'ADHAR_FRONT', name: 'Adharcard Front' },
                { id: 'adhar_back',  data: aadharBack,  type: 'ADHAR_BACK',  name: 'Adharcard Back' },
                { id: 'pan',         data: panCard,     type: 'PAN',         name: 'PAN Card' },
                { id: 'selfie',      data: selfie,      type: 'SELFIE',      name: 'Selfie' },
            ].forEach(doc => dispatch(updateDocument({
                id: doc.id, name: doc.name, type: doc.type,
                imageUrl: doc.data.uri, status: 'pending', size: 'Uploaded',
            })));

            dispatch(setKycCompleted(true));
            Alert.alert("KYC Submitted", "Your KYC has been submitted for verification.", [
                { text: "OK", onPress: () => router.replace("/(tabs)/home") }
            ]);
        } catch (err) {
            Alert.alert("Upload Failed", err || "Something went wrong. Please try again.");
        }
    };

    const UploadBox = ({ label, value, onPick, onRemove, icon, isCamera = false, existingUrl = null }) => (
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
                        <Pressable onPress={onRemove} className="bg-red-50 rounded-full p-2">
                            <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                        </Pressable>
                    </View>
                    <View className="w-full h-[180px] rounded-xl overflow-hidden">
                        <Image source={{ uri: value.uri }} className="w-full h-full" resizeMode="cover" />
                    </View>
                </View>
            ) : existingUrl ? (
                <View className="bg-white rounded-2xl p-3 border border-[#4A43EC]/30">
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="checkmark-circle" size={18} color="#4A43EC" />
                        <Text className="text-xs text-[#4A43EC] font-manrope-medium ml-1">Previously uploaded</Text>
                    </View>
                    <View className="w-full h-[180px] rounded-xl overflow-hidden">
                        <Image source={{ uri: existingUrl }} className="w-full h-full" resizeMode="cover" />
                    </View>
                    <Pressable onPress={() => onPick(isCamera ? 'camera' : 'library')} className="mt-2 py-2 items-center">
                        <Text className="text-xs text-[#4A43EC] font-manrope-medium underline">Replace</Text>
                    </Pressable>
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

            <View className="pt-[55px] pb-4 px-6 flex-row items-center justify-between">
                <Pressable onPress={() => router.back()} className="p-1">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </Pressable>
                <Text className="text-black text-[18px] font-manrope-bold">KYC</Text>
                <View style={{ width: 28 }} />
            </View>

            <ScrollView
                className="flex-1 px-6 pt-4"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: Platform.OS === 'ios' ? 40 : 90 }}
            >
                {/* Aadhar Number */}
                <View className="mb-5">
                    <Text className="text-[14px] font-manrope-medium text-[#272727] mb-2">Aadhar Number</Text>
                    <TextInput
                        value={aadharNumber}
                        onChangeText={setAadharNumber}
                        placeholder="Enter 12-digit Aadhar number"
                        placeholderTextColor="#aaa"
                        keyboardType="number-pad"
                        maxLength={12}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-black"
                    />
                </View>

                <UploadBox
                    label="Upload Aadhar Card Front View"
                    value={aadharFront}
                    onPick={(type) => pickImage(setAadharFront, type)}
                    onRemove={() => setAadharFront(null)}
                    icon="cloud-upload-outline"
                    existingUrl={kyc?.aadhar_front_url}
                />

                <UploadBox
                    label="Upload Aadhar Card Back View"
                    value={aadharBack}
                    onPick={(type) => pickImage(setAadharBack, type)}
                    onRemove={() => setAadharBack(null)}
                    icon="cloud-upload-outline"
                    existingUrl={kyc?.aadhar_back_url}
                />

                {/* PAN Number */}
                <View className="mb-5">
                    <Text className="text-[14px] font-manrope-medium text-[#272727] mb-2">PAN Number</Text>
                    <TextInput
                        value={panNumber}
                        onChangeText={(v) => setPanNumber(v.toUpperCase())}
                        placeholder="eg. ABCDE1234F"
                        placeholderTextColor="#aaa"
                        autoCapitalize="characters"
                        maxLength={10}
                        className="border border-gray-200 rounded-xl px-4 py-3 text-[15px] text-black"
                    />
                </View>

                <UploadBox
                    label="Upload PAN Card"
                    value={panCard}
                    onPick={(type) => pickImage(setPanCard, type)}
                    onRemove={() => setPanCard(null)}
                    icon="cloud-upload-outline"
                    existingUrl={kyc?.pan_card_url}
                />

                <UploadBox
                    label="Upload Profile Picture / Selfie"
                    value={selfie}
                    onPick={(type) => pickImage(setSelfie, type)}
                    onRemove={() => setSelfie(null)}
                    icon="camera-outline"
                    isCamera={true}
                    existingUrl={kyc?.profile_photo_url}
                />

                <Pressable
                    onPress={handleDone}
                    disabled={loading}
                    className={`py-4 rounded-xl items-center justify-center mt-6 shadow-lg shadow-blue-300 ${loading ? 'opacity-70' : 'bg-[#4A43EC]'}`}
                    style={{ backgroundColor: loading ? '#7B75F0' : '#4A43EC' }}
                >
                    {loading
                        ? <ActivityIndicator color="white" />
                        : <Text className="text-white text-[16px] font-manrope-bold">Submit KYC</Text>
                    }
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
