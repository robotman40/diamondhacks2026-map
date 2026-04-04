import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";
import BuddyCard from "@/components/BuddyCard";

const sampleRoute: [number, number][] = [
  [-117.2375, 32.8785],
  [-117.2365, 32.8790],
  [-117.2355, 32.8800],
  [-117.2345, 32.8810],
  [-117.2340, 32.8820],
];

export default function WalkingSolo() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent showRoute routeCoordinates={sampleRoute} />

      <SafeAreaView className="absolute top-0 left-0 right-0" edges={["top"]}>
        <View className="px-4 mt-2">
          <Text className="text-white text-lg font-bold">Walking Solo</Text>
        </View>
        <View className="flex-row gap-3 px-4 mt-3">
          <Pressable
            className="bg-surface rounded-xl px-4 py-2"
            onPress={() => router.push("/walk-completed")}
          >
            <Text className="text-white font-semibold text-sm">End Route</Text>
          </Pressable>
          <Pressable
            className="bg-accent rounded-xl px-4 py-2"
            onPress={() => router.push("/finding-buddy")}
          >
            <Text className="text-background font-semibold text-sm">
              Switch to Buddy Mode
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <View className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-4 pb-8">
        <BuddyCard name="Alex M. (Psych)" subtitle="Walking to: Library" />
        <Text className="text-text-muted text-sm mt-3 text-center">
          Need company?
        </Text>
        <Pressable
          className="bg-accent rounded-xl py-4 items-center mt-3"
          onPress={() => router.push("/finding-buddy")}
        >
          <Text className="text-background font-bold text-base">
            Switch to Buddy Mode
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
