import type { MapUserFriendRequestStatus } from '@/types/map-user-profile-sheet';

export type MapMarkerDto = {
  id: number;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  name: string | null;
  status: string | null;
  isOnline: boolean;
  lastSeenAt: string | null;
  interests?: { interest: { id: number; name: string } }[];
  isFriend: boolean;
  friendRequestStatus: MapUserFriendRequestStatus;
  relationshipLabel: string;
};

export type UsersMapResponse = {
  users: MapMarkerDto[];
  friendIds: number[];
  incomingFromUserIds: number[];
  outgoingToUserIds: number[];
};

type FriendRelationship = {
  isFriend: boolean;
  friendRequestStatus: MapUserFriendRequestStatus;
  relationshipLabel: string;
};

const DEFAULT_RELATIONSHIP: FriendRelationship = {
  isFriend: false,
  friendRequestStatus: 'none',
  relationshipLabel: 'Не твій друг',
};

function parseBackendBoolean(value: unknown) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function buildRelationshipMap(payload: UsersMapResponse) {
  const relationships = new Map<number, FriendRelationship>();

  for (const userId of payload.friendIds ?? []) {
    relationships.set(userId, {
      isFriend: true,
      friendRequestStatus: 'none',
      relationshipLabel: 'Твій друг',
    });
  }

  for (const userId of payload.incomingFromUserIds ?? []) {
    if (relationships.has(userId)) continue;
    relationships.set(userId, {
      isFriend: false,
      friendRequestStatus: 'incoming',
      relationshipLabel: 'Заявка отримана',
    });
  }

  for (const userId of payload.outgoingToUserIds ?? []) {
    if (relationships.has(userId)) continue;
    relationships.set(userId, {
      isFriend: false,
      friendRequestStatus: 'outgoing',
      relationshipLabel: 'Заявка надіслана',
    });
  }

  return relationships;
}

export function parseUsersMapResponse(data: unknown): MapMarkerDto[] {
  if (!data || typeof data !== 'object') return [];

  const payload = data as UsersMapResponse;
  if (!Array.isArray(payload.users)) return [];

  const relationships = buildRelationshipMap(payload);

  const markers: MapMarkerDto[] = [];

  for (const item of payload.users) {
    const row = item as Record<string, unknown>;
    const isOnline = parseBackendBoolean(row.isOnline);
    const rawLatitude = isOnline ? row.latitude : row.lastLatitude ?? row.latitude;
    const rawLongitude = isOnline ? row.longitude : row.lastLongitude ?? row.longitude;
    const latitude = Number(rawLatitude);
    const longitude = Number(rawLongitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      continue;
    }

    const userId = Number(row.id);
    const relationship = relationships.get(userId) ?? DEFAULT_RELATIONSHIP;

    markers.push({
      id: userId,
      latitude,
      longitude,
      photoUrl: typeof row.photoUrl === 'string' ? row.photoUrl : null,
      name: typeof row.name === 'string' ? row.name : null,
      status: typeof row.status === 'string' ? row.status : null,
      isOnline,
      lastSeenAt: typeof row.lastSeenAt === 'string' ? row.lastSeenAt : null,
      interests: Array.isArray(row.interests) ? row.interests : undefined,
      isFriend: relationship.isFriend,
      friendRequestStatus: relationship.friendRequestStatus,
      relationshipLabel: relationship.relationshipLabel,
    });
  }

  return markers;
}

export type MapUsersQuery = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

/** Viewport-based radius for PostGIS ST_DWithin (meters). */
export function buildMapUsersQuery(region: MapUsersQuery): string {
  const params = new URLSearchParams();
  params.set('lat', String(region.latitude));
  params.set('lng', String(region.longitude));
  const radiusMeters = Math.min(
    Math.round(Math.max(region.latitudeDelta, region.longitudeDelta) * 111_320 * 0.75),
    200_000,
  );
  params.set('radiusMeters', String(Math.max(radiusMeters, 500)));
  return params.toString();
}

export function mapMarkersSignature(
  markers: { id: number; latitude: number; longitude: number; isOnline: boolean; status?: string | null }[],
) {
  return markers
    .map(
      (marker) =>
        `${marker.id}:${marker.latitude}:${marker.longitude}:${marker.isOnline}:${marker.status ?? ''}`,
    )
    .join('|');
}
