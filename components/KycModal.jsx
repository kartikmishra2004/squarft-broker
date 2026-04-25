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
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <MaterialCommunityIcons name="shield" size={40} color="#FFD700" />
                            <View style={styles.questionMarkContainer}>
                                <Text style={styles.questionMark}>?</Text>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.divider} />

                    <View style={styles.content}>
                        <Text style={styles.title}>Please Complete Your KYC</Text>
                        <Text style={styles.description}>
                            Complete your KYC to start uploading your property and reach potential buyers.
                        </Text>

                        <Pressable 
                            style={styles.primaryButton}
                            onPress={handleCompleteKyc}
                        >
                            <Text style={styles.primaryButtonText}>Proceed</Text>
                        </Pressable>

                        <Pressable 
                            style={styles.refreshButton}
                            onPress={handleRefresh}
                        >
                            <Text style={styles.refreshButtonText}>Refresh Status</Text>
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
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.92,
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 15,
        elevation: 5,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionMarkContainer: {
        position: 'absolute',
        top: '20%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    questionMark: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        width: '100%',
    },
    content: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
        alignItems: 'center',
    },
    title: {
        fontSize: 19,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 6,
        textAlign: 'center',
    },
    description: {
        fontSize: 13,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 18,
        marginBottom: 20,
        paddingHorizontal: 15,
    },
    primaryButton: {
        backgroundColor: '#4338CA',
        paddingVertical: 12,
        borderRadius: 100,
        width: '100%',
        alignItems: 'center',
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 15,
        fontWeight: '600',
    },
    refreshButton: {
        marginTop: 8,
        paddingVertical: 4,
    },
    refreshButtonText: {
        color: '#9CA3AF',
        fontSize: 12,
        fontWeight: '500',
        textDecorationLine: 'underline',
    },
});

export default KycModal;
