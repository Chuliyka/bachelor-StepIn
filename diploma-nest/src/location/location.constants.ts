export const DEFAULT_PLANAR_LAPLACE_EPSILON = 0.02;

export const LOCATION_ACCURACY_PRECISE = 'precise';
export const LOCATION_ACCURACY_APPROXIMATE = 'approximate';

export type LocationAccuracyMode =
  | typeof LOCATION_ACCURACY_PRECISE
  | typeof LOCATION_ACCURACY_APPROXIMATE;

export function isLocationAccuracyMode(value: string): value is LocationAccuracyMode {
  return value === LOCATION_ACCURACY_PRECISE || value === LOCATION_ACCURACY_APPROXIMATE;
}
