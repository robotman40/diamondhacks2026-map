import React from "react";
import { View, StyleSheet } from "react-native";
import RNMapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";

const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0f1a2e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8899aa" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0f1a2e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a2840" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#243447" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1120" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

type Props = {
  showRoute?: boolean;
  routeCoordinates?: [number, number][];
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  children?: React.ReactNode;
};

function zoomToLatitudeDelta(zoom: number): number {
  return 360 / Math.pow(2, zoom);
}

export default function MapViewComponent({
  showRoute = false,
  routeCoordinates = [],
  centerCoordinate = [-117.2340, 32.8801],
  zoomLevel = 15,
  children,
}: Props) {
  const [longitude, latitude] = centerCoordinate;
  const delta = zoomToLatitudeDelta(zoomLevel);

  const polylineCoords = routeCoordinates.map(([lng, lat]) => ({
    latitude: lat,
    longitude: lng,
  }));

  return (
    <View style={styles.container}>
      <RNMapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: delta,
          longitudeDelta: delta * 0.5,
        }}
      >
        {showRoute && polylineCoords.length > 1 && (
          <Polyline
            coordinates={polylineCoords}
            strokeColor="#2dd4a8"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
        {children}
      </RNMapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
