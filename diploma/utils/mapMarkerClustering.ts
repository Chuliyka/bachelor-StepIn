export type MapMarkerCluster<T extends { id: number; latitude: number; longitude: number }> = {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  markers: T[];
};

/** Groups nearby markers into clusters when their centers are within `radiusDegrees`. */
export function clusterMapMarkers<T extends { id: number; latitude: number; longitude: number }>(
  markers: T[],
  radiusDegrees: number,
): MapMarkerCluster<T>[] {
  if (markers.length === 0) return [];

  const radius = Math.max(radiusDegrees, 0.00005);
  const clusters: MapMarkerCluster<T>[] = [];

  for (const marker of markers) {
    let bestCluster: MapMarkerCluster<T> | null = null;
    let bestDistance = radius;

    for (const cluster of clusters) {
      const dLat = marker.latitude - cluster.latitude;
      const dLng = marker.longitude - cluster.longitude;
      const distance = Math.hypot(dLat, dLng);
      if (distance <= bestDistance) {
        bestDistance = distance;
        bestCluster = cluster;
      }
    }

    if (!bestCluster) {
      clusters.push({
        id: `cluster-${marker.id}`,
        latitude: marker.latitude,
        longitude: marker.longitude,
        count: 1,
        markers: [marker],
      });
      continue;
    }

    bestCluster.markers.push(marker);
    bestCluster.count = bestCluster.markers.length;
    bestCluster.latitude =
      bestCluster.markers.reduce((sum, item) => sum + item.latitude, 0) / bestCluster.count;
    bestCluster.longitude =
      bestCluster.markers.reduce((sum, item) => sum + item.longitude, 0) / bestCluster.count;
    bestCluster.id = `cluster-${bestCluster.markers.map((item) => item.id).join('-')}`;
  }

  return clusters;
}
