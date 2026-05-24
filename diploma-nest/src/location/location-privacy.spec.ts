import { LOCATION_ACCURACY_APPROXIMATE, LOCATION_ACCURACY_PRECISE } from './location.constants';
import { buildPublicMapCoordinates } from './location-privacy';

describe('location privacy on write', () => {
  it('copies exact coordinates for precise mode', () => {
    const result = buildPublicMapCoordinates(LOCATION_ACCURACY_PRECISE, 49.84, 24.03);
    expect(result).toEqual({ mapLatitude: 49.84, mapLongitude: 24.03 });
  });

  it('obfuscates coordinates for approximate mode', () => {
    const result = buildPublicMapCoordinates(LOCATION_ACCURACY_APPROXIMATE, 49.84, 24.03);
    expect(result.mapLatitude).not.toBe(49.84);
    expect(result.mapLongitude).not.toBe(24.03);
  });
});
