import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import MapViewComponent from "@/components/MapView";
import { Route } from "@/lib/routeService";
import { useLocation, UCSD_DEFAULT } from "@/hooks/useLocation";
import { loadProfile } from "@/lib/profileService";

export default function WalkingSolo() {
  const router = useRouter();
  const { coords } = useLocation();
  const params = useLocalSearchParams<{
    destName?: string;
    destLat?: string;
    destLng?: string;
    timeEstimate?: string;
    routeCoords?: string;
    distanceMeters?: string;
    timeSeconds?: string;
  }>();

  const [emergencyContact, setEmergencyContact] = useState<string>("");

  const destLat = params.destLat ? parseFloat(params.destLat) : 32.8812;
  const destLng = params.destLng ? parseFloat(params.destLng) : -117.2378;
  const destName = params.destName ?? "Destination";

  // Use the route that was already calculated on the previous screen
  const route = useMemo<Route | null>(() => {
    if (!params.routeCoords) return null;
    return {
      id: "active",
      coordinates: JSON.parse(params.routeCoords) as [number, number][],
      distanceMeters: params.distanceMeters ? parseFloat(params.distanceMeters) : 0,
      timeSeconds: params.timeSeconds ? parseFloat(params.timeSeconds) : 0,
    };
  }, [params.routeCoords]);

  useEffect(() => {
    loadProfile().then((p) => {
      if (p?.emergencyContact) setEmergencyContact(p.emergencyContact);
    });
  }, []);

  const timeDisplay = params.timeEstimate ?? null;

  const origin = coords ?? UCSD_DEFAULT;
  const centerLng = (origin.longitude + destLng) / 2;
  const centerLat = (origin.latitude + destLat) / 2;

  function handleSOS() {
    Alert.alert(
      "SOS — Emergency",
      emergencyContact
        ? `Your emergency contact (${emergencyContact}) will be notified with your current location.`
        : "No emergency contact set. Go to Settings to add one.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send SOS",
          style: "destructive",
          onPress: () => {
            Alert.alert("SOS Sent", "Your emergency contact has been notified.");
          },
        },
      ]
    );
  }

  function handleEndRoute() {
    Alert.alert("End Route", "Are you sure you want to end this walk?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "End Walk",
        onPress: () =>
          router.push({
            pathname: "/walk-completed",
            params: {
              distance: route ? String(route.distanceMeters) : undefined,
              time: route ? String(route.timeSeconds) : undefined,
            },
          }),
      },
    ]);
  }

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent
        showRoute={!!route}
        routeCoordinates={route?.coordinates ?? []}
        centerCoordinate={[centerLng, centerLat]}
        zoomLevel={15}
      />

      <SafeAreaView className="absolute top-0 left-0 right-0" edges={["top"]}>
        <View className="px-4 mt-2">
          <Text className="text-white text-lg font-bold">{destName}</Text>
          <Text className="text-text-muted text-xs">Guided Solo Walk</Text>
        </View>
      </SafeAreaView>

      <View className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-4 pb-8">
        {timeDisplay && (
          <Text className="text-text-muted text-sm text-center mb-4">
            Estimated arrival in{" "}
            <Text className="text-white font-semibold">{timeDisplay}</Text>
          </Text>
        )}

        <View className="flex-row gap-3">
          <Pressable
            className="flex-1 bg-background border border-surface rounded-xl py-4 items-center"
            onPress={handleEndRoute}
          >
            <Text className="text-white font-semibold text-base">End Route</Text>
          </Pressable>
          <Pressable
            className="flex-1 bg-danger rounded-xl py-4 items-center"
            onPress={handleSOS}
          >
            <Text className="text-white font-bold text-base">SOS</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
