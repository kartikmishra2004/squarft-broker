import { useState } from "react";
import {
    View, Text, Pressable, StatusBar, Platform,
    ScrollView, Image, StyleSheet, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import * as ImagePicker from "expo-image-picker";
import { uploadKyc, fetchKyc } from "../../store/slices/authSlice";
import { setKycCompleted } from "../../store/slices/authSlice";

const DOCS = [
    { key: "aadharFront",  label: "Upload Adhar Card Front View", isCamera: false },
    { key: "aadharBack",   label: "Upload Adhar Card Back View",  isCamera: false },
    { key: "panCard",      label: "Upload Pan Card",              isCamera: false },
    { key: "selfie",       label: "Upload Profile Picture",       isCamera: true  },
];

export default function MyDocuments() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { loading, kyc } = useSelector(state => state.auth);

    const [files, setFiles] = useState({
        aadharFront: null,
        aadharBack:  null,
        panCard:     null,
        selfie:      null,
    });

    const pickImage = async (key, isCamera) => {
        let result;
        if (isCamera) {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Camera permission is required.');
                return;
            }
            result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
        } else {
            result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 });
        }
        if (!result.canceled) {
            setFiles(prev => ({ ...prev, [key]: result.assets[0] }));
        }
    };

    const handleSave = async () => {
        const hasAny = Object.values(files).some(Boolean);
        console.log('[MyDocs] files state:', JSON.stringify(Object.keys(files).map(k => ({ key: k, hasFile: !!files[k] }))));
        if (!hasAny) {
            Alert.alert("No changes", "Please upload at least one document to save.");
            return;
        }
        try {
            console.log('[MyDocs] dispatching uploadKyc...');
            const result = await dispatch(uploadKyc({
                aadharFront:  files.aadharFront,
                aadharBack:   files.aadharBack,
                panCard:      files.panCard,
                profilePhoto: files.selfie,
            })).unwrap();
            console.log('[MyDocs] uploadKyc success:', JSON.stringify(result));
            dispatch(setKycCompleted(true));
            await dispatch(fetchKyc());
            Alert.alert("Documents Uploaded Successfully", "Wait for document approval.", [
                { text: "OK", onPress: () => router.back() }
            ]);
        } catch (err) {
            console.log('[MyDocs] uploadKyc error:', JSON.stringify(err));
            Alert.alert("Failed", typeof err === 'string' ? err : JSON.stringify(err) || "Something went wrong.");
        }
    };

    // Map existing KYC urls
    const existingUrls = {
        aadharFront: kyc?.aadhar_front_url,
        aadharBack:  kyc?.aadhar_back_url,
        panCard:     kyc?.pan_card_url,
        selfie:      kyc?.profile_photo_url,
    };

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <StatusBar barStyle="dark-content" />

            <View style={{
                flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                paddingHorizontal: 20, paddingBottom: 10,
                paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 10 : 50,
            }}>
                <Pressable onPress={() => router.back()} style={{ padding: 4 }}>
                    <Ionicons name="arrow-back" size={24} color="#111" />
                </Pressable>
                <Text style={{ fontSize: 17, fontFamily: "Lato-Bold", color: "#111" }}>My Documents</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView
                contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            >
                {DOCS.map(({ key, label, isCamera }) => {
                    const file = files[key];
                    const existingUrl = existingUrls[key];

                    return (
                        <View key={key} style={{ marginBottom: 24 }}>
                            <Text style={{ fontSize: 14, fontFamily: "Manrope-Bold", color: "#111", marginBottom: 10 }}>
                                {label}
                            </Text>

                            {file ? (
                                // Newly picked file — show preview with filename bar
                                <View>
                                    <View style={styles.fileBar}>
                                        <Text style={styles.fileName} numberOfLines={1}>
                                            {file.fileName || (isCamera ? 'Selfie.jpg' : 'Document.jpg')}
                                        </Text>
                                        <Pressable onPress={() => setFiles(prev => ({ ...prev, [key]: null }))}>
                                            <Ionicons name="close-circle" size={20} color="#4A43EC" />
                                        </Pressable>
                                    </View>
                                    <View style={{ borderRadius: 12, overflow: "hidden", marginTop: 8 }}>
                                        <Image source={{ uri: file.uri }} style={{ width: "100%", height: 160 }} resizeMode="cover" />
                                    </View>
                                </View>
                            ) : existingUrl ? (
                                // Already uploaded — show existing with replace option
                                <View>
                                    <View style={styles.fileBar}>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                                            <Ionicons name="checkmark-circle" size={16} color="#4A43EC" />
                                            <Text style={[styles.fileName, { color: "#4A43EC" }]}>Previously uploaded</Text>
                                        </View>
                                        <Pressable onPress={() => pickImage(key, isCamera)}>
                                            <Text style={{ fontSize: 12, fontFamily: "Manrope-Bold", color: "#4A43EC" }}>Replace</Text>
                                        </Pressable>
                                    </View>
                                    <View style={{ borderRadius: 12, overflow: "hidden", marginTop: 8 }}>
                                        <Image source={{ uri: existingUrl }} style={{ width: "100%", height: 160 }} resizeMode="cover" />
                                    </View>
                                </View>
                            ) : (
                                // Empty — show upload box
                                <Pressable
                                    onPress={() => pickImage(key, isCamera)}
                                    style={styles.uploadBox}
                                >
                                    <MaterialCommunityIcons name="cloud-upload-outline" size={48} color="#4A43EC" />
                                    <Text style={styles.uploadText}>
                                        {isCamera ? "Open Camera to Upload" : "Click to Upload or "}
                                        {!isCamera && <Text style={{ color: "#4A43EC", textDecorationLine: "underline" }}>Browse</Text>}
                                    </Text>
                                    <Text style={styles.uploadSub}>
                                        {isCamera ? "Supported formats: PNG" : "Supported formats: PDF, PNG"}
                                    </Text>
                                </Pressable>
                            )}
                        </View>
                    );
                })}

                <Pressable
                    onPress={handleSave}
                    disabled={loading}
                    style={[styles.saveBtn, loading && { opacity: 0.7 }]}
                >
                    {loading
                        ? <ActivityIndicator color="white" />
                        : <Text style={styles.saveBtnText}>Save Documents</Text>
                    }
                </Pressable>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    fileBar: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        borderBottomWidth: 2, borderBottomColor: "#4A43EC", paddingBottom: 6,
    },
    fileName: {
        flex: 1, fontSize: 13, fontFamily: "Manrope-Medium", color: "#333", marginRight: 8,
    },
    uploadBox: {
        backgroundColor: "#EEF0FB", borderWidth: 1.5, borderStyle: "dashed",
        borderColor: "#B0C4FF", borderRadius: 16, alignItems: "center",
        justifyContent: "center", paddingVertical: 32,
    },
    uploadText: {
        fontSize: 15, fontFamily: "Manrope-Bold", color: "#1a1a1a", marginTop: 10,
    },
    uploadSub: {
        fontSize: 11, fontFamily: "Manrope-Regular", color: "#9CA3AF", marginTop: 4,
    },
    saveBtn: {
        backgroundColor: "#4A43EC", borderRadius: 14, paddingVertical: 16,
        alignItems: "center", marginTop: 8,
    },
    saveBtnText: {
        color: "white", fontSize: 15, fontFamily: "Manrope-Bold",
    },
});
