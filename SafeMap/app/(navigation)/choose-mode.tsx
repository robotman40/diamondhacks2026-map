import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, MapPin, AlertTriangle, Users } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { useLocation, UCSD_DEFAULT } from "@/hooks/useLocation";

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ChooseMode() {
  const router = useRouter();
  const { coords } = useLocation();
  const params = useLocalSearchParams<{
    destName?: string;
    destLat?: string;
    destLng?: string;
  }>();

  const destName = params.destName ?? "Destination";
  const destLat = params.destLat ? parseFloat(params.destLat) : 32.8812;
  const destLng = params.destLng ? parseFloat(params.destLng) : -117.2378;

  const estimate = useMemo(() => {
    const origin = coords ?? UCSD_DEFAULT;
    const meters = haversineMeters(origin.latitude, origin.longitude, destLat, destLng);
    const mins = Math.round(meters / 83);
    return mins < 1 ? "< 1 min walk" : `~${mins} min walk`;
  }, [coords, destLat, destLng]);

  function goToRoute(pathname: "/route-map" | "/finding-buddy") {
    router.push({
      pathname,
      params: {
        destName: params.destName,
        destLat: params.destLat,
        destLng: params.destLng,
      },
    });
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 flex-1">
        <View className="flex-row items-center gap-3 mt-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text className="text-white text-xl font-bold">Choose Your Mode</Text>
        </View>

        <View className="mt-6">
          <Text className="text-text-muted text-sm font-semibold mb-3">Route</Text>
          <View className="bg-surface rounded-2xl p-4">
            <View className="flex-row items-center gap-3">
              <MapPin size={16} color={Colors.accent} />
              <Text className="text-white text-sm">Current Location</Text>
            </View>
            <View className="ml-2 border-l border-dashed border-text-muted h-6 my-1" />
            <View className="flex-row items-center gap-3">
              <MapPin size={16} color={Colors.danger} />
              <Text className="text-white text-sm">{destName}</Text>
            </View>
            <Text className="text-text-muted text-xs mt-2 ml-7">{estimate}</Text>
          </View>
        </View>

        <View className="gap-4 mt-6">
          <Pressable
            className="bg-surface rounded-2xl p-4"
            onPress={() => goToRoute("/route-map")}
          >
            <AlertTriangle size={24} color="#f59e0b" />
            <Text className="text-white font-bold text-lg mt-3">Guided Solo</Text>
            <Text className="text-text-muted text-sm mt-1">
              Follow the safest route with real-time alerts. Best for confident, solo walkers.
            </Text>
          </Pressable>

          <Pressable
            className="bg-surface rounded-2xl p-4"
            onPress={() => goToRoute("/finding-buddy")}
          >
            <Users size={24} color={Colors.accent} />
            <Text className="text-white font-bold text-lg mt-3">Request Buddy</Text>
            <Text className="text-text-muted text-sm mt-1">
              Get paired with a verified student heading the same direction.
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
