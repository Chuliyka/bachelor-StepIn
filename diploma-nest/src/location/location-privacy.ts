import {
  LOCATION_ACCURACY_APPROXIMATE,
  LOCATION_ACCURACY_PRECISE,
  type LocationAccuracyMode,
} from './location.constants';
import { applyPlanarLaplaceObfuscation } from './planar-laplace';

export function buildPublicMapCoordinates(
  accuracy: LocationAccuracyMode | string,
  latitude: number,
  longitude: number,
): { mapLatitude: number; mapLongitude: number } {
  if (accuracy === LOCATION_ACCURACY_PRECISE) {
    return { mapLatitude: latitude, mapLongitude: longitude };
  }

  const obfuscated = applyPlanarLaplaceObfuscation(latitude, longitude);
  return {
    mapLatitude: obfuscated.latitude,
    mapLongitude: obfuscated.longitude,
  };
}

export function resolveLocationAccuracy(
  value: string | null | undefined,
): LocationAccuracyMode {
  return value === LOCATION_ACCURACY_PRECISE
    ? LOCATION_ACCURACY_PRECISE
    : LOCATION_ACCURACY_APPROXIMATE;
}
