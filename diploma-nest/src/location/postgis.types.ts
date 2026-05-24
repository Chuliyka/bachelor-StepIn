export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type MapUserGeoRow = {
  id: number;
  name: string | null;
  status: string | null;
  photoUrl: string | null;
  isOnline: boolean;
  latitude: number;
  longitude: number;
  lastLatitude: number | null;
  lastLongitude: number | null;
  locationAccuracy: string;
  lastSeenAt: Date | null;
};
