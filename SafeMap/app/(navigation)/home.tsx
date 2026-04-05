import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Settings } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";
import { useLocation, UCSD_DEFAULT } from "@/hooks/useLocation";
import { loadProfile } from "@/lib/profileService";

export default function Home() {
  const router = useRouter();
  const { coords, loading } = useLocation();
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    loadProfile().then((p) => {
      if (p?.displayName) {
        setFirstName(p.displayName.split(" ")[0]);
      }
    });
  }, []);

  const center = coords ?? UCSD_DEFAULT;

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent
        centerCoordinate={[center.longitude, center.latitude]}
        zoomLevel={15}
      />

      {loading && (
        <View className="absolute top-1/2 left-1/2 -translate-x-4 -translate-y-4">
          <ActivityIndicator color={Colors.accent} />
        </View>
      )}

      {/* Top bar — greeting left, settings right */}
      <SafeAreaView className="absolute top-0 left-0 right-0" edges={["top"]}>
        <View className="flex-row items-center justify-between px-4 mt-2">
          {firstName ? (
            <View className="bg-surface/90 rounded-2xl px-4 py-2">
              <Text className="text-text-muted text-xs">Welcome back</Text>
              <Text className="text-white font-bold text-base leading-tight">
                Hello, {firstName} 👋
              </Text>
            </View>
          ) : (
            <View />
          )}

          <Pressable
            className="bg-surface rounded-xl p-3"
            onPress={() => router.push("/settings")}
          >
            <Settings size={20} color={Colors.textPrimary} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View className="absolute bottom-8 left-4 right-4">
        <Pressable
          className="bg-surface rounded-2xl px-4 py-4 flex-row items-center gap-3"
          onPress={() => router.push("/search")}
        >
          <Search size={20} color={Colors.textMuted} />
          <Text className="text-text-muted text-base">Where are you heading?</Text>
        </Pressable>
      </View>
    </View>
  );
}
