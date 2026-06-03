const MOCK_USERS = [
  {
    id: -2,
    name: 'Олексій',
    photoUrl: 'https://i.pinimg.com/474x/bc/b4/93/bcb49309320b71121531fff5eb39acdc.jpg',
  },
  {
    id: -3,
    name: 'Микола',
    photoUrl: 'https://i.pinimg.com/170x/24/48/d1/2448d1c98e7811280d8954a8285cd488.jpg',
  },
  {
    id: -4,
    name: 'Анна',
    photoUrl: 'https://i.pinimg.com/736x/c1/5d/02/c15d020633bd1f59d15979ae9219912c.jpg',
  },
  {
    id: -5,
    name: 'Марія',
    photoUrl: 'https://mediaslide-europe.storage.googleapis.com/immmodels/pictures/2775/20065/profile-1767616639-d8e4ee4c2b24858c2d94b9bda849d5b2.jpg',
  },
] as const;

function randomPointInCircle(radiusKm: number) {
  const radiusDeg = radiusKm / 111.32;
  let x: number, y: number;
  do {
    x = (Math.random() * 2 - 1) * radiusDeg;
    y = (Math.random() * 2 - 1) * radiusDeg;
  } while (x * x + y * y > radiusDeg * radiusDeg);
  return { latOffset: x, lngOffset: y };
}

export type MockMapUser = {
  id: number;
  name: string;
  photoUrl: string;
  latitude: number;
  longitude: number;
  status: null;
  isOnline: true;
  lastSeenAt: null;
  isFriend: false;
  friendRequestStatus: 'none';
  relationshipLabel: '';
  statusEmoji: null;
  statusBody: null;
};

export function isMockUser(id: number) {
  return id <= -2;
}

export function generateMockMapUsers(centerLat: number, centerLng: number): MockMapUser[] {
  const lngScale = Math.cos((centerLat * Math.PI) / 180);

  return MOCK_USERS.map((user) => {
    const { latOffset, lngOffset } = randomPointInCircle(2);
    return {
      ...user,
      latitude: centerLat + latOffset,
      longitude: centerLng + lngOffset / lngScale,
      status: null,
      isOnline: true as const,
      lastSeenAt: null,
      isFriend: false as const,
      friendRequestStatus: 'none' as const,
      relationshipLabel: '' as const,
      statusEmoji: null,
      statusBody: null,
    };
  });
}
