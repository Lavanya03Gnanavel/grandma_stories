import { Platform } from 'react-native';

// Android emulator: 10.0.2.2 | iOS simulator / web: localhost
// Physical device: replace with your Mac's IP (run: ipconfig getifaddr en0)
const DEV_HOST = Platform.select({
  android: '10.0.2.2',
  default: 'localhost',
});

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:8080`
  : 'https://api.grandmastories.com';
