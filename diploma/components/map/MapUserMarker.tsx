import { Image } from 'expo-image';
import { memo, useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnimatedRegion, Marker } from 'react-native-maps';

type AnimatedRegionTimingConfig = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
  duration: number;
  useNativeDriver: boolean;
};

const AnimatedMarker = Marker.Animated;

const MARKER_MOVE_DURATION_MS = 900;
const COORD_EPSILON = 1e-7;

type MapUserMarkerProps = {
  id: number;
  latitude: number;
  longitude: number;
  photoUri: string | null;
  onPress: (id: number) => void;
};

function coordsChanged(
  prev: { latitude: number; longitude: number },
  next: { latitude: number; longitude: number },
) {
  return (
    Math.abs(prev.latitude - next.latitude) > COORD_EPSILON ||
    Math.abs(prev.longitude - next.longitude) > COORD_EPSILON
  );
}

function MapUserMarkerComponent({ id, latitude, longitude, photoUri, onPress }: MapUserMarkerProps) {
  const coordinate = useRef(
    new AnimatedRegion({
      latitude,
      longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current;
  const hasMountedRef = useRef(false);
  const lastCoordRef = useRef({ latitude, longitude });

  useEffect(() => {
    const next = { latitude, longitude };

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      lastCoordRef.current = next;
      coordinate.setValue({
        latitude: next.latitude,
        longitude: next.longitude,
        latitudeDelta: 0,
        longitudeDelta: 0,
      });
      return;
    }

    if (!coordsChanged(lastCoordRef.current, next)) {
      return;
    }

    lastCoordRef.current = next;
    const timingConfig: AnimatedRegionTimingConfig = {
      latitude: next.latitude,
      longitude: next.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
      duration: MARKER_MOVE_DURATION_MS,
      useNativeDriver: false,
    };
    coordinate.timing(timingConfig as never).start();
  }, [coordinate, latitude, longitude]);

  return (
    <AnimatedMarker
      coordinate={coordinate as never}
      tracksViewChanges={false}
      onPress={() => onPress(id)}
    >
      <View style={styles.markerWrap}>
        <View style={styles.avatarRingOnline}>
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={styles.avatarImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              recyclingKey={`map-marker-${id}`}
            />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>🙂</Text>
            </View>
          )}
        </View>
      </View>
    </AnimatedMarker>
  );
}

export const MapUserMarker = memo(
  MapUserMarkerComponent,
  (prev, next) =>
    prev.id === next.id &&
    prev.latitude === next.latitude &&
    prev.longitude === next.longitude &&
    prev.photoUri === next.photoUri,
);

const styles = StyleSheet.create({
  markerWrap: {
    width: 72,
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRingOnline: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: '#121212',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#CFE4FF',
  },
  avatarFallbackText: {
    fontSize: 22,
  },
});
