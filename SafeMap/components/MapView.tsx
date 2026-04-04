import React from "react";
import { View } from "react-native";
import Mapbox from "@rnmapbox/maps";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "");

type Props = {
  showRoute?: boolean;
  routeCoordinates?: [number, number][];
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  children?: React.ReactNode;
};

const routeGeoJSON = (coords: [number, number][]) => ({
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: coords,
      },
      properties: {},
    },
  ],
});

export default function MapViewComponent({
  showRoute = false,
  routeCoordinates = [],
  centerCoordinate = [-117.2340, 32.8801],
  zoomLevel = 15,
  children,
}: Props) {
  return (
    <View className="flex-1">
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/dark-v11"
      >
        <Mapbox.Camera
          centerCoordinate={centerCoordinate}
          zoomLevel={zoomLevel}
        />
        {showRoute && routeCoordinates.length > 1 && (
          <Mapbox.ShapeSource
            id="routeSource"
            shape={routeGeoJSON(routeCoordinates)}
          >
            <Mapbox.LineLayer
              id="routeLine"
              style={{
                lineColor: "#2dd4a8",
                lineWidth: 4,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </Mapbox.ShapeSource>
        )}
        {children}
      </Mapbox.MapView>
    </View>
  );
}
