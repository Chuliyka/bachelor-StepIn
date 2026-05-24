import type { MapUserFriendRequestStatus } from '@/types/map-user-profile-sheet';

export type MapMarkerDto = {
  id: number;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
  name: string | null;
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

  return payload.users
    .map((item: Record<string, unknown>) => {
      const isOnline = parseBackendBoolean(item?.isOnline);
      const rawLatitude = isOnline ? item?.latitude : item?.lastLatitude ?? item?.latitude;
      const rawLongitude = isOnline ? item?.longitude : item?.lastLongitude ?? item?.longitude;
      const latitude = Number(rawLatitude);
      const longitude = Number(rawLongitude);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        return null;
      }

      const userId = Number(item.id);
      const relationship = relationships.get(userId) ?? DEFAULT_RELATIONSHIP;

      return {
        id: userId,
        latitude,
        longitude,
        photoUrl: typeof item.photoUrl === 'string' ? item.photoUrl : null,
        name: typeof item.name === 'string' ? item.name : null,
        isOnline,
        lastSeenAt: typeof item.lastSeenAt === 'string' ? item.lastSeenAt : null,
        interests: Array.isArray(item.interests) ? item.interests : undefined,
        isFriend: relationship.isFriend,
        friendRequestStatus: relationship.friendRequestStatus,
        relationshipLabel: relationship.relationshipLabel,
      } satisfies MapMarkerDto;
    })
    .filter((item): item is MapMarkerDto => Boolean(item));
}

export function mapMarkersSignature(markers: { id: number; latitude: number; longitude: number; isOnline: boolean }[]) {
  return markers.map((marker) => `${marker.id}:${marker.latitude}:${marker.longitude}:${marker.isOnline}`).join('|');
}
