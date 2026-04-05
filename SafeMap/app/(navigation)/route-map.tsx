import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";
import RouteCard from "@/components/RouteCard";
import { fetchRoutes, formatDistance, formatDuration, Route, FALLBACK_ROUTE_ID } from "@/lib/routeService";
import { useLocation } from "@/hooks/useLocation";
import { saveActiveRoute } from "@/lib/routeStore";

export default function RouteMap() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    destName?: string;
    destLat?: string;
    destLng?: string;
  }>();

  const { coords, loading: locationLoading } = useLocation();

  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [routeError, setRouteError] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Getting your location…");
  const fetchStarted = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 6;

  const destLat = params.destLat ? parseFloat(params.destLat) : 32.8812;
  const destLng = params.destLng ? parseFloat(params.destLng) : -117.2378;

  // Wait for location to resolve, then fetch route exactly once
  useEffect(() => {
    if (fetchStarted.current) return;
    if (locationLoading) return; // still waiting for GPS fix
    if (!coords) return;
    fetchStarted.current = true;

    setStatusMsg("Calculating safest route…");
    const origin = coords;

    function attempt() {
      fetchRoutes(origin.latitude, origin.longitude, destLat, destLng).then((r) => {
        if (r[0]?.id === FALLBACK_ROUTE_ID) {
          if (retryCount.current < MAX_RETRIES) {
            retryCount.current++;
            setStatusMsg(`Waking up route server… (${retryCount.current}/${MAX_RETRIES})`);
            setTimeout(attempt, 5000);
          } else {
            setLoadingRoute(false);
            setRouteError(true);
          }
        } else {
          const route = r[0]!;
          saveActiveRoute(route);
          setActiveRoute(route);
          setLoadingRoute(false);
        }
      });
    }
    attempt();
  }, [locationLoading]);

  const origin = coords ?? { latitude: 32.8801, longitude: -117.234 };
  const centerLng = (origin.longitude + destLng) / 2;
  const centerLat = (origin.latitude + destLat) / 2;

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent
        showRoute={!!activeRoute}
        routeCoordinates={activeRoute?.coordinates ?? []}
        centerCoordinate={[centerLng, centerLat]}
        zoomLevel={14}
        showUserLocation
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
            <Text className="text-text-muted text-sm mt-2">{statusMsg}</Text>
          </View>
        ) : routeError ? (
          <View className="items-center py-4">
            <Text className="text-danger text-sm text-center">
              Unable to calculate route. Check your connection and try again.
            </Text>
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
              },
            })
          }
          disabled={loadingRoute || routeError}
        >
          <Text className="text-background font-bold text-base">Start</Text>
        </Pressable>
      </View>
    </View>
  );
}
