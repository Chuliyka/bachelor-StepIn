const MOCK_USERS = [
  {
    id: -2,
    name: 'Олексій',
    photoUrl: 'https://i.pinimg.com/474x/bc/b4/93/bcb49309320b71121531fff5eb39acdc.jpg',
    isFriend: true as const,
    friendRequestStatus: 'none' as const,
    relationshipLabel: 'Твій друг',
    birthDate: '1998-03-14',
    about: 'Люблю активний відпочинок, каву та подорожі 🏔️',
    rating: 4.8,
    meetsCount: 12,
    friendsCount: 34,
    statusEmoji: '☕️',
    statusBody: 'По каві?',
    interests: [
      { interest: { id: 1, name: 'Подорожі' } },
      { interest: { id: 2, name: 'Спорт' } },
      { interest: { id: 3, name: 'Кава' } },
    ],
  },
  {
    id: -3,
    name: 'Анна',
    photoUrl: 'https://i.pinimg.com/736x/c1/5d/02/c15d020633bd1f59d15979ae9219912c.jpg',
    isFriend: false as const,
    friendRequestStatus: 'none' as const,
    relationshipLabel: 'Не твій друг',
    birthDate: '2001-07-22',
    about: 'Шукаю нових знайомих для прогулянок містом 🌸',
    rating: 4.5,
    meetsCount: 7,
    friendsCount: 18,
    statusEmoji: '📸',
    statusBody: 'Шукаю модель для фото',
    interests: [
      { interest: { id: 4, name: 'Музика' } },
      { interest: { id: 5, name: 'Фотографія' } },
      { interest: { id: 6, name: 'Кіно' } },
    ],
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
  status: string;
  isOnline: true;
  lastSeenAt: null;
  isFriend: boolean;
  friendRequestStatus: 'none';
  relationshipLabel: string;
  statusEmoji: string;
  statusBody: string;
  birthDate: string;
  about: string;
  rating: number;
  meetsCount: number;
  friendsCount: number;
  interests: { interest: { id: number; name: string } }[];
};

export function isMockUser(id: number) {
  return id <= -2;
}

export function generateMockMapUsers(centerLat: number, centerLng: number): MockMapUser[] {
  const lngScale = Math.cos((centerLat * Math.PI) / 180);

  return MOCK_USERS.map((user) => {
    const { latOffset, lngOffset } = randomPointInCircle(1);
    return {
      ...user,
      interests: [...user.interests],
      latitude: centerLat + latOffset,
      longitude: centerLng + lngOffset / lngScale,
      status: `${user.statusEmoji} ${user.statusBody}`,
      isOnline: true as const,
      lastSeenAt: null,
    };
  });
}
