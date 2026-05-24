import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

type MapUserMarkerProps = {
  id: number;
  latitude: number;
  longitude: number;
  photoUri: string | null;
  onPress: (id: number) => void;
};

function MapUserMarkerComponent({ id, latitude, longitude, photoUri, onPress }: MapUserMarkerProps) {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
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
    </Marker>
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
