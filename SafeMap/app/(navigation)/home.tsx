import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Settings } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent />

      <SafeAreaView
        className="absolute top-0 right-0"
        edges={["top"]}
      >
        <Pressable
          className="bg-surface rounded-xl p-3 mr-4 mt-2"
          onPress={() => router.push("/settings")}
        >
          <Settings size={20} color={Colors.textPrimary} />
        </Pressable>
      </SafeAreaView>

      <View className="absolute bottom-8 left-4 right-4">
        <Pressable
          className="bg-surface rounded-2xl px-4 py-4 flex-row items-center gap-3"
          onPress={() => router.push("/search")}
        >
          <Search size={20} color={Colors.textMuted} />
          <Text className="text-text-muted text-base">
            Where are you heading?
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
