import { DEFAULT_PLANAR_LAPLACE_EPSILON } from './location.constants';

const METERS_PER_DEGREE_LAT = 111_320;

function metersToLatOffset(meters: number): number {
  return meters / METERS_PER_DEGREE_LAT;
}

function metersToLngOffset(meters: number, latitude: number): number {
  const cosLat = Math.cos((latitude * Math.PI) / 180);
  return meters / (METERS_PER_DEGREE_LAT * Math.max(Math.abs(cosLat), 1e-6));
}

function clampLatitude(latitude: number): number {
  return Math.max(-90, Math.min(90, latitude));
}

function normalizeLongitude(longitude: number): number {
  let lng = longitude;
  while (lng > 180) lng -= 360;
  while (lng < -180) lng += 360;
  return lng;
}


export function samplePlanarLaplaceOffsetMeters(
  epsilon: number = DEFAULT_PLANAR_LAPLACE_EPSILON,
): { dxMeters: number; dyMeters: number } {
  const safeEpsilon = epsilon > 0 ? epsilon : DEFAULT_PLANAR_LAPLACE_EPSILON;
  const theta = Math.random() * 2 * Math.PI;
  const u = Math.random();
  const r = -Math.log(1 - u) / safeEpsilon;
  return {
    dxMeters: r * Math.cos(theta),
    dyMeters: r * Math.sin(theta),
  };
}

export function applyPlanarLaplaceObfuscation(
  latitude: number,
  longitude: number,
  epsilon: number = DEFAULT_PLANAR_LAPLACE_EPSILON,
): { latitude: number; longitude: number } {
  const { dxMeters, dyMeters } = samplePlanarLaplaceOffsetMeters(epsilon);
  return {
    latitude: clampLatitude(latitude + metersToLatOffset(dyMeters)),
    longitude: normalizeLongitude(longitude + metersToLngOffset(dxMeters, latitude)),
  };
}
