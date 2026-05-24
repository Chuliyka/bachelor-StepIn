export const DEFAULT_PLANAR_LAPLACE_EPSILON = 0.02;

const METERS_PER_DEGREE_LAT = 111_320;

function metersToLatOffset(meters: number): number {
  return meters / METERS_PER_DEGREE_LAT;
}

function metersToLngOffset(meters: number, latitude: number): number {
  const cosLat = Math.cos((latitude * Math.PI) / 180);
  return meters / (METERS_PER_DEGREE_LAT * Math.max(Math.abs(cosLat), 1e-6));
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
  let latitudeOut = latitude + metersToLatOffset(dyMeters);
  let longitudeOut = longitude + metersToLngOffset(dxMeters, latitude);
  latitudeOut = Math.max(-90, Math.min(90, latitudeOut));
  while (longitudeOut > 180) longitudeOut -= 360;
  while (longitudeOut < -180) longitudeOut += 360;
  return { latitude: latitudeOut, longitude: longitudeOut };
}
