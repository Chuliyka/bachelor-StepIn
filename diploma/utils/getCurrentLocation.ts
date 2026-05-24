import * as Location from 'expo-location';
import { Alert, Linking, Platform } from 'react-native';

export type CurrentLocationResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; reason: 'unavailable' | 'denied' | 'error' };

function showDeniedHelp() {
  Alert.alert('Доступ вимкнено', 'Увімкни доступ до локації в налаштуваннях пристрою.', [
    { text: 'Скасувати', style: 'cancel' },
    {
      text: 'Відкрити налаштування',
      onPress: () => {
        Linking.openSettings().catch((error) => {
          console.warn('[Location] Failed to open settings:', error);
        });
      },
    },
  ]);
}

export async function getCurrentLocation(): Promise<CurrentLocationResult> {
  try {
    const existing = await Location.getForegroundPermissionsAsync();
    let status = existing.status;

    if (status !== 'granted') {
      const requested = await Location.requestForegroundPermissionsAsync();
      status = requested.status;
    }

    if (status !== 'granted') {
      return { ok: false, reason: 'denied' };
    }

    const current = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      ok: true,
      latitude: current.coords.latitude,
      longitude: current.coords.longitude,
    };
  } catch (error) {
    console.warn('[Location] Failed to read current position:', error);
    return { ok: false, reason: 'error' };
  }
}

export async function getCurrentLocationWithAlerts(): Promise<CurrentLocationResult> {
  const result = await getCurrentLocation();

  if (result.ok) return result;

  if (result.reason === 'denied') {
    showDeniedHelp();
    return result;
  }

  const message =
    result.reason === 'unavailable'
      ? 'Геолокація недоступна на цьому пристрої.'
      : 'Не вдалося визначити поточну позицію. Спробуй ще раз.';

  Alert.alert('Локація', message);
  return result;
}

export function openLocationInMaps(latitude: number, longitude: number) {
  const query = `${latitude},${longitude}`;
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?ll=${query}`
      : `https://www.google.com/maps?q=${query}`;

  Linking.openURL(url).catch((error) => {
    console.warn('[Location] Failed to open maps:', error);
    Alert.alert('Помилка', 'Не вдалося відкрити карту.');
  });
}