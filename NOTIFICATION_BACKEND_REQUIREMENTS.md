# Backend Notification Requirements

## Overview
This document outlines the backend notification triggers required for the broker app. Events 1-3 and 7 are handled by frontend triggers. Events 4-6 and 8-10 require backend implementation.

---

## ✅ Frontend Implemented (Events 1-3, 7)

### Event 1: BROKER_REGISTRATION_OTP
- **Status**: ✅ Implemented in frontend
- **Trigger**: When OTP is sent during registration
- **Location**: `app/(auth)/otp-verification.jsx` - handleResend function
- **Notification**: "OTP Sent - Your registration OTP has been sent to {phone}"

### Event 2: BROKER_KYC_DOCUMENT_UPLOADED
- **Status**: ✅ Implemented in frontend
- **Trigger**: When individual KYC documents are uploaded
- **Location**: `app/(screens)/my-documents.jsx` - handleSave function
- **Notification**: "Document Uploaded - {documentType} uploaded successfully"

### Event 3: BROKER_KYC_SUBMITTED
- **Status**: ✅ Implemented in frontend
- **Trigger**: When complete KYC is submitted
- **Location**: 
  - `app/(screens)/kyc.jsx` - handleDone function
  - `app/(screens)/my-documents.jsx` - handleSave function
- **Notification**: "KYC Submitted Successfully - Your KYC documents have been submitted for verification"

### Event 7: BROKER_PROPERTY_UPLOADED
- **Status**: ✅ Implemented in frontend
- **Trigger**: When property upload completes successfully (new properties only)
- **Location**: `app/(tabs)/addProject.jsx` - final submission handler
- **Notification**: "Property Listed - {propertyName} has been uploaded successfully"

---

## ⚠️ Backend Required (Events 4-6, 8-10)

### Event 4: BROKER_KYC_UNDER_REVIEW
- **Status**: ⚠️ NEEDS BACKEND IMPLEMENTATION
- **Required Backend Trigger**: When admin/system moves KYC status to "under_review" or "in_review"
- **Backend Location**: KYC controller - when status changes to under_review
- **Backend File**: `src/controllers/broker/kyc.js` (likely in updateKycStatus or similar)
- **Required Data**:
  ```javascript
  {
    eventType: 'BROKER_KYC_UNDER_REVIEW',
    brokerId: broker.id,
    title: 'KYC Under Review',
    body: 'Your KYC documents are now being reviewed by our team. This may take 24-48 hours.',
    data: {
      action: 'view_kyc_status'
    }
  }
  ```

### Event 5: BROKER_KYC_APPROVED
- **Status**: ⚠️ NEEDS BACKEND IMPLEMENTATION
- **Required Backend Trigger**: When admin approves KYC
- **Backend Location**: KYC controller - when status changes to "approved" or "verified"
- **Backend File**: `src/controllers/broker/kyc.js`
- **Required Data**:
  ```javascript
  {
    eventType: 'BROKER_KYC_APPROVED',
    brokerId: broker.id,
    title: 'KYC Approved! 🎉',
    body: 'Congratulations! Your KYC has been approved. You can now access all features.',
    data: {
      action: 'explore_app'
    }
  }
  ```

### Event 6: BROKER_KYC_REJECTED
- **Status**: ⚠️ NEEDS BACKEND IMPLEMENTATION
- **Required Backend Trigger**: When admin rejects KYC
- **Backend Location**: KYC controller - when status changes to "rejected" or "declined"
- **Backend File**: `src/controllers/broker/kyc.js`
- **Required Data**:
  ```javascript
  {
    eventType: 'BROKER_KYC_REJECTED',
    brokerId: broker.id,
    title: 'KYC Rejected',
    body: '{rejection_reason}' || 'Your KYC documents were rejected. Please update and resubmit.',
    data: {
      reason: rejection_reason,
      action: 'update_kyc'
    }
  }
  ```

### Event 8: BROKER_PROPERTY_PENDING_REVIEW
- **Status**: ⚠️ NEEDS BACKEND IMPLEMENTATION
- **Required Backend Trigger**: When property is submitted and enters review queue
- **Backend Location**: Property controller - after property creation/update, when status becomes "pending_review"
- **Backend File**: `src/controllers/propertyController.js`
- **Required Data**:
  ```javascript
  {
    eventType: 'BROKER_PROPERTY_PENDING_REVIEW',
    brokerId: property.broker_id,
    title: 'Property Under Review',
    body: '{propertyName} is being reviewed by our team.',
    data: {
      propertyId: property.id,
      propertyName: property.title,
      action: 'view_property'
    }
  }
  ```

### Event 9: BROKER_PROPERTY_APPROVED
- **Status**: ⚠️ NEEDS BACKEND IMPLEMENTATION
- **Required Backend Trigger**: When admin approves property
- **Backend Location**: Property controller - when property status changes to "approved" or "active"
- **Backend File**: `src/controllers/propertyController.js`
- **Required Data**:
  ```javascript
  {
    eventType: 'BROKER_PROPERTY_APPROVED',
    brokerId: property.broker_id,
    title: 'Property Approved! ✅',
    body: '{propertyName} has been approved and is now live.',
    data: {
      propertyId: property.id,
      propertyName: property.title,
      action: 'view_property'
    }
  }
  ```

### Event 10: BROKER_PROPERTY_REJECTED
- **Status**: ⚠️ NEEDS BACKEND IMPLEMENTATION
- **Required Backend Trigger**: When admin rejects property
- **Backend Location**: Property controller - when property status changes to "rejected" or "declined"
- **Backend File**: `src/controllers/propertyController.js`
- **Required Data**:
  ```javascript
  {
    eventType: 'BROKER_PROPERTY_REJECTED',
    brokerId: property.broker_id,
    title: 'Property Rejected',
    body: '{rejection_reason}' || '{propertyName} was rejected. Please review and resubmit.',
    data: {
      propertyId: property.id,
      propertyName: property.title,
      reason: rejection_reason,
      action: 'edit_property'
    }
  }
  ```

---

## Backend Implementation Guide

### Step 1: Find Status Change Handlers
Look for functions that update KYC or property status:
- KYC: `updateKycStatus`, `approveKyc`, `rejectKyc`
- Property: `updatePropertyStatus`, `approveProperty`, `rejectProperty`

### Step 2: Add Notification Queue Calls
After status updates, add notification to queue:
```javascript
const notificationService = require('../services/admin/notificationService');

// Example for KYC approval
await notificationService.queueNotification({
  targetType: 'broker',
  targetIds: [brokerId],
  title: 'KYC Approved! 🎉',
  body: 'Congratulations! Your KYC has been approved.',
  eventType: 'BROKER_KYC_APPROVED',
  metadata: {
    action: 'explore_app'
  }
});
```

### Step 3: Test Notification Flow
1. Update status in admin panel or database
2. Run notification worker: `node src/scripts/process_notification_queue.js`
3. Verify notification received in broker app

---

## Notification Service API

The backend already has notification infrastructure:
- **Service**: `src/services/admin/notificationService.js`
- **Queue**: Notifications are queued in database
- **Worker**: `src/scripts/process_notification_queue.js`
- **Endpoint**: `POST /api/v1/push-tokens/register` (already working)

### Available Methods
```javascript
// Queue notification for specific brokers
notificationService.queueNotification({
  targetType: 'broker',        // or 'sales_officer', 'all'
  targetIds: [brokerId],        // array of broker IDs
  title: 'Notification Title',
  body: 'Notification message',
  eventType: 'EVENT_TYPE',
  metadata: { /* custom data */ }
});
```

---

## Testing Checklist

### Frontend (Already Implemented)
- [x] Event 1: Test OTP resend → notification appears
- [x] Event 2: Upload KYC document → notification per document
- [x] Event 3: Submit complete KYC → notification appears
- [x] Event 7: Create new property → notification appears

### Backend (Needs Implementation)
- [ ] Event 4: Change KYC status to "under_review" → notification sent
- [ ] Event 5: Approve KYC → notification sent
- [ ] Event 6: Reject KYC → notification sent with reason
- [ ] Event 8: Property enters review → notification sent
- [ ] Event 9: Approve property → notification sent
- [ ] Event 10: Reject property → notification sent with reason

---

## Next Steps

1. **Backend Team**: Implement Events 4-6, 8-10 notification triggers
2. **QA Team**: Test all 10 notification events end-to-end
3. **Frontend Team**: Implement deep linking handlers for notification actions (next batch)
4. **DevOps**: Ensure notification worker runs continuously in production

---

## Contact
For questions about frontend implementation: Check `utils/notificationHelpers.js`
For questions about backend requirements: Review this document
