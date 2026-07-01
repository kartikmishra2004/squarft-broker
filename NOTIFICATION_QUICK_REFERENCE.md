# Notification Quick Reference Card

## 📱 First 10 Broker Notification Events

---

## Frontend Triggers (Use Immediately) ✅

### Import the helper
```javascript
import { 
  notifyRegistrationOtpSent,
  notifyKycDocumentUploaded,
  notifyKycSubmitted,
  notifyPropertyUploaded
} from '../../utils/notificationHelpers';
```

### Event 1: Registration OTP
```javascript
await notifyRegistrationOtpSent({ phone: mobile });
```

### Event 2: KYC Document Upload
```javascript
await notifyKycDocumentUploaded({ 
  documentType: 'aadharFront' // or 'aadharBack', 'panCard', 'selfie'
});
```

### Event 3: KYC Submitted
```javascript
await notifyKycSubmitted();
```

### Event 7: Property Uploaded
```javascript
await notifyPropertyUploaded({ 
  propertyId: 'prop-123',
  propertyName: 'Villa in Bhopal'
});
```

---

## Backend Triggers (Needs Implementation) ⚠️

### Import in backend controller
```javascript
const notificationService = require('../services/admin/notificationService');
```

### Event 4: KYC Under Review
```javascript
await notificationService.queueNotification({
  targetType: 'broker',
  targetIds: [brokerId],
  title: 'KYC Under Review',
  body: 'Your KYC documents are now being reviewed by our team. This may take 24-48 hours.',
  eventType: 'BROKER_KYC_UNDER_REVIEW',
  metadata: { action: 'view_kyc_status' }
});
```

### Event 5: KYC Approved
```javascript
await notificationService.queueNotification({
  targetType: 'broker',
  targetIds: [brokerId],
  title: 'KYC Approved! 🎉',
  body: 'Congratulations! Your KYC has been approved. You can now access all features.',
  eventType: 'BROKER_KYC_APPROVED',
  metadata: { action: 'explore_app' }
});
```

### Event 6: KYC Rejected
```javascript
await notificationService.queueNotification({
  targetType: 'broker',
  targetIds: [brokerId],
  title: 'KYC Rejected',
  body: rejectionReason || 'Your KYC documents were rejected. Please update and resubmit.',
  eventType: 'BROKER_KYC_REJECTED',
  metadata: { 
    reason: rejectionReason,
    action: 'update_kyc' 
  }
});
```

### Event 8: Property Pending Review
```javascript
await notificationService.queueNotification({
  targetType: 'broker',
  targetIds: [property.broker_id],
  title: 'Property Under Review',
  body: `${property.title} is being reviewed by our team.`,
  eventType: 'BROKER_PROPERTY_PENDING_REVIEW',
  metadata: { 
    propertyId: property.id,
    propertyName: property.title,
    action: 'view_property' 
  }
});
```

### Event 9: Property Approved
```javascript
await notificationService.queueNotification({
  targetType: 'broker',
  targetIds: [property.broker_id],
  title: 'Property Approved! ✅',
  body: `${property.title} has been approved and is now live.`,
  eventType: 'BROKER_PROPERTY_APPROVED',
  metadata: { 
    propertyId: property.id,
    propertyName: property.title,
    action: 'view_property' 
  }
});
```

### Event 10: Property Rejected
```javascript
await notificationService.queueNotification({
  targetType: 'broker',
  targetIds: [property.broker_id],
  title: 'Property Rejected',
  body: rejectionReason || `${property.title} was rejected. Please review and resubmit.`,
  eventType: 'BROKER_PROPERTY_REJECTED',
  metadata: { 
    propertyId: property.id,
    propertyName: property.title,
    reason: rejectionReason,
    action: 'edit_property' 
  }
});
```

---

## Event Type Constants

```javascript
// Available in utils/notificationHelpers.js
export const NOTIFICATION_EVENTS = {
  BROKER_REGISTRATION_OTP: 'BROKER_REGISTRATION_OTP',
  BROKER_KYC_DOCUMENT_UPLOADED: 'BROKER_KYC_DOCUMENT_UPLOADED',
  BROKER_KYC_SUBMITTED: 'BROKER_KYC_SUBMITTED',
  BROKER_KYC_UNDER_REVIEW: 'BROKER_KYC_UNDER_REVIEW',
  BROKER_KYC_APPROVED: 'BROKER_KYC_APPROVED',
  BROKER_KYC_REJECTED: 'BROKER_KYC_REJECTED',
  BROKER_PROPERTY_UPLOADED: 'BROKER_PROPERTY_UPLOADED',
  BROKER_PROPERTY_PENDING_REVIEW: 'BROKER_PROPERTY_PENDING_REVIEW',
  BROKER_PROPERTY_APPROVED: 'BROKER_PROPERTY_APPROVED',
  BROKER_PROPERTY_REJECTED: 'BROKER_PROPERTY_REJECTED',
};
```

---

## Testing

### Test Frontend Events
1. Run app in development
2. Trigger the action (upload KYC, create property, etc.)
3. Look for notification on device

### Test Backend Events
1. Change status in admin panel
2. Run worker: `cd d:\Sqft_broker\squarFT_backend && node src\scripts\process_notification_queue.js`
3. Check broker app for notification

### Check Logs
```bash
# Frontend
[NotificationHelper] Triggering local notification
[NotificationHelper] Local notification triggered successfully

# Backend
[NotificationService] Notification queued
[NotificationWorker] Processing notification
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `utils/notificationHelpers.js` | Core notification functions |
| `app/(auth)/otp-verification.jsx` | Event 1 trigger |
| `app/(screens)/kyc.jsx` | Event 3 trigger |
| `app/(screens)/my-documents.jsx` | Event 2 & 3 triggers |
| `app/(tabs)/addProject.jsx` | Event 7 trigger |
| `NOTIFICATION_BACKEND_REQUIREMENTS.md` | Backend implementation guide |
| `NOTIFICATION_IMPLEMENTATION_SUMMARY.md` | Complete documentation |
| `NOTIFICATION_TEST_CHECKLIST.md` | Testing guide |

---

## Status Dashboard

| # | Event | Type | Status |
|---|-------|------|--------|
| 1 | Registration OTP | Frontend | ✅ Ready |
| 2 | KYC Document Upload | Frontend | ✅ Ready |
| 3 | KYC Submitted | Frontend | ✅ Ready |
| 4 | KYC Under Review | Backend | ⚠️ Pending |
| 5 | KYC Approved | Backend | ⚠️ Pending |
| 6 | KYC Rejected | Backend | ⚠️ Pending |
| 7 | Property Uploaded | Frontend | ✅ Ready |
| 8 | Property Pending Review | Backend | ⚠️ Pending |
| 9 | Property Approved | Backend | ⚠️ Pending |
| 10 | Property Rejected | Backend | ⚠️ Pending |

**Frontend**: 4/4 Complete ✅  
**Backend**: 0/6 Complete ⚠️

---

## Common Mistakes to Avoid

❌ **DON'T** forget to import notification helper
❌ **DON'T** trigger notifications inside loops without throttling
❌ **DON'T** send notifications for edit operations (only new creations)
❌ **DON'T** forget to await the notification function

✅ **DO** import from the correct path
✅ **DO** provide meaningful data in metadata
✅ **DO** test notifications on real device
✅ **DO** check logs for debugging

---

## Need Help?

- **Frontend Issues**: Check `utils/notificationHelpers.js`
- **Backend Issues**: Check `NOTIFICATION_BACKEND_REQUIREMENTS.md`
- **Testing**: Check `NOTIFICATION_TEST_CHECKLIST.md`
- **Full Documentation**: Check `NOTIFICATION_IMPLEMENTATION_SUMMARY.md`

---

**Last Updated**: January 2024
**Version**: 1.0 (First 10 Events)
