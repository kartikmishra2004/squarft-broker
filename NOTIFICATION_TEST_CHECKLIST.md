# Notification Testing Checklist

## Quick Test Guide for First 10 Notification Events

---

## ✅ Frontend Events (Ready to Test Now)

### Event 1: Registration OTP Sent
**Test Steps**:
1. Open broker app
2. Navigate to login/register flow (if OTP screen exists, or trigger forgot password)
3. Go to OTP Verification screen
4. Tap **"Resend OTP"**

**Expected Result**:
- ✅ Notification appears: "OTP Sent"
- ✅ Message: "Your registration OTP has been sent to {phone}"
- ✅ Sound/vibration feedback

**Pass/Fail**: ☐

---

### Event 2: KYC Document Uploaded
**Test Steps**:
1. Navigate to **Settings** → **My Documents**
2. Upload any document:
   - Aadhar Front
   - Aadhar Back
   - PAN Card
   - Profile Photo
3. Tap **"Save Documents"**

**Expected Result**:
- ✅ Notification appears for EACH uploaded document
- ✅ Title: "Document Uploaded"
- ✅ Body: "{Document Type} uploaded successfully"
- Example: "Aadhar Card (Front) uploaded successfully"

**Pass/Fail**: ☐

---

### Event 3: KYC Submitted
**Test Steps**:

**Option A - Full KYC Form**:
1. Navigate to **KYC** screen
2. Fill in:
   - Aadhar number
   - Upload Aadhar front & back
   - PAN number
   - Upload PAN card
   - Upload selfie/profile photo
3. Tap **"Submit KYC"**

**Option B - My Documents**:
1. Navigate to **My Documents**
2. Upload all 4 documents
3. Tap **"Save Documents"**

**Expected Result**:
- ✅ Notification appears: "KYC Submitted Successfully"
- ✅ Body: "Your KYC documents have been submitted for verification. We will notify you once reviewed."

**Pass/Fail**: ☐

---

### Event 7: Property Uploaded
**Test Steps**:
1. Navigate to **Add Project** tab
2. Complete Step 1: Select property type (Residential/Commercial)
3. Complete Step 2: Enter owner details
4. Complete Step 3: Enter property details (city, state required)
5. Complete Step 4:
   - Upload at least 1 image
   - Enter selling price
   - Check agreement box
   - Tap **"Submit"**

**Expected Result**:
- ✅ Notification appears: "Property Listed"
- ✅ Body: "{propertyName} has been uploaded successfully"
- ✅ Only appears for NEW properties (not edits)

**Pass/Fail**: ☐

---

## ⚠️ Backend Events (Awaiting Backend Implementation)

### Event 4: KYC Under Review
**Test Steps**:
1. Admin changes KYC status to "under_review" in admin panel
2. Backend notification queue should trigger
3. Run worker: `node src/scripts/process_notification_queue.js`

**Expected Result**:
- ✅ Notification received: "KYC Under Review"
- ✅ Body: "Your KYC documents are now being reviewed by our team. This may take 24-48 hours."

**Status**: ⚠️ Awaiting backend implementation

**Pass/Fail**: ☐

---

### Event 5: KYC Approved
**Test Steps**:
1. Admin approves KYC in admin panel
2. Backend notification queue should trigger
3. Run worker: `node src/scripts/process_notification_queue.js`

**Expected Result**:
- ✅ Notification received: "KYC Approved! 🎉"
- ✅ Body: "Congratulations! Your KYC has been approved. You can now access all features."

**Status**: ⚠️ Awaiting backend implementation

**Pass/Fail**: ☐

---

### Event 6: KYC Rejected
**Test Steps**:
1. Admin rejects KYC in admin panel (with reason)
2. Backend notification queue should trigger
3. Run worker: `node src/scripts/process_notification_queue.js`

**Expected Result**:
- ✅ Notification received: "KYC Rejected"
- ✅ Body: Contains rejection reason OR default message

**Status**: ⚠️ Awaiting backend implementation

**Pass/Fail**: ☐

---

### Event 8: Property Pending Review
**Test Steps**:
1. Property status changes to "pending_review" in backend
2. Backend notification queue should trigger
3. Run worker: `node src/scripts/process_notification_queue.js`

**Expected Result**:
- ✅ Notification received: "Property Under Review"
- ✅ Body: "{propertyName} is being reviewed by our team."

**Status**: ⚠️ Awaiting backend implementation

**Pass/Fail**: ☐

---

### Event 9: Property Approved
**Test Steps**:
1. Admin approves property in admin panel
2. Backend notification queue should trigger
3. Run worker: `node src/scripts/process_notification_queue.js`

**Expected Result**:
- ✅ Notification received: "Property Approved! ✅"
- ✅ Body: "{propertyName} has been approved and is now live."

**Status**: ⚠️ Awaiting backend implementation

**Pass/Fail**: ☐

---

### Event 10: Property Rejected
**Test Steps**:
1. Admin rejects property in admin panel (with reason)
2. Backend notification queue should trigger
3. Run worker: `node src/scripts/process_notification_queue.js`

**Expected Result**:
- ✅ Notification received: "Property Rejected"
- ✅ Body: Contains rejection reason OR default message

**Status**: ⚠️ Awaiting backend implementation

**Pass/Fail**: ☐

---

## General Notification Checks

### Platform Testing
- ☐ Test on Android device
- ☐ Test on Android emulator
- ☐ Test on iOS device (if available)

### Permission Checks
- ☐ Notification permission granted
- ☐ Notifications appear when app is foreground
- ☐ Notifications appear when app is background
- ☐ Notifications work when app is closed (for backend events)

### Sound & Vibration
- ☐ Notification sound plays
- ☐ Vibration works (Android)
- ☐ Banner appears

### Notification Content
- ☐ Title displays correctly
- ☐ Body/message displays correctly
- ☐ No truncation issues
- ☐ Emojis render correctly (🎉, ✅)

---

## Debugging Tools

### Check Logs (Android)
```bash
# Frontend logs
npx react-native log-android

# Look for:
[NotificationHelper] Triggering local notification
[NotificationHelper] Local notification triggered successfully
```

### Check Logs (iOS)
```bash
npx react-native log-ios
```

### Backend Notification Queue (Events 4-10)
```bash
# Check if notifications are queued
cd d:\Sqft_broker\squarFT_backend
node src/scripts/check_broker_push_tokens.js

# Manually trigger notification worker
node src/scripts/process_notification_queue.js
```

### Check Push Token Registration
```javascript
// Should see in app logs after login:
[PushNotifications] Expo push token resolved
[PushNotifications] Backend registration completed
[NotificationApi] Response received
```

---

## Known Issues & Workarounds

### Issue: Notifications not appearing
**Possible Causes**:
1. Notification permission not granted
2. Android channel not created
3. App killed (for local notifications)

**Solution**:
1. Go to Settings → Apps → Squar FT Broker → Notifications → Enable
2. Check logs for channel creation
3. Keep app in foreground/background during test

### Issue: Backend notifications not received
**Possible Causes**:
1. Push token not registered
2. Notification worker not running
3. Backend trigger not implemented

**Solution**:
1. Check push token in backend database
2. Run worker manually: `node src/scripts/process_notification_queue.js`
3. Implement backend triggers (see NOTIFICATION_BACKEND_REQUIREMENTS.md)

---

## Test Summary

**Date**: _____________

**Tester**: _____________

**Device**: _____________

**OS Version**: _____________

### Results
- Frontend Events (1, 2, 3, 7): ____ / 4 passed
- Backend Events (4, 5, 6, 8, 9, 10): ____ / 6 passed

**Total**: ____ / 10 passed

### Notes:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

### Issues Found:
_____________________________________________________________
_____________________________________________________________
_____________________________________________________________

---

## Sign-off

**Developer**: ☐ Implementation Complete
**QA**: ☐ Frontend Tests Passed
**QA**: ☐ Backend Tests Passed (when backend ready)
**Product Owner**: ☐ Approved for Release
