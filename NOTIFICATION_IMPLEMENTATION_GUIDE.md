# Notification System Implementation Guide

## ✅ What's Been Implemented

### 1. **Android/iOS Permissions** 
- ✅ AndroidManifest.xml updated with:
  - `POST_NOTIFICATIONS` (Android 13+)
  - `SCHEDULE_EXACT_ALARM` (precise timing)
  - `USE_EXACT_ALARM`
  - `VIBRATE`
  - `WAKE_LOCK`
- ✅ Info.plist updated with notification usage description

### 2. **Notification Settings Types** (`src/types/notifications.ts`)
- Complete TypeScript interface for all notification preferences
- 13 customizable notification types:
  - Rahu Kaal (start/end)
  - Abhijeet Muhurat
  - Chaughadiya (good/bad)
  - Daily Tithi/Nakshatra/Yoga
  - Special Tithis (Ekadashi, Purnima, Amavasya)
  - Hora changes
  - Bhadra/Panchak warnings
  - Disha Shool
- Time offset options (0, 5, 10, 15, 30, 60 minutes)
- Sound selection from available sounds
- **Default: All notifications OFF**

### 3. **Notification Settings Page** (`/notification-settings`)
- Complete UI with toggle switches for each notification type
- Time offset dropdown (notify X minutes before)
- Sound picker dropdown
- Auto-save to Capacitor Preferences
- Grouped by category (Rahu Kaal, Auspicious Times, etc.)
- Settings button in Panchang page voice alert bar

### 4. **Enhanced Notification Hook** (`useNotificationOrchestratorV2.ts`)
- Loads user preferences from storage
- Applies time offsets to all notifications
- Uses custom sounds per notification type
- Only schedules for current date (not browsed dates)
- Respects user location/timezone
- Smart scheduling based on enabled settings
- Prevents duplicate notifications

### 5. **UI Updates**
- Settings icon button added to Panchang page voice alert bar
- Clicking opens `/notification-settings` page
- Clean, grouped layout with sections

## 🎯 How It Works

### User Flow:
1. User opens Panchang page
2. Sees voice alert toggle with settings icon
3. Clicks settings icon → opens notification settings page
4. Enables desired notifications (e.g., Rahu Kaal Start)
5. Selects time offset (e.g., "5 minutes before")
6. Selects sound (e.g., "rahu_kaal.mp3")
7. Clicks "Save"
8. System schedules notifications based on preferences

### Scheduling Logic:
- Only schedules if viewing **today's date**
- Applies time offset: `actual_time - offset_minutes`
- Uses custom sound if voice enabled
- Clears old notifications before scheduling new ones
- Schedules once per day

### Example:
If Rahu Kaal starts at 3:00 PM and user sets:
- Enabled: ✅
- Time offset: 5 minutes before
- Sound: rahu_kaal.mp3

System will schedule notification for **2:55 PM** with sound "rahu_kaal.mp3"

## 📁 Files Modified/Created

### Created:
1. `src/types/notifications.ts` - Type definitions
2. `src/app/notification-settings/page.tsx` - Settings UI
3. `src/hooks/useNotificationOrchestratorV2.ts` - Enhanced hook

### Modified:
1. `android/app/src/main/AndroidManifest.xml` - Added permissions
2. `ios/App/App/Info.plist` - Added notification description
3. `src/app/panchang/page.tsx` - Added settings button, updated import

## 🔊 Available Sounds

From `public/sounds/` folder:
- `voice_success.wav` - Default success
- `voice_warning.wav` - Warning sound
- `rahu_kaal.mp3` - Rahu Kaal specific
- `abhijeet_muhurt.mp3` - Abhijeet specific
- `laabh_bela.mp3` - Good Chaughadiya
- `rog_bela.mp3` - Bad Chaughadiya
- `ekadashi.mp3` - Ekadashi specific
- `purnima.mp3` - Full moon
- `amavasya.mp3` - New moon
- `bhadra_time.mp3` - Bhadra warning
- `panchak_time.mp3` - Panchak warning

**You can change sound filenames later** - just update the filename in the preferences!

## 🧪 Testing Steps

### 1. Build Mobile App:
```bash
npm run build:mobile
npx cap sync android
npx cap open android
```

### 2. Test Notification Settings:
1. Open app on Android device
2. Navigate to Panchang page
3. Click settings icon (⚙️) next to voice toggle
4. Enable "Rahu Kaal Start"
5. Set "5 minutes before"
6. Select sound "rahu_kaal.mp3"
7. Click "Save"
8. Go back to Panchang page
9. Click "Test Alert" button
10. Wait 5 seconds - notification should appear

### 3. Test Real Notification:
1. Check today's Rahu Kaal time on Panchang page
2. Enable "Rahu Kaal Start" notification
3. Set time offset to match current time + few minutes
4. Wait for notification
5. Verify sound plays
6. Verify notification shows with correct banner image

### 4. Test Multiple Notifications:
1. Enable multiple notification types
2. Set different sounds for each
3. Navigate back to Panchang
4. Check if all notifications are scheduled
5. Look for console message: "✅ Scheduled X notifications based on user preferences."

## 🐛 Troubleshooting

### Notifications Not Showing:
1. Check Android Settings → Apps → FutureBot → Notifications → Enabled
2. Check if date is today (not browsed to future/past)
3. Check if notification is enabled in settings
4. Check console for: "ℹ️ No notifications enabled in settings."
5. Verify permissions: Android 13+ needs POST_NOTIFICATIONS

### Sounds Not Playing:
1. Check if voice toggle is ON on Panchang page
2. Check if sound file exists in `public/sounds/`
3. Check Android notification channel settings
4. Try "default_beep" to test system sound

### Settings Not Saving:
1. Check Capacitor Preferences in DevTools
2. Check console for save errors
3. Try clearing app data and re-testing

## 🎨 Customization

### Change Notification Time Offset Options:
Edit `src/types/notifications.ts`:
```typescript
export const TIME_OFFSET_OPTIONS = [
  { label: 'At event time', value: 0 },
  { label: '2 minutes before', value: 2 },
  // Add more options...
];
```

### Add New Sound:
1. Add sound file to `public/sounds/`
2. Add filename to `AVAILABLE_SOUNDS` array in `src/types/notifications.ts`
3. Rebuild: `npm run build:mobile`

### Change Default Sound for Notification Type:
Edit `DEFAULT_NOTIFICATION_PREFERENCES` in `src/types/notifications.ts`:
```typescript
rahuKaalStart: { 
  enabled: false, 
  timeOffsetMinutes: 5, 
  sound: 'your_new_sound.mp3'  // Change here
},
```

## 📊 Storage Structure

Stored in Capacitor Preferences:
```json
{
  "notification_preferences": {
    "rahuKaalStart": {
      "enabled": true,
      "timeOffsetMinutes": 5,
      "sound": "rahu_kaal.mp3"
    },
    // ... all other preferences
  }
}
```

## 🚀 Next Steps

1. Build and test on Android device
2. Verify all notification types work correctly
3. Test sound customization
4. Test time offset functionality
5. Optional: Add iOS testing
6. Optional: Add analytics to track which notifications users enable most

## 📝 Notes

- Notifications only schedule for **current date** (security feature)
- User must be on Panchang page for scheduling to trigger
- Preferences persist across app restarts
- Old notifications are cleared before scheduling new ones
- Maximum ~50-60 notifications per day (depending on enabled settings)
