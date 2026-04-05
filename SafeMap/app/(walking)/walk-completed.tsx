import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function WalkCompleted() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 items-center justify-center">
        <CheckCircle size={64} color={Colors.accent} />
        <Text className="text-white text-2xl font-bold mt-6 text-center">
          Walk Completed
        </Text>
        <Text className="text-text-muted text-sm mt-2 text-center">
          You've safely arrived at your destination!
        </Text>

        <View className="bg-surface rounded-2xl p-4 mt-8 w-full">
          <Text className="text-text-muted text-sm font-semibold mb-3">
            Walking Details
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-text-muted text-sm">Walking buddy</Text>
              <Text className="text-white text-sm">Alex M. (Psych)</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-text-muted text-sm">Checkpoints</Text>
              <Text className="text-white text-sm">4 visited</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mt-6 w-full bg-surface rounded-2xl p-4">
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">0.6 mi</Text>
            <Text className="text-text-muted text-xs">Distance</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">11 min</Text>
            <Text className="text-text-muted text-xs">Time</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">42</Text>
            <Text className="text-text-muted text-xs">Calories</Text>
          </View>
        </View>
      </View>

      <View className="px-4 pb-4">
        <Pressable
          className="bg-accent rounded-xl py-4 items-center"
          onPress={() => router.push("/home")}
        >
          <Text className="text-background font-bold text-base">
            Back to Home
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
