import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Resolve the dev machine host for API calls across web, simulators, emulators, and physical devices. */
function getDevHost(): string {
  if (Platform.OS === 'web') {
    return 'localhost';
  }

  const expoHost =
    Constants.expoConfig?.hostUri?.split(':')[0] ??
    Constants.expoGoConfig?.debuggerHost?.split(':')[0];

  // Expo Go on a physical device exposes your Mac/PC LAN IP here.
  if (expoHost && expoHost !== 'localhost' && expoHost !== '127.0.0.1') {
    return expoHost;
  }

  // Android emulator maps the host machine to 10.0.2.2
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }

  return 'localhost';
}

export const API_BASE_URL = __DEV__
  ? `http://${getDevHost()}:8080`
  : 'https://api.grandmastories.com';
