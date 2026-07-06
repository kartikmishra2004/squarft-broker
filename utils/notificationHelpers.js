/**
 * Notification Helper Utilities
 * 
 * Provides reusable functions for triggering local notifications
 * in the broker app for various events.
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BROKER_ANDROID_CHANNEL_ID } from './pushNotifications';

/**
 * Notification Event Types
 * Matching backend notification event types
 */
export const NOTIFICATION_EVENTS = {
    // Auth & Registration (1)
    BROKER_REGISTRATION_OTP: 'BROKER_REGISTRATION_OTP',
    
    // KYC Events (2-6)
    BROKER_KYC_DOCUMENT_UPLOADED: 'BROKER_KYC_DOCUMENT_UPLOADED',
    BROKER_KYC_SUBMITTED: 'BROKER_KYC_SUBMITTED',
    BROKER_KYC_UNDER_REVIEW: 'BROKER_KYC_UNDER_REVIEW',
    BROKER_KYC_APPROVED: 'BROKER_KYC_APPROVED',
    BROKER_KYC_REJECTED: 'BROKER_KYC_REJECTED',
    
    // Property Events (7-11)
    BROKER_PROPERTY_UPLOADED: 'BROKER_PROPERTY_UPLOADED',
    BROKER_PROPERTY_PENDING_REVIEW: 'BROKER_PROPERTY_PENDING_REVIEW',
    BROKER_PROPERTY_APPROVED: 'BROKER_PROPERTY_APPROVED',
    BROKER_PROPERTY_REJECTED: 'BROKER_PROPERTY_REJECTED',
    BROKER_PROPERTY_CORRECTION_REQUIRED: 'BROKER_PROPERTY_CORRECTION_REQUIRED',
    
    // Client Events (12-16)
    BROKER_CLIENT_SUBMITTED: 'BROKER_CLIENT_SUBMITTED',
    BROKER_CLIENT_UNDER_REVIEW: 'BROKER_CLIENT_UNDER_REVIEW',
    BROKER_CLIENT_ACCEPTED: 'BROKER_CLIENT_ACCEPTED',
    BROKER_CLIENT_DUPLICATE_DETECTED: 'BROKER_CLIENT_DUPLICATE_DETECTED',
    BROKER_CLIENT_REJECTED: 'BROKER_CLIENT_REJECTED',
    
    // Property Activity Events (17-18)
    BROKER_PROPERTY_SHARED_WITH_END_USER: 'BROKER_PROPERTY_SHARED_WITH_END_USER',
    BROKER_PROPERTY_VIEWED_BY_END_USER: 'BROKER_PROPERTY_VIEWED_BY_END_USER',
    
    // Site Visit Events (19-26)
    BROKER_PROPERTY_SITE_VISIT_SCHEDULED: 'BROKER_PROPERTY_SITE_VISIT_SCHEDULED',
    BROKER_CLIENT_SITE_VISIT_SCHEDULED: 'BROKER_CLIENT_SITE_VISIT_SCHEDULED',
    BROKER_COMBINED_SITE_VISIT_SCHEDULED: 'BROKER_COMBINED_SITE_VISIT_SCHEDULED',
    BROKER_PROPERTY_SITE_VISIT_COMPLETED: 'BROKER_PROPERTY_SITE_VISIT_COMPLETED',
    BROKER_CLIENT_SITE_VISIT_COMPLETED: 'BROKER_CLIENT_SITE_VISIT_COMPLETED',
    BROKER_COMBINED_SITE_VISIT_COMPLETED: 'BROKER_COMBINED_SITE_VISIT_COMPLETED',
    BROKER_SITE_VISIT_RESCHEDULED: 'BROKER_SITE_VISIT_RESCHEDULED',
    BROKER_SITE_VISIT_CANCELLED: 'BROKER_SITE_VISIT_CANCELLED',
    
    // Deal Events (27-31)
    BROKER_CLIENT_DEAL_STARTED: 'BROKER_CLIENT_DEAL_STARTED',
    BROKER_PROPERTY_DEAL_STARTED: 'BROKER_PROPERTY_DEAL_STARTED',
    BROKER_COMBINED_DEAL_STARTED: 'BROKER_COMBINED_DEAL_STARTED',
    BROKER_DEAL_MILESTONE_UPDATED: 'BROKER_DEAL_MILESTONE_UPDATED',
    BROKER_DEAL_DROPPED: 'BROKER_DEAL_DROPPED',
    
    // Commission & Wallet Events (32-38)
    BROKER_COMMISSION_CREDITED_TO_WALLET: 'BROKER_COMMISSION_CREDITED_TO_WALLET',
    BROKER_COMMISSION_ON_HOLD: 'BROKER_COMMISSION_ON_HOLD',
    BROKER_BANK_DETAILS_REQUIRED: 'BROKER_BANK_DETAILS_REQUIRED',
    BROKER_WITHDRAWAL_REQUESTED: 'BROKER_WITHDRAWAL_REQUESTED',
    BROKER_WITHDRAWAL_PROCESSING: 'BROKER_WITHDRAWAL_PROCESSING',
    BROKER_WITHDRAWAL_COMPLETED: 'BROKER_WITHDRAWAL_COMPLETED',
    BROKER_WITHDRAWAL_REJECTED: 'BROKER_WITHDRAWAL_REJECTED',
    
    // Property Status Event (39)
    BROKER_PROPERTY_AVAILABILITY_CHANGED: 'BROKER_PROPERTY_AVAILABILITY_CHANGED',
};

/**
 * Trigger a local notification
 * Used for immediate frontend feedback
 * 
 * @param {Object} params
 * @param {string} params.title - Notification title
 * @param {string} params.body - Notification body/message
 * @param {Object} params.data - Additional data payload
 * @param {string} params.eventType - Event type identifier
 */
export const triggerLocalNotification = async ({
    title,
    body,
    data = {},
    eventType,
}) => {
    try {
        console.log('[NotificationHelper] Triggering local notification', {
            eventType,
            title,
            platform: Platform.OS,
        });

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data: {
                    ...data,
                    eventType,
                    source: 'local',
                    timestamp: new Date().toISOString(),
                },
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.HIGH,
                ...(Platform.OS === 'android' && {
                    channelId: BROKER_ANDROID_CHANNEL_ID,
                }),
            },
            trigger: null, // Show immediately
        });

        console.log('[NotificationHelper] Local notification triggered successfully');
    } catch (error) {
        console.error('[NotificationHelper] Failed to trigger local notification', {
            error: error.message,
            eventType,
        });
    }
};

/**
 * Event 1: Registration OTP Sent
 */
export const notifyRegistrationOtpSent = async ({ phone }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_REGISTRATION_OTP,
        title: 'OTP Sent',
        body: `Your registration OTP has been sent to ${phone}. Please check your messages.`,
        data: {
            phone,
            action: 'verify_otp',
        },
    });
};

/**
 * Event 2: KYC Document Uploaded
 */
export const notifyKycDocumentUploaded = async ({ documentType }) => {
    const docNames = {
        aadharFront: 'Aadhar Card (Front)',
        aadharBack: 'Aadhar Card (Back)',
        panCard: 'PAN Card',
        selfie: 'Profile Photo',
    };

    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_KYC_DOCUMENT_UPLOADED,
        title: 'Document Uploaded',
        body: `${docNames[documentType] || 'Document'} uploaded successfully.`,
        data: {
            documentType,
            action: 'view_kyc',
        },
    });
};

/**
 * Event 3: KYC Submitted
 */
export const notifyKycSubmitted = async () => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_KYC_SUBMITTED,
        title: 'KYC Submitted Successfully',
        body: 'Your KYC documents have been submitted for verification. We will notify you once reviewed.',
        data: {
            action: 'view_kyc_status',
        },
    });
};

/**
 * Event 4: KYC Under Review (Backend Trigger)
 * This notification should be sent by backend
 */
export const notifyKycUnderReview = async () => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_KYC_UNDER_REVIEW,
        title: 'KYC Under Review',
        body: 'Your KYC documents are now being reviewed by our team. This may take 24-48 hours.',
        data: {
            action: 'view_kyc_status',
        },
    });
};

/**
 * Event 5: KYC Approved (Backend Trigger)
 * This notification should be sent by backend
 */
export const notifyKycApproved = async () => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_KYC_APPROVED,
        title: 'KYC Approved! 🎉',
        body: 'Congratulations! Your KYC has been approved. You can now access all features.',
        data: {
            action: 'explore_app',
        },
    });
};

/**
 * Event 6: KYC Rejected (Backend Trigger)
 */
export const notifyKycRejected = async ({ reason }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_KYC_REJECTED,
        title: 'KYC Rejected',
        body: reason || 'Your KYC documents were rejected. Please update and resubmit.',
        data: {
            reason,
            action: 'update_kyc',
        },
    });
};

/**
 * Event 7: Property Uploaded
 */
export const notifyPropertyUploaded = async ({ propertyId, propertyName }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_UPLOADED,
        title: 'Property Listed',
        body: `${propertyName || 'Your property'} has been uploaded successfully.`,
        data: {
            propertyId,
            propertyName,
            action: 'view_property',
        },
    });
};

/**
 * Event 8: Property Under Review (Backend Trigger)
 */
export const notifyPropertyPendingReview = async ({ propertyId, propertyName }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_PENDING_REVIEW,
        title: 'Property Under Review',
        body: `${propertyName || 'Your property'} is being reviewed by our team.`,
        data: {
            propertyId,
            propertyName,
            action: 'view_property',
        },
    });
};

/**
 * Event 9: Property Approved (Backend Trigger)
 */
export const notifyPropertyApproved = async ({ propertyId, propertyName }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_APPROVED,
        title: 'Property Approved! ✅',
        body: `${propertyName || 'Your property'} has been approved and is now live.`,
        data: {
            propertyId,
            propertyName,
            action: 'view_property',
        },
    });
};

/**
 * Event 10: Property Rejected (Backend Trigger)
 */
export const notifyPropertyRejected = async ({ propertyId, propertyName, reason }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_REJECTED,
        title: 'Property Rejected',
        body: reason || `${propertyName || 'Your property'} was rejected. Please review and resubmit.`,
        data: {
            propertyId,
            propertyName,
            reason,
            action: 'edit_property',
        },
    });
};

/**
 * Event 11: Property Correction Required (Backend Trigger)
 * Reviewer requests a correction without fully rejecting the property
 */
export const notifyPropertyCorrectionRequired = async ({ 
    propertyId, 
    propertyName, 
    correctionReason,
    affectedSection 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_CORRECTION_REQUIRED,
        title: 'Property Correction Required',
        body: `Update required for ${propertyName || 'your property'}. Reason: ${correctionReason || 'Please review'}.`,
        data: {
            propertyId,
            propertyName,
            correctionReason,
            affectedSection,
            action: 'edit_property_section',
        },
    });
};

/**
 * Event 12: Client Submitted (Frontend Trigger)
 * Broker submits a client/lead (customer requirement)
 */
export const notifyClientSubmitted = async ({ clientId, clientReference }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_CLIENT_SUBMITTED,
        title: 'Client Submitted',
        body: `Your client ${clientReference || 'requirement'} has been submitted successfully for review.`,
        data: {
            clientId,
            clientReference,
            action: 'view_client',
        },
    });
};

/**
 * Event 13: Client Under Review (Backend Trigger)
 * Client enters attribution/validation review
 */
export const notifyClientUnderReview = async ({ clientId, clientReference }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_CLIENT_UNDER_REVIEW,
        title: 'Client Under Review',
        body: `Your client ${clientReference || 'requirement'} is currently under review.`,
        data: {
            clientId,
            clientReference,
            action: 'view_client',
        },
    });
};

/**
 * Event 14: Client Accepted (Backend Trigger)
 * Broker-submitted client is accepted and attributed to the broker
 */
export const notifyClientAccepted = async ({ clientId, clientReference }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_CLIENT_ACCEPTED,
        title: 'Client Accepted ✅',
        body: `Your client ${clientReference || 'requirement'} has been accepted and attributed to your account.`,
        data: {
            clientId,
            clientReference,
            action: 'view_client',
        },
    });
};

/**
 * Event 15: Client Duplicate Detected (Backend Trigger)
 * Potential duplicate client is detected
 */
export const notifyClientDuplicateDetected = async ({ clientId, clientReference }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_CLIENT_DUPLICATE_DETECTED,
        title: 'Client Duplicate Detected',
        body: `Your client ${clientReference || 'requirement'} may already exist. Attribution is under review.`,
        data: {
            clientId,
            clientReference,
            action: 'view_client_review',
        },
    });
};

/**
 * Event 16: Client Rejected (Backend Trigger)
 * Client submission is rejected after validation
 */
export const notifyClientRejected = async ({ clientId, clientReference, reason }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_CLIENT_REJECTED,
        title: 'Client Submission Needs Attention',
        body: reason || `Your client ${clientReference || 'requirement'} could not be accepted. Please review.`,
        data: {
            clientId,
            clientReference,
            reason,
            action: 'review_client',
        },
    });
};

/**
 * Event 17: Property Shared with End User (Backend Trigger)
 * SquarFT team shares broker-uploaded property with a matching end user
 */
export const notifyPropertySharedWithEndUser = async ({ propertyId, propertyName }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_SHARED_WITH_END_USER,
        title: 'Property Shared',
        body: `Your property ${propertyName || ''} has been shared with a matching user.`,
        data: {
            propertyId,
            propertyName,
            action: 'view_property_activity',
        },
    });
};

/**
 * Event 18: Property Viewed by End User (Backend Trigger)
 * End user opens/views broker-uploaded property details
 */
export const notifyPropertyViewedByEndUser = async ({ propertyId, propertyName }) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_VIEWED_BY_END_USER,
        title: 'Property Viewed',
        body: `A matching user viewed your property ${propertyName || ''}.`,
        data: {
            propertyId,
            propertyName,
            action: 'view_property_activity',
        },
    });
};

/**
 * Event 19: Property Site Visit Scheduled (Backend Trigger)
 * A site visit is scheduled for a broker-uploaded property
 */
export const notifyPropertySiteVisitScheduled = async ({ 
    propertyId, 
    propertyName, 
    visitId,
    visitDate,
    visitTime 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_SITE_VISIT_SCHEDULED,
        title: 'Site Visit Scheduled',
        body: `A site visit is scheduled for your property ${propertyName || ''} on ${visitDate} at ${visitTime}.`,
        data: {
            propertyId,
            propertyName,
            visitId,
            visitDate,
            visitTime,
            action: 'view_property_visits',
        },
    });
};

/**
 * Event 20: Client Site Visit Scheduled (Backend Trigger)
 * A site visit is scheduled for a broker-submitted client
 */
export const notifyClientSiteVisitScheduled = async ({ 
    clientId, 
    clientReference, 
    visitId,
    visitDate,
    visitTime 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_CLIENT_SITE_VISIT_SCHEDULED,
        title: 'Site Visit Scheduled',
        body: `A site visit is scheduled for your client ${clientReference || ''} on ${visitDate} at ${visitTime}.`,
        data: {
            clientId,
            clientReference,
            visitId,
            visitDate,
            visitTime,
            action: 'view_client_visits',
        },
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION EVENTS #21-#30
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Event 21: Combined Site Visit Scheduled (Backend Trigger)
 * The same visit includes both broker-submitted client and broker-uploaded property
 */
export const notifyCombinedSiteVisitScheduled = async ({ 
    clientReference,
    propertyName,
    visitId,
    visitDate,
    visitTime 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_COMBINED_SITE_VISIT_SCHEDULED,
        title: 'Site Visit Scheduled',
        body: `A site visit is scheduled for your client ${clientReference || ''} at your property ${propertyName || ''} on ${visitDate} at ${visitTime}.`,
        data: {
            clientReference,
            propertyName,
            visitId,
            visitDate,
            visitTime,
            action: 'view_visit',
        },
    });
};

/**
 * Event 22: Property Site Visit Completed (Backend Trigger)
 * Site visit for broker-uploaded property is completed
 */
export const notifyPropertySiteVisitCompleted = async ({ 
    propertyId,
    propertyName,
    visitId 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_SITE_VISIT_COMPLETED,
        title: 'Site Visit Completed',
        body: `The site visit for your property ${propertyName || ''} has been completed.`,
        data: {
            propertyId,
            propertyName,
            visitId,
            action: 'view_property_visits',
        },
    });
};

/**
 * Event 23: Client Site Visit Completed (Backend Trigger)
 * Site visit for broker-submitted client is completed
 */
export const notifyClientSiteVisitCompleted = async ({ 
    clientId,
    clientReference,
    visitId 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_CLIENT_SITE_VISIT_COMPLETED,
        title: 'Site Visit Completed',
        body: `The site visit for your client ${clientReference || ''} has been completed.`,
        data: {
            clientId,
            clientReference,
            visitId,
            action: 'view_client_visits',
        },
    });
};

/**
 * Event 24: Combined Site Visit Completed (Backend Trigger)
 * The same visit includes both broker-submitted client and broker-uploaded property
 */
export const notifyCombinedSiteVisitCompleted = async ({ 
    clientReference,
    propertyName,
    visitId 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_COMBINED_SITE_VISIT_COMPLETED,
        title: 'Site Visit Completed',
        body: `The site visit for your client ${clientReference || ''} at your property ${propertyName || ''} has been completed.`,
        data: {
            clientReference,
            propertyName,
            visitId,
            action: 'view_visit',
        },
    });
};

/**
 * Event 25: Site Visit Rescheduled (Backend Trigger)
 * Any broker-attributed site visit is rescheduled
 */
export const notifySiteVisitRescheduled = async ({ 
    visitContext,
    visitId,
    oldVisitDate,
    oldVisitTime,
    newVisitDate,
    newVisitTime 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_SITE_VISIT_RESCHEDULED,
        title: 'Site Visit Rescheduled',
        body: `The site visit for ${visitContext} has been rescheduled to ${newVisitDate} at ${newVisitTime}.`,
        data: {
            visitContext,
            visitId,
            oldVisitDate,
            oldVisitTime,
            newVisitDate,
            newVisitTime,
            action: 'view_visit',
        },
    });
};

/**
 * Event 26: Site Visit Cancelled (Backend Trigger)
 * Any broker-attributed site visit is cancelled
 */
export const notifySiteVisitCancelled = async ({ 
    visitContext,
    visitId,
    cancellationReason 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_SITE_VISIT_CANCELLED,
        title: 'Site Visit Cancelled',
        body: `The site visit for ${visitContext} has been cancelled. Reason: ${cancellationReason || 'Not specified'}.`,
        data: {
            visitContext,
            visitId,
            cancellationReason,
            action: 'view_visit',
        },
    });
};

/**
 * Event 27: Client Deal Started (Backend Trigger)
 * A deal begins for a broker-submitted client
 */
export const notifyClientDealStarted = async ({ 
    clientReference,
    dealReference,
    dealId 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_CLIENT_DEAL_STARTED,
        title: 'Deal Started for Your Client',
        body: `A deal has started for your client ${clientReference || ''}. Track progress in the Broker App.`,
        data: {
            clientReference,
            dealReference,
            dealId,
            action: 'view_deal',
        },
    });
};

/**
 * Event 28: Property Deal Started (Backend Trigger)
 * A deal begins for a broker-uploaded property
 */
export const notifyPropertyDealStarted = async ({ 
    propertyName,
    dealReference,
    dealId 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_DEAL_STARTED,
        title: 'Deal Started for Your Property',
        body: `A deal has started for your property ${propertyName || ''}. Track progress in the Broker App.`,
        data: {
            propertyName,
            dealReference,
            dealId,
            action: 'view_deal',
        },
    });
};

/**
 * Event 29: Combined Deal Started (Backend Trigger)
 * A deal begins where both broker-submitted client and broker-uploaded property are involved
 */
export const notifyCombinedDealStarted = async ({ 
    clientReference,
    propertyName,
    dealReference,
    dealId 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_COMBINED_DEAL_STARTED,
        title: 'Deal Started',
        body: `A deal has started for your client ${clientReference || ''} at your property ${propertyName || ''}.`,
        data: {
            clientReference,
            propertyName,
            dealReference,
            dealId,
            action: 'view_deal',
        },
    });
};

/**
 * Event 30: Deal Milestone Updated (Backend Trigger)
 * A visible deal milestone is completed or moved forward
 */
export const notifyDealMilestoneUpdated = async ({ 
    dealReference,
    dealId,
    milestoneName,
    milestoneStatus 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_DEAL_MILESTONE_UPDATED,
        title: 'Deal Milestone Updated',
        body: `Deal ${dealReference || ''} has moved to ${milestoneName || 'next stage'}.`,
        data: {
            dealReference,
            dealId,
            milestoneName,
            milestoneStatus,
            action: 'view_deal',
        },
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION EVENTS #31-#39
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Event 31: Deal Dropped/Closed (Backend Trigger)
 * Broker-attributed deal is closed as dropped/cancelled
 */
export const notifyDealDropped = async ({ 
    dealReference,
    dealId,
    closureReason 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_DEAL_DROPPED,
        title: 'Deal Closed',
        body: `Deal ${dealReference || ''} has been closed. Reason: ${closureReason || 'Not specified'}.`,
        data: {
            dealReference,
            dealId,
            closureReason,
            action: 'view_deal',
        },
    });
};

/**
 * Event 32: Commission Credited to Wallet (Backend Trigger)
 * Commission from an eligible broker-attributed deal is credited to wallet
 */
export const notifyCommissionCredited = async ({ 
    commissionAmount,
    dealReference,
    walletTransactionId,
    walletBalance 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_COMMISSION_CREDITED_TO_WALLET,
        title: 'Commission Credited to Your Wallet',
        body: `₹${commissionAmount} from Deal ${dealReference || ''} has been credited to your SquarFT wallet.`,
        data: {
            commissionAmount,
            dealReference,
            walletTransactionId,
            walletBalance,
            action: 'view_wallet_transaction',
        },
    });
};

/**
 * Event 33: Commission On Hold (Backend Trigger)
 * Eligible commission is held pending compliance, document, or internal verification
 */
export const notifyCommissionOnHold = async ({ 
    dealReference,
    commissionId,
    holdReason,
    requiredAction 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_COMMISSION_ON_HOLD,
        title: 'Commission On Hold',
        body: `Your commission for Deal ${dealReference || ''} is on hold. Reason: ${holdReason || 'Under review'}.`,
        data: {
            dealReference,
            commissionId,
            holdReason,
            requiredAction,
            action: 'view_commission',
        },
    });
};

/**
 * Event 34: Bank Details Required (Backend Trigger)
 * Valid payout bank details are missing or need correction
 */
export const notifyBankDetailsRequired = async ({ 
    bankIssueReason 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_BANK_DETAILS_REQUIRED,
        title: 'Bank Details Required',
        body: 'Add or correct your bank details to withdraw your wallet balance.',
        data: {
            bankIssueReason,
            action: 'add_bank_details',
        },
    });
};

/**
 * Event 35: Withdrawal Requested (Frontend Trigger)
 * Broker submits a withdrawal request from wallet
 */
export const notifyWithdrawalRequested = async ({ 
    withdrawalAmount,
    withdrawalId,
    requestedAt 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_WITHDRAWAL_REQUESTED,
        title: 'Withdrawal Request Submitted',
        body: `Your withdrawal request of ₹${withdrawalAmount} has been submitted successfully.`,
        data: {
            withdrawalAmount,
            withdrawalId,
            requestedAt,
            action: 'view_withdrawal',
        },
    });
};

/**
 * Event 36: Withdrawal Processing (Backend Trigger)
 * Finance/admin begins processing withdrawal request
 */
export const notifyWithdrawalProcessing = async ({ 
    withdrawalAmount,
    withdrawalId 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_WITHDRAWAL_PROCESSING,
        title: 'Withdrawal Is Processing',
        body: `Your withdrawal request of ₹${withdrawalAmount} is being processed.`,
        data: {
            withdrawalAmount,
            withdrawalId,
            action: 'view_withdrawal',
        },
    });
};

/**
 * Event 37: Withdrawal Completed (Backend Trigger)
 * Withdrawal is successfully transferred to broker bank account
 */
export const notifyWithdrawalCompleted = async ({ 
    withdrawalAmount,
    withdrawalId,
    transactionReference,
    processedAt 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_WITHDRAWAL_COMPLETED,
        title: 'Withdrawal Received',
        body: `₹${withdrawalAmount} has been transferred successfully. Reference: ${transactionReference || ''}.`,
        data: {
            withdrawalAmount,
            withdrawalId,
            transactionReference,
            processedAt,
            action: 'view_withdrawal',
        },
    });
};

/**
 * Event 38: Withdrawal Rejected (Backend Trigger)
 * Withdrawal request is rejected or fails
 */
export const notifyWithdrawalRejected = async ({ 
    withdrawalAmount,
    withdrawalId,
    rejectionReason,
    requiredAction 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_WITHDRAWAL_REJECTED,
        title: 'Withdrawal Could Not Be Processed',
        body: `Your withdrawal request of ₹${withdrawalAmount} could not be processed. Reason: ${rejectionReason || 'Please contact support'}.`,
        data: {
            withdrawalAmount,
            withdrawalId,
            rejectionReason,
            requiredAction,
            action: 'view_withdrawal',
        },
    });
};

/**
 * Event 39: Property Availability Changed (Backend Trigger)
 * Broker-uploaded property becomes reserved, sold, or unavailable
 */
export const notifyPropertyAvailabilityChanged = async ({ 
    propertyReference,
    propertyId,
    availabilityStatus 
}) => {
    await triggerLocalNotification({
        eventType: NOTIFICATION_EVENTS.BROKER_PROPERTY_AVAILABILITY_CHANGED,
        title: 'Property Availability Updated',
        body: `Your property ${propertyReference || ''} is now marked as ${availabilityStatus || 'unavailable'}.`,
        data: {
            propertyReference,
            propertyId,
            availabilityStatus,
            action: 'view_property',
        },
    });
};
