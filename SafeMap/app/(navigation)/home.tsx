import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent />
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
