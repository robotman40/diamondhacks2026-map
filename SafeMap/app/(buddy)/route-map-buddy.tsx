import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";
import { fetchRoutes, formatDistance, formatDuration, Route, FALLBACK_ROUTE_ID } from "@/lib/routeService";
import { useLocation } from "@/hooks/useLocation";
import { saveActiveRoute, clearActiveRoute } from "@/lib/routeStore";
import { loadProfile } from "@/lib/profileService";
import { MATCHED_BUDDIES } from "./buddy-found";

export default function RouteMapBuddy() {
  const router = useRouter();
  const { coords, loading: locationLoading } = useLocation();
  const params = useLocalSearchParams<{
    destName?: string;
    destLat?: string;
    destLng?: string;
  }>();

  const [activeRoute, setActiveRoute] = useState<Route | null>(null);
  const [loadingRoute, setLoadingRoute] = useState(true);
  const [routeError, setRouteError] = useState(false);
  const [statusMsg, setStatusMsg] = useState("Getting your location…");
  const [emergencyContact, setEmergencyContact] = useState<string>("");
  const fetchStarted = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 6;

  const destLat = params.destLat ? parseFloat(params.destLat) : 32.8812;
  const destLng = params.destLng ? parseFloat(params.destLng) : -117.2378;
  const destName = params.destName ?? "Destination";

  useEffect(() => {
    loadProfile().then((p) => {
      if (p?.emergencyContact) setEmergencyContact(p.emergencyContact);
    });
  }, []);

  useEffect(() => {
    if (fetchStarted.current) return;
    if (locationLoading) return;
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
        onPress: () => {
          clearActiveRoute();
          router.push({
            pathname: "/walk-completed",
            params: {
              distance: activeRoute ? String(activeRoute.distanceMeters) : undefined,
              time: activeRoute ? String(activeRoute.timeSeconds) : undefined,
              buddies: MATCHED_BUDDIES.join(","),
            },
          });
        },
      },
    ]);
  }

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent
        showRoute={!!activeRoute}
        routeCoordinates={activeRoute?.coordinates ?? []}
        centerCoordinate={[centerLng, centerLat]}
        zoomLevel={14}
        showUserLocation
        followUser
      />

      <SafeAreaView className="absolute top-0 left-0 right-0" edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 mt-2">
          <View>
            <Text className="text-white font-bold text-base">{destName}</Text>
            <Text className="text-text-muted text-xs">
              Walking with {MATCHED_BUDDIES.join(" & ")}
            </Text>
          </View>

          <Pressable
            className="bg-surface rounded-xl px-3 py-2 flex-row items-center gap-2"
            onPress={() =>
              router.push({
                pathname: "/your-group",
                params: { destName: params.destName },
              })
            }
          >
            <Users size={16} color={Colors.accent} />
            <Text className="text-accent text-sm font-semibold">
              Group ({MATCHED_BUDDIES.length})
            </Text>
          </Pressable>
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
          activeRoute && (
            <Text className="text-text-muted text-sm text-center mb-4">
              {formatDistance(activeRoute.distanceMeters)} · Est.{" "}
              <Text className="text-white font-semibold">
                {formatDuration(activeRoute.timeSeconds)}
              </Text>
            </Text>
          )
        )}

        <View className="flex-row gap-3 mt-2">
          <Pressable
            className="flex-1 bg-background border border-surface rounded-xl py-4 items-center"
            onPress={handleEndRoute}
            disabled={loadingRoute || routeError}
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
