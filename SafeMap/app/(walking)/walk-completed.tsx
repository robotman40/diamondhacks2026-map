import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { formatDistance, formatDuration } from "@/lib/routeService";

export default function WalkCompleted() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    distance?: string;
    time?: string;
    buddies?: string;
  }>();

  const distanceDisplay = params.distance
    ? formatDistance(parseFloat(params.distance))
    : "—";
  const timeDisplay = params.time
    ? formatDuration(parseFloat(params.time))
    : "—";
  const buddyList = params.buddies ? params.buddies.split(",") : [];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 items-center justify-center">
        <CheckCircle size={64} color={Colors.accent} />
        <Text className="text-white text-2xl font-bold mt-6 text-center">
          Walk Completed
        </Text>
        <Text className="text-text-muted text-sm mt-2 text-center">
          {buddyList.length > 0
            ? `You safely arrived with ${buddyList.join(" & ")}!`
            : "You've safely arrived at your destination!"}
        </Text>

        <View className="flex-row justify-between mt-8 w-full bg-surface rounded-2xl p-4">
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">{distanceDisplay}</Text>
            <Text className="text-text-muted text-xs">Distance</Text>
          </View>
          <View className="w-px bg-background mx-2" />
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">{timeDisplay}</Text>
            <Text className="text-text-muted text-xs">Time</Text>
          </View>
        </View>
      </View>

      <View className="px-4 pb-4">
        <Pressable
          className="bg-accent rounded-xl py-4 items-center"
          onPress={() => router.replace("/home")}
        >
          <Text className="text-background font-bold text-base">Back to Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
