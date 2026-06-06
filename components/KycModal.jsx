import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { router, usePathname } from 'expo-router';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { setKycCompleted } from '../store/slices/authSlice';
import KycIllustration from './KycIllustration';

const KycModal = () => {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const bottomSheetModalRef = useRef(null);
    const { isKycCompleted, isLoggedIn } = useSelector((state) => state.auth);

    const snapPoints = useMemo(() => ['75%'], []);

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                appearsOnIndex={0}
                disappearsOnIndex={-1}
                opacity={0.5}
                pressBehavior="none"
            />
        ),
        []
    );

    useEffect(() => {
        if (!isKycCompleted && isLoggedIn && !pathname.includes('kyc') && !pathname.includes('my-documents')) {
            bottomSheetModalRef.current?.present();
        } else {
            bottomSheetModalRef.current?.dismiss();
        }
    }, [isKycCompleted, isLoggedIn, pathname]);

    const handleCompleteKyc = () => {
        // Redirect to My Documents page to upload KYC documents
        bottomSheetModalRef.current?.dismiss();
        router.push('/(screens)/my-documents');
    };

    if (isKycCompleted || !isLoggedIn || pathname.includes('kyc') || pathname.includes('my-documents')) {
        return null;
    }

    return (
        <BottomSheetModal
            ref={bottomSheetModalRef}
            index={0}
            snapPoints={snapPoints}
            backdropComponent={renderBackdrop}
            enablePanDownToClose={false}
            enableDismissOnClose={false}
            handleComponent={() => (
                <View style={styles.handleContainer}>
                    <View style={styles.handle} />
                </View>
            )}
            backgroundStyle={styles.bottomSheetBackground}
        >
            <BottomSheetView style={styles.contentContainer}>
                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <KycIllustration width={350} height={300} />
                </View>

                {/* Text Content */}
                <View style={styles.textContainer}>
                    <Text style={styles.title}>Please Complete Your KYC</Text>
                    <Text style={styles.description}>
                        Complete your KYC to start uploading your{'\n'}property and reach potential buyers.
                    </Text>
                </View>

                {/* Button */}
                <View style={styles.buttonContainer}>
                    <Pressable 
                        style={styles.completeButton}
                        onPress={handleCompleteKyc}
                        android_ripple={{ color: 'rgba(255, 255, 255, 0.3)' }}
                    >
                        <Text style={styles.completeButtonText}>Complete KYC</Text>
                    </Pressable>
                </View>
            </BottomSheetView>
        </BottomSheetModal>
    );
};

const styles = StyleSheet.create({
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: '#D1D5DB',
        borderRadius: 2,
    },
    bottomSheetBackground: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        backgroundColor: 'white',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
        paddingBottom: 32,
        alignItems: 'center',
    },
    illustrationContainer: {
        width: '100%',
        height: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 12,
        textAlign: 'center',
        fontFamily: 'Lato-Bold',
    },
    description: {
        fontSize: 14,
        color: '#9CA3AF',
        textAlign: 'center',
        lineHeight: 20,
        fontFamily: 'Lato-Regular',
    },
    buttonContainer: {
        width: '100%',
        marginTop: 'auto',
    },
    completeButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    completeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'Lato-Bold',
    },
});

export default KycModal;
