export interface NotificationSetting {
  enabled: boolean;
  timeOffsetMinutes: number; // Minutes before event (0 = at event time)
  sound: string; // Filename from /sounds folder
}

export interface NotificationPreferences {
  // Rahu Kaal
  rahuKaalStart: NotificationSetting;
  rahuKaalEnd: NotificationSetting;
  
  // Abhijeet Muhurat
  abhijeetMuhurat: NotificationSetting;
  
  // Chaughadiya
  chaughadiyaGood: NotificationSetting; // Shubh, Labh, Amrit, Char
  chaughadiyaBad: NotificationSetting;  // Rog, Kaal, Udveg
  
  // Daily Updates
  dailyTithi: NotificationSetting;
  dailyNakshatra: NotificationSetting;
  dailyYoga: NotificationSetting;
  
  // Special Tithis
  ekadashi: NotificationSetting;
  purnima: NotificationSetting;
  amavasya: NotificationSetting;
  
  // Hora
  horaChanges: NotificationSetting; // Notify on planetary hour changes
  
  // Monthly Hazards
  bhadraWarning: NotificationSetting;
  panchakWarning: NotificationSetting;
  
  // Disha Shool
  dishaShool: NotificationSetting;
}

// Default preferences - all disabled by default as per user request
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  rahuKaalStart: { enabled: false, timeOffsetMinutes: 5, sound: 'rahu_kaal.mp3' },
  rahuKaalEnd: { enabled: false, timeOffsetMinutes: 0, sound: 'voice_success.wav' },
  
  abhijeetMuhurat: { enabled: false, timeOffsetMinutes: 5, sound: 'abhijeet_muhurt.mp3' },
  
  chaughadiyaGood: { enabled: false, timeOffsetMinutes: 5, sound: 'laabh_bela.mp3' },
  chaughadiyaBad: { enabled: false, timeOffsetMinutes: 5, sound: 'rog_bela.mp3' },
  
  dailyTithi: { enabled: false, timeOffsetMinutes: 0, sound: 'voice_success.wav' },
  dailyNakshatra: { enabled: false, timeOffsetMinutes: 0, sound: 'voice_success.wav' },
  dailyYoga: { enabled: false, timeOffsetMinutes: 0, sound: 'voice_success.wav' },
  
  ekadashi: { enabled: false, timeOffsetMinutes: 0, sound: 'ekadashi.mp3' },
  purnima: { enabled: false, timeOffsetMinutes: 0, sound: 'purnima.mp3' },
  amavasya: { enabled: false, timeOffsetMinutes: 0, sound: 'amavasya.mp3' },
  
  horaChanges: { enabled: false, timeOffsetMinutes: 5, sound: 'voice_success.wav' },
  
  bhadraWarning: { enabled: false, timeOffsetMinutes: 30, sound: 'bhadra_time.mp3' },
  panchakWarning: { enabled: false, timeOffsetMinutes: 30, sound: 'panchak_time.mp3' },
  
  dishaShool: { enabled: false, timeOffsetMinutes: 0, sound: 'voice_success.wav' },
};

// Available sounds from public/sounds folder
export const AVAILABLE_SOUNDS = [
  'voice_success.wav',
  'voice_warning.wav',
  'rahu_kaal.mp3',
  'abhijeet_muhurt.mp3',
  'laabh_bela.mp3',
  'rog_bela.mp3',
  'ekadashi.mp3',
  'purnima.mp3',
  'amavasya.mp3',
  'bhadra_time.mp3',
  'panchak_time.mp3',
  'default_beep', // System default
];

// Time offset options (in minutes)
export const TIME_OFFSET_OPTIONS = [
  { label: 'At event time', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
];
