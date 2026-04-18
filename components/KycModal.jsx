import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Dimensions } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { router, usePathname } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { setKycCompleted } from '../store/slices/authSlice';

const { width } = Dimensions.get('window');

const KycModal = () => {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const { isKycCompleted, isLoggedIn } = useSelector((state) => state.auth);

    // If already completed, not logged in, or on the KYC screen, hide the modal
    if (isKycCompleted || !isLoggedIn || pathname.includes('kyc')) {
        return null;
    }

    const handleCompleteKyc = () => {
        router.push('/(screens)/kyc');
    };

    const handleRefresh = () => {
        // In a real app, you would fetch from API here.
        // For now, we simulate a check. If state was changed elsewhere, it's already true.
        // If not, we could show a toast or alert.
        console.log('Refreshing KYC status...');
        // If the user wants to test the flow, they can click refresh to see it hide if they finished KYC.
    };

    return (
        <Modal
            transparent={true}
            visible={true}
            animationType="fade"
        >
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons name="shield-account-variant-outline" size={50} color="#4A43EC" />
                    </View>
                    
                    <Text style={styles.title}>Complete Your KYC</Text>
                    <Text style={styles.description}>
                        To unlock all features of the app and continue your journey, please complete your KYC verification.
                    </Text>

                    <View style={styles.buttonContainer}>
                        <Pressable 
                            style={styles.primaryButton}
                            onPress={handleCompleteKyc}
                        >
                            <Text style={styles.primaryButtonText}>Complete KYC</Text>
                        </Pressable>

                        <Pressable 
                            style={styles.secondaryButton}
                            onPress={handleRefresh}
                        >
                            <Text style={styles.secondaryButtonText}>Refresh</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.85,
        backgroundColor: 'white',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 10,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F4F7FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontFamily: 'Lato-Bold',
        color: '#1a1a1a',
        marginBottom: 12,
        textAlign: 'center',
    },
    description: {
        fontSize: 14,
        fontFamily: 'Lato-Regular',
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 30,
    },
    buttonContainer: {
        width: '100%',
        gap: 12,
    },
    primaryButton: {
        backgroundColor: '#4A43EC',
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Lato-Bold',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        paddingVertical: 14,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    secondaryButtonText: {
        color: '#666',
        fontSize: 16,
        fontFamily: 'Lato-Bold',
    },
});

export default KycModal;
