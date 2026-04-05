import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserCheck } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";
import RouteCard from "@/components/RouteCard";
import { fetchRoutes, formatDistance, formatDuration, Route } from "@/lib/routeService";
import { useLocation, UCSD_DEFAULT } from "@/hooks/useLocation";

// The matched group for this session — shared with route-map-buddy and your-group
export const MATCHED_BUDDIES = ["Jamie S.", "Alex M. (Psych)"];

export default function BuddyFound() {
  const router = useRouter();
  const { coords } = useLocation();
  const params = useLocalSearchParams<{
    destName?: string;
    destLat?: string;
    destLng?: string;
  }>();

  const [route, setRoute] = useState<Route | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);

  const destLat = params.destLat ? parseFloat(params.destLat) : 32.8812;
  const destLng = params.destLng ? parseFloat(params.destLng) : -117.2378;
  const destName = params.destName ?? "Destination";

  useEffect(() => {
    const origin = coords ?? UCSD_DEFAULT;
    fetchRoutes(origin.latitude, origin.longitude, destLat, destLng).then((r) => {
      setRoute(r[0] ?? null);
      setLoadingRoute(false);
    });
  }, [coords]);

  const origin = coords ?? UCSD_DEFAULT;
  const centerLng = (origin.longitude + destLng) / 2;
  const centerLat = (origin.latitude + destLat) / 2;

  return (
    <View className="flex-1 bg-background">
      {loadingRoute ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : (
        <MapViewComponent
          showRoute={!!route}
          routeCoordinates={route?.coordinates ?? []}
          centerCoordinate={[centerLng, centerLat]}
          zoomLevel={14}
        />
      )}

      {/* Top bar — no back button (arrived via replace) */}
      <SafeAreaView className="absolute top-0 left-0 right-0" edges={["top"]}>
        <View className="px-4 mt-2 flex-row items-center gap-2">
          <View className="w-7 h-7 rounded-full bg-accent/20 items-center justify-center">
            <UserCheck size={15} color={Colors.accent} />
          </View>
          <View>
            <Text className="text-white font-bold text-base">{destName}</Text>
            <Text className="text-accent text-xs font-semibold">
              {MATCHED_BUDDIES.length} {MATCHED_BUDDIES.length === 1 ? "buddy" : "buddies"} matched
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Bottom sheet */}
      <View className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-4 pb-8">
        {/* Group members */}
        <Text className="text-text-muted text-xs font-semibold mb-2">YOUR GROUP</Text>
        <View className="flex-row gap-2 mb-4">
          {MATCHED_BUDDIES.map((name) => (
            <View
              key={name}
              className="flex-row items-center gap-1.5 bg-background rounded-xl px-3 py-1.5"
            >
              <View className="w-5 h-5 rounded-full bg-accent/20 items-center justify-center">
                <UserCheck size={11} color={Colors.accent} />
              </View>
              <Text className="text-white text-xs font-medium">{name}</Text>
            </View>
          ))}
        </View>

        {/* Route stats */}
        {loadingRoute ? (
          <View className="items-center py-4">
            <ActivityIndicator color={Colors.accent} />
            <Text className="text-text-muted text-sm mt-2">Calculating safest route…</Text>
          </View>
        ) : (
          <RouteCard
            title={destName}
            subtitle="Safest path via well-lit corridors"
            stats={[
              {
                label: "Distance",
                value: route ? formatDistance(route.distanceMeters) : "—",
              },
              {
                label: "Time",
                value: route ? formatDuration(route.timeSeconds) : "—",
              },
              { label: "Safety", value: "92%" },
            ]}
          />
        )}

        <Pressable
          className="bg-accent rounded-xl py-4 items-center mt-4"
          disabled={loadingRoute}
          onPress={() =>
            router.push({
              pathname: "/route-map-buddy",
              params: {
                destName: params.destName,
                destLat: params.destLat,
                destLng: params.destLng,
                timeEstimate: route ? formatDuration(route.timeSeconds) : undefined,
              },
            })
          }
        >
          <Text className="text-background font-bold text-base">Start Walk</Text>
        </Pressable>
      </View>
    </View>
  );
}
