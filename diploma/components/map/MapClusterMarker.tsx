import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';

type MapClusterMarkerProps = {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  onPress: (id: string) => void;
};

function MapClusterMarkerComponent({ id, latitude, longitude, count, onPress }: MapClusterMarkerProps) {
  return (
    <Marker
      coordinate={{ latitude, longitude }}
      tracksViewChanges={false}
      onPress={() => onPress(id)}
    >
      <View style={styles.clusterWrap}>
        <Text style={styles.clusterCount}>{count}</Text>
      </View>
    </Marker>
  );
}

export const MapClusterMarker = memo(MapClusterMarkerComponent);

const styles = StyleSheet.create({
  clusterWrap: {
    minWidth: 34,
    height: 34,
    paddingHorizontal: 8,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C88CEB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  clusterCount: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
