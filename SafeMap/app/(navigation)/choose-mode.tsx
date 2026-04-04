import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Users,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function ChooseMode() {
  const router = useRouter();

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
          <Text className="text-text-muted text-sm font-semibold mb-3">
            Route
          </Text>
          <View className="bg-surface rounded-2xl p-4">
            <View className="flex-row items-center gap-3">
              <MapPin size={16} color={Colors.accent} />
              <Text className="text-white text-sm">Current Location</Text>
            </View>
            <View className="ml-2 border-l border-dashed border-text-muted h-6 my-1" />
            <View className="flex-row items-center gap-3">
              <MapPin size={16} color={Colors.danger} />
              <Text className="text-white text-sm">Campus Library</Text>
            </View>
            <Text className="text-text-muted text-xs mt-2 ml-7">
              ~10 min walk
            </Text>
          </View>
        </View>

        <View className="gap-4 mt-6">
          <Pressable
            className="bg-surface rounded-2xl p-4"
            onPress={() => router.push("/route-map")}
          >
            <AlertTriangle size={24} color="#f59e0b" />
            <Text className="text-white font-bold text-lg mt-3">
              Guided Solo
            </Text>
            <Text className="text-text-muted text-sm mt-1">
              Follow the safest route with real-time alerts. Best for confident,
              solo walkers.
            </Text>
          </Pressable>

          <Pressable
            className="bg-surface rounded-2xl p-4"
            onPress={() => router.push("/finding-buddy")}
          >
            <Users size={24} color={Colors.accent} />
            <Text className="text-white font-bold text-lg mt-3">
              Request Buddy
            </Text>
            <Text className="text-text-muted text-sm mt-1">
              Get paired with a verified student heading the same direction.
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-row gap-3 px-4 pb-4">
        <Pressable
          className="flex-1 bg-surface rounded-xl py-4 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">End Route</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-accent rounded-xl py-4 items-center"
          onPress={() => {}}
        >
          <Text className="text-background font-semibold">Update GPS</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
