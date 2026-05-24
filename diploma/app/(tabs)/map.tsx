import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BASE_URL } from '@/constants/api';
import { AppColors } from '@/constants/app-colors';
import { MapClusterMarker } from '@/components/map/MapClusterMarker';
import { MapSortFilterBottomSheet } from '@/components/map/MapSortFilterBottomSheet';
import { MapUserMarker } from '@/components/map/MapUserMarker';
import { getInterestNameByFilterKey, type MapSortFilterKey } from '@/constants/interests';
import { MapUserProfileBottomSheet } from '@/components/map/MapUserProfileBottomSheet';
import type { MapUserFriendRequestStatus } from '@/types/map-user-profile-sheet';
import { fetchWithAuth } from '@/utils/fetchWithAuth';
import { buildMapUserProfileSheetFromMarker } from '@/utils/mapUserProfileSheet';
import { clusterMapMarkers, type MapMarkerCluster } from '@/utils/mapMarkerClustering';
import { mapMarkersSignature, parseUsersMapResponse, type MapMarkerDto } from '@/utils/mapApi';
import { openChatWithParticipant } from '@/utils/openChat';
import { getSession } from '@/utils/session';
import { useDebouncedValue } from '@/utils/useDebouncedValue';

/** latitudeDelta at/above this → merge overlapping users into count clusters. */
const CLUSTER_ZOOM_THRESHOLD = 0.01;
/** Fraction of visible map height used as cluster merge radius when zoomed out. */
const CLUSTER_RADIUS_FACTOR = 0.14;
const MAP_MARKERS_POLL_MS = 15_000;
const REGION_DELTA_DEBOUNCE_MS = 150;

type UserMapData = {
  id: number | null;
  latitude: number;
  longitude: number;
  photoUrl: string | null;
};

type OnlineUserMarker = MapMarkerDto & {
  birthDate?: string | null;
  about?: string | null;
  statusEmoji?: string | null;
  statusBody?: string | null;
  rating?: number | null;
  meetsCount?: number;
  friendsCount?: number;
  statusRelativeLabel?: string | null;
};

type FriendRelationship = {
  isFriend: boolean;
  friendRequestStatus: MapUserFriendRequestStatus;
  relationshipLabel: string;
};

function parseBackendBoolean(value: unknown) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function mergeBackendUserIntoMarker(marker: OnlineUserMarker, user: any): OnlineUserMarker {
  const isOnline = parseBackendBoolean(user?.isOnline);
  const latitude = Number(isOnline ? user?.latitude : user?.lastLatitude ?? user?.latitude);
  const longitude = Number(isOnline ? user?.longitude : user?.lastLongitude ?? user?.longitude);

  return {
    ...marker,
    latitude: Number.isFinite(latitude) ? latitude : marker.latitude,
    longitude: Number.isFinite(longitude) ? longitude : marker.longitude,
    photoUrl: typeof user?.photoUrl === 'string' ? user.photoUrl : marker.photoUrl,
    name: typeof user?.name === 'string' ? user.name : marker.name,
    isOnline,
    lastSeenAt: typeof user?.lastSeenAt === 'string' ? user.lastSeenAt : marker.lastSeenAt ?? null,
    birthDate: typeof user?.birthDate === 'string' ? user.birthDate : marker.birthDate ?? null,
    about: typeof user?.about === 'string' ? user.about : marker.about ?? null,
    statusEmoji: typeof user?.statusEmoji === 'string' ? user.statusEmoji : marker.statusEmoji ?? null,
    statusBody: typeof user?.statusBody === 'string' ? user.statusBody : marker.statusBody ?? null,
    rating: Number.isFinite(Number(user?.rating)) ? Number(user.rating) : marker.rating ?? null,
    meetsCount: Number.isFinite(Number(user?.meetsCount)) ? Number(user.meetsCount) : marker.meetsCount,
    friendsCount: Number.isFinite(Number(user?.friendsCount)) ? Number(user.friendsCount) : marker.friendsCount,
    interests: Array.isArray(user?.interests) ? user.interests : marker.interests,
    statusRelativeLabel:
      typeof user?.statusRelativeLabel === 'string' ? user.statusRelativeLabel : marker.statusRelativeLabel ?? null,
  };
}

export default function MapTabScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mapTopFabIconColor = isDark ? AppColors.tabBarInactiveDarkMap : AppColors.tabBarInactiveLight;
  const insets = useSafeAreaInsets();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber?: string }>();
  const mapRef = useRef<MapView | null>(null);
  const didAnimateToUserRef = useRef(false);
  const markersSignatureRef = useRef('');
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [coordsLoading, setCoordsLoading] = useState(true);
  const [userMapData, setUserMapData] = useState<UserMapData | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserMarker[]>([]);
  const [fallbackCoords, setFallbackCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [errorText, setErrorText] = useState('');
  const [regionDelta, setRegionDelta] = useState(0.02);
  const debouncedRegionDelta = useDebouncedValue(regionDelta, REGION_DELTA_DEBOUNCE_MS);
  const [selectedUser, setSelectedUser] = useState<OnlineUserMarker | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sortFilterSheetVisible, setSortFilterSheetVisible] = useState(false);
  const [mapSortFilterKey, setMapSortFilterKey] = useState<MapSortFilterKey>('all');
  const [addingFriend, setAddingFriend] = useState(false);

  useEffect(() => {
    if (phoneNumber) {
      setSessionKey(phoneNumber);
      return;
    }

    getSession()
      .then((stored) => setSessionKey(stored))
      .catch(() => setSessionKey(null));
  }, [phoneNumber]);

  const loadDeviceLocation = useCallback(async () => {
    try {
      const Location = await import('expo-location');
      const existing = await Location.getForegroundPermissionsAsync();
      let status = existing.status;

      if (status !== 'granted') {
        const requested = await Location.requestForegroundPermissionsAsync();
        status = requested.status;
      }

      if (status !== 'granted') return null;

      const current = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      return {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
      };
    } catch (error) {
      console.warn('[Map] Failed to read device location for fallback:', error);
      return null;
    }
  }, []);

  const loadCoordinates = useCallback(async () => {
    if (!sessionKey) {
      setErrorText('Не знайдено сесію користувача.');
      setCoordsLoading(false);
      return;
    }

    try {
      setCoordsLoading(true);
      const response = await fetchWithAuth(
        `${BASE_URL}/users/by-phone?phoneNumber=${encodeURIComponent(sessionKey)}`,
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message ?? 'Не вдалося завантажити профіль');
      }

      const latitude = Number(data?.latitude);
      const longitude = Number(data?.longitude);
      const photoUrl = typeof data?.photoUrl === 'string' ? data.photoUrl : null;
      const userId = Number.isFinite(Number(data?.id)) ? Number(data.id) : null;

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setUserMapData(null);
        const currentCoords = await loadDeviceLocation();
        if (currentCoords) {
          setFallbackCoords(currentCoords);
          setErrorText('Координати профілю ще не збережені. Показуємо вашу поточну геолокацію.');
        } else {
          setFallbackCoords(null);
          setErrorText('Координати ще не збережені. Дозволь геолокацію на екрані Готово.');
        }
        return;
      }

      setUserMapData({ id: userId, latitude, longitude, photoUrl });
      setFallbackCoords(null);
      setErrorText('');
    } catch (error: any) {
      setUserMapData(null);
      const currentCoords = await loadDeviceLocation();
      if (currentCoords) {
        setFallbackCoords(currentCoords);
        setErrorText(error?.message ?? 'Показуємо поточну геолокацію через помилку завантаження профілю');
      } else {
        setFallbackCoords(null);
        setErrorText(error?.message ?? 'Помилка завантаження координат');
      }
    } finally {
      setCoordsLoading(false);
    }
  }, [loadDeviceLocation, sessionKey]);

  const loadMapMarkers = useCallback(async () => {
    try {
      const response = await fetchWithAuth(`${BASE_URL}/map/users`);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data?.message === 'string' ? data.message : 'Не вдалося завантажити користувачів на карті',
        );
      }

      const markers = parseUsersMapResponse(data);
      const signature = mapMarkersSignature(markers);
      if (signature !== markersSignatureRef.current) {
        markersSignatureRef.current = signature;
        setOnlineUsers(markers);
      }
    } catch (error) {
      console.warn('[Map] Failed to load map markers:', error);
    }
  }, []);

  useEffect(() => {
    if (!sessionKey) return;

    void loadCoordinates();
    void loadMapMarkers();

    const timer = setInterval(() => {
      void loadMapMarkers();
    }, MAP_MARKERS_POLL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [loadCoordinates, loadMapMarkers, sessionKey]);

  const markerCoords = useMemo(() => {
    if (userMapData) {
      return { latitude: userMapData.latitude, longitude: userMapData.longitude };
    }
    return fallbackCoords;
  }, [fallbackCoords, userMapData]);

  const allVisibleMarkers = useMemo(() => {
    const interestFilterName = getInterestNameByFilterKey(mapSortFilterKey);
    const markers = onlineUsers.filter((marker) => {
      if (!interestFilterName) return true;
      const interests = marker.interests ?? [];
      return interests.some(({ interest }) => interest.name === interestFilterName);
    });

    if (markerCoords && !markers.some((m) => m.id === userMapData?.id)) {
      markers.push({
        id: -1,
        latitude: markerCoords.latitude,
        longitude: markerCoords.longitude,
        photoUrl: userMapData?.photoUrl ?? null,
        name: 'Ви',
        isOnline: true,
        lastSeenAt: null,
        isFriend: false,
        friendRequestStatus: 'none',
        relationshipLabel: 'Ви',
      });
    }

    return markers;
  }, [mapSortFilterKey, markerCoords, onlineUsers, userMapData?.id, userMapData?.photoUrl]);

  const initialRegion = useMemo(() => {
    if (markerCoords) {
      return {
        latitude: markerCoords.latitude,
        longitude: markerCoords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
    }

    return {
      latitude: 50.4501,
      longitude: 30.5234,
      latitudeDelta: 0.15,
      longitudeDelta: 0.15,
    };
  }, [markerCoords]);

  useEffect(() => {
    if (!markerCoords || !mapRef.current || didAnimateToUserRef.current) return;

    didAnimateToUserRef.current = true;
    mapRef.current.animateToRegion(
      {
        latitude: markerCoords.latitude,
        longitude: markerCoords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      },
      600,
    );
  }, [markerCoords]);

  const shouldClusterMarkers = debouncedRegionDelta >= CLUSTER_ZOOM_THRESHOLD;

  const mapDisplayItems = useMemo(() => {
    if (!shouldClusterMarkers) {
      return allVisibleMarkers.map((marker) => ({ kind: 'single' as const, marker }));
    }

    const clusterRadius = debouncedRegionDelta * CLUSTER_RADIUS_FACTOR;
    const clusters = clusterMapMarkers(allVisibleMarkers, clusterRadius);

    return clusters.map((cluster) =>
      cluster.count === 1
        ? { kind: 'single' as const, marker: cluster.markers[0] }
        : { kind: 'cluster' as const, cluster },
    );
  }, [allVisibleMarkers, debouncedRegionDelta, shouldClusterMarkers]);

  const handleRegionChangeComplete = useCallback((region: Region) => {
    setRegionDelta(region.latitudeDelta);
  }, []);

  const zoomToCluster = useCallback((cluster: MapMarkerCluster<OnlineUserMarker>) => {
    if (!mapRef.current || cluster.markers.length === 0) return;

    const latitudes = cluster.markers.map((marker) => marker.latitude);
    const longitudes = cluster.markers.map((marker) => marker.longitude);
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLng = Math.min(...longitudes);
    const maxLng = Math.max(...longitudes);
    const padding = 0.003;

    mapRef.current.animateToRegion(
      {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * 2 + padding, 0.006),
        longitudeDelta: Math.max((maxLng - minLng) * 2 + padding, 0.006),
      },
      450,
    );
  }, []);

  const markerPhotoUris = useMemo(() => {
    const uris = new Map<number, string | null>();
    for (const marker of allVisibleMarkers) {
      uris.set(
        marker.id,
        marker.photoUrl
          ? marker.photoUrl.startsWith('http')
            ? marker.photoUrl
            : `${BASE_URL}${marker.photoUrl}`
          : null,
      );
    }
    return uris;
  }, [allVisibleMarkers]);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedUser(null);
    setAddingFriend(false);
  }, []);

  const sheetProfile = useMemo(() => {
    if (!selectedUser) return null;
    return buildMapUserProfileSheetFromMarker(selectedUser, BASE_URL);
  }, [selectedUser]);

  const onPressChat = useCallback(() => {
    if (!selectedUser) return;
    closeSheet();

    void openChatWithParticipant(Number(selectedUser.id)).catch((e: unknown) => {
      const message = e instanceof Error ? e.message : 'Не вдалося відкрити чат';
      Alert.alert('Помилка', message);
    });
  }, [closeSheet, selectedUser]);

  const onPressAddFriend = useCallback(() => {
    console.log('[Map] Add friend pressed:', { selectedUser });

    if (!selectedUser) {
      console.log('[Map] Add friend skipped: no selected user');
      return;
    }

    if (selectedUser.friendRequestStatus && selectedUser.friendRequestStatus !== 'none') {
      console.log('[Map] Add friend skipped: request already has state', {
        userId: selectedUser.id,
        friendRequestStatus: selectedUser.friendRequestStatus,
      });
      return;
    }

    const addresseeId = selectedUser.id;
    setAddingFriend(true);

    console.log('[Map] Add friend request started:', {
      url: `${BASE_URL}/friends/requests`,
      body: { addresseeId },
    });

    fetchWithAuth(`${BASE_URL}/friends/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresseeId }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        console.log('[Map] Add friend response received:', {
          status: response.status,
          ok: response.ok,
          data,
        });

        if (!response.ok) {
          throw new Error(data?.message ?? 'Не вдалося надіслати заявку в друзі');
        }

        const nextRelationship: FriendRelationship = {
          isFriend: false,
          friendRequestStatus: 'outgoing',
          relationshipLabel: 'Заявка надіслана',
        };

        setOnlineUsers((current) =>
          current.map((user) => (user.id === addresseeId ? { ...user, ...nextRelationship } : user)),
        );
        setSelectedUser((current) => (current?.id === addresseeId ? { ...current, ...nextRelationship } : current));
        console.log('[Map] Add friend UI updated:', {
          addresseeId,
          nextRelationship,
        });
        Alert.alert('Заявку надіслано', 'Користувач побачить вашу заявку в друзі.');
      })
      .catch((error: any) => {
        console.warn('[Map] Add friend failed:', {
          addresseeId,
          message: error?.message,
          error,
        });
        Alert.alert('Не вдалося додати в друзі', error?.message ?? 'Спробуйте ще раз пізніше.');
      })
      .finally(() => {
        console.log('[Map] Add friend request finished:', { addresseeId });
        setAddingFriend(false);
      });
  }, [selectedUser]);

  const onPressSendLocation = useCallback(() => {
    if (!selectedUser) return;
    closeSheet();

    void openChatWithParticipant(Number(selectedUser.id)).catch((e: unknown) => {
      const message = e instanceof Error ? e.message : 'Не вдалося відкрити чат';
      Alert.alert('Помилка', message);
    });
  }, [closeSheet, selectedUser]);

  const openSortFilterSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedUser(null);
    setSortFilterSheetVisible(true);
  }, []);

  const closeSortFilterSheet = useCallback(() => {
    setSortFilterSheetVisible(false);
  }, []);

  const onPressMapNotifications = useCallback(() => {
    router.push('/notifications');
  }, []);

  const handleMarkerPress = useCallback(
    (marker: OnlineUserMarker) => {
      if (marker.id === -1) return;
      if (marker.id === userMapData?.id) return;

      setSortFilterSheetVisible(false);
      setSelectedUser(marker);
      setSheetVisible(true);

      fetchWithAuth(`${BASE_URL}/users/${marker.id}`)
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) {
            throw new Error(data?.message ?? 'Не вдалося завантажити користувача');
          }

          const detailedMarker = mergeBackendUserIntoMarker(marker, data);
          setSelectedUser((current) => (current?.id === marker.id ? detailedMarker : current));
          setOnlineUsers((current) => current.map((user) => (user.id === marker.id ? detailedMarker : user)));
        })
        .catch((error) => {
          console.warn('[Map] Failed to load user details:', error);
        });
    },
    [userMapData?.id],
  );

  const handleMarkerPressById = useCallback(
    (markerId: number) => {
      const marker = onlineUsers.find((user) => user.id === markerId);
      if (marker) handleMarkerPress(marker);
    },
    [handleMarkerPress, onlineUsers],
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <MapView
        ref={(ref) => {
          mapRef.current = ref;
        }}
        style={styles.map}
        initialRegion={initialRegion}
        onRegionChangeComplete={handleRegionChangeComplete}
        userInterfaceStyle={Platform.OS === 'ios' ? (isDark ? 'dark' : 'light') : undefined}
      >
        {mapDisplayItems.map((item) => {
          if (item.kind === 'cluster') {
            const { cluster } = item;
            return (
              <MapClusterMarker
                key={`user-cluster-${cluster.id}`}
                id={cluster.id}
                latitude={cluster.latitude}
                longitude={cluster.longitude}
                count={cluster.count}
                onPress={() => zoomToCluster(cluster)}
              />
            );
          }

          const marker = item.marker;
          return (
            <MapUserMarker
              key={`user-marker-${marker.id}`}
              id={marker.id}
              latitude={marker.latitude}
              longitude={marker.longitude}
              photoUri={markerPhotoUris.get(marker.id) ?? null}
              onPress={handleMarkerPressById}
            />
          );
        })}
      </MapView>

      <View style={[styles.mapTopBar, { paddingTop: insets.top + 8 }]} pointerEvents="box-none">
        <Pressable
          onPress={openSortFilterSheet}
          style={({ pressed }) => [
            styles.mapTopFab,
            isDark && styles.mapTopFabDark,
            pressed && styles.mapTopFabPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Сортування за статусами та інтересами"
        >
          <Ionicons name="options-outline" size={24} color={mapTopFabIconColor} />
        </Pressable>
        <Pressable
          onPress={onPressMapNotifications}
          style={({ pressed }) => [
            styles.mapTopFab,
            isDark && styles.mapTopFabDark,
            pressed && styles.mapTopFabPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Сповіщення"
        >
          <Ionicons name="notifications-outline" size={24} color={mapTopFabIconColor} />
        </Pressable>
      </View>

      {!!errorText && !coordsLoading && (
        <View style={[styles.floatingInfo, { top: insets.top + 64 }]}>
          <Text style={styles.floatingInfoText}>{errorText}</Text>
        </View>
      )}

      {coordsLoading && (
        <View style={styles.coordsLoadingBadge}>
          <ActivityIndicator size="small" color="#C88CEB" />
        </View>
      )}

      <MapUserProfileBottomSheet
        visible={sheetVisible}
        onClose={closeSheet}
        profile={sheetProfile}
        bottomInset={insets.bottom}
        onPressMessage={onPressChat}
        onPressAddFriend={onPressAddFriend}
        onPressSendLocation={onPressSendLocation}
        addingFriend={addingFriend}
      />

      <MapSortFilterBottomSheet
        visible={sortFilterSheetVisible}
        onClose={closeSortFilterSheet}
        bottomInset={insets.bottom}
        selectedKey={mapSortFilterKey}
        onSelectKey={setMapSortFilterKey}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  containerDark: {
    backgroundColor: '#1C1C1E',
  },
  map: {
    flex: 1,
  },
  mapTopBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 40,
  },
  mapTopFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.86)',
    borderWidth: 1,
    borderColor: '#E7D2F4',
  },
  mapTopFabDark: {
    backgroundColor: 'rgba(38, 38, 42, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(200, 140, 235, 0.42)',
  },
  mapTopFabPressed: {
    opacity: 0.88,
  },
  floatingInfo: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  floatingInfoText: {
    fontFamily: 'Inter',
    fontSize: 14,
    color: '#6A8298',
  },
  coordsLoadingBadge: {
    position: 'absolute',
    top: 120,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
});
