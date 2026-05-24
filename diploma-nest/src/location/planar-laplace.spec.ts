import { applyPlanarLaplaceObfuscation, samplePlanarLaplaceOffsetMeters } from './planar-laplace';

describe('planar Laplace obfuscation', () => {
  it('produces offsets with similar X and Y variance (not axis-aligned)', () => {
    const epsilon = 0.05;
    const samples = 800;
    let sumAbsX = 0;
    let sumAbsY = 0;

    for (let i = 0; i < samples; i += 1) {
      const { dxMeters, dyMeters } = samplePlanarLaplaceOffsetMeters(epsilon);
      sumAbsX += Math.abs(dxMeters);
      sumAbsY += Math.abs(dyMeters);
    }

    const ratio = sumAbsX / sumAbsY;
    expect(ratio).toBeGreaterThan(0.65);
    expect(ratio).toBeLessThan(1.35);
  });

  it('keeps obfuscated coordinates within valid bounds', () => {
    const result = applyPlanarLaplaceObfuscation(49.8397, 24.0297, 0.02);
    expect(result.latitude).toBeGreaterThanOrEqual(-90);
    expect(result.latitude).toBeLessThanOrEqual(90);
    expect(result.longitude).toBeGreaterThanOrEqual(-180);
    expect(result.longitude).toBeLessThanOrEqual(180);
  });

  it('draws a new sample on each call', () => {
    const first = applyPlanarLaplaceObfuscation(49.8397, 24.0297, 0.02);
    const second = applyPlanarLaplaceObfuscation(49.8397, 24.0297, 0.02);
    const samePoint =
      first.latitude === second.latitude && first.longitude === second.longitude;
    expect(samePoint).toBe(false);
  });
});
