import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";
import RouteCard from "@/components/RouteCard";
import { fetchRoutes, formatDistance, formatDuration, Route } from "@/lib/routeService";
import { useLocation, UCSD_DEFAULT } from "@/hooks/useLocation";

export default function RouteMap() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    destName?: string;
    destLat?: string;
    destLng?: string;
  }>();

  const { coords } = useLocation();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingRoute, setLoadingRoute] = useState(true);

  const destLat = params.destLat ? parseFloat(params.destLat) : 32.8812;
  const destLng = params.destLng ? parseFloat(params.destLng) : -117.2378;

  useEffect(() => {
    const origin = coords ?? UCSD_DEFAULT;
    fetchRoutes(origin.latitude, origin.longitude, destLat, destLng).then((r) => {
      setRoutes(r);
      setLoadingRoute(false);
    });
  }, [coords]);

  const activeRoute = routes[0];

  const origin = coords ?? UCSD_DEFAULT;
  const centerLng = (origin.longitude + destLng) / 2;
  const centerLat = (origin.latitude + destLat) / 2;

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent
        showRoute={!!activeRoute}
        routeCoordinates={activeRoute?.coordinates ?? []}
        centerCoordinate={[centerLng, centerLat]}
        zoomLevel={14}
      />

      <SafeAreaView className="absolute top-0 left-0 right-0" edges={["top"]}>
        <View className="flex-row items-center gap-3 px-4 mt-2">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text className="text-white font-bold text-base">{params.destName ?? "Route"}</Text>
        </View>
      </SafeAreaView>

      <View className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-4 pb-8">
        {loadingRoute ? (
          <View className="items-center py-4">
            <ActivityIndicator color={Colors.accent} />
            <Text className="text-text-muted text-sm mt-2">Calculating safest route…</Text>
          </View>
        ) : (
          <RouteCard
            title={params.destName ?? "Route Info"}
            subtitle="Safest path via well-lit corridors"
            stats={[
              {
                label: "Distance",
                value: activeRoute ? formatDistance(activeRoute.distanceMeters) : "—",
              },
              {
                label: "Time",
                value: activeRoute ? formatDuration(activeRoute.timeSeconds) : "—",
              },
              { label: "Safety", value: "92%" },
            ]}
          />
        )}
        <Pressable
          className="bg-accent rounded-xl py-4 items-center mt-4"
          onPress={() =>
            router.push({
              pathname: "/walking-solo",
              params: {
                destName: params.destName,
                destLat: params.destLat,
                destLng: params.destLng,
                timeEstimate: activeRoute ? formatDuration(activeRoute.timeSeconds) : undefined,
                routeCoords: activeRoute ? JSON.stringify(activeRoute.coordinates) : undefined,
                distanceMeters: activeRoute ? String(activeRoute.distanceMeters) : undefined,
                timeSeconds: activeRoute ? String(activeRoute.timeSeconds) : undefined,
              },
            })
          }
          disabled={loadingRoute}
        >
          <Text className="text-background font-bold text-base">Start</Text>
        </Pressable>
      </View>
    </View>
  );
}
