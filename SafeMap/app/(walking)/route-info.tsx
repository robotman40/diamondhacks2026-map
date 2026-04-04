import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Shield, MapPin, Lightbulb } from "lucide-react-native";
import { Colors } from "@/constants/colors";

const checkpoints = [
  { id: "1", name: "Well-lit Walkway", icon: Lightbulb },
  { id: "2", name: "Emergency Phone Station", icon: Shield },
  { id: "3", name: "Security Camera Zone", icon: Shield },
  { id: "4", name: "Campus Library Entrance", icon: MapPin },
];

export default function RouteInfo() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 flex-1">
        <View className="flex-row items-center gap-3 mt-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text className="text-white text-xl font-bold">Route Info</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="mt-6">
          <View className="bg-surface rounded-2xl p-4">
            <View className="flex-row items-center gap-2">
              <Shield size={20} color={Colors.accent} />
              <Text className="text-accent font-bold text-lg">92% Safety Score</Text>
            </View>
            <Text className="text-text-muted text-sm mt-2">
              This route follows well-lit paths with active security camera
              coverage and multiple emergency stations along the way.
            </Text>
          </View>

          <Text className="text-text-muted text-sm font-semibold mt-6 mb-3">
            Checkpoints
          </Text>
          <View className="gap-3">
            {checkpoints.map((cp) => (
              <View
                key={cp.id}
                className="bg-surface rounded-xl p-4 flex-row items-center gap-3"
              >
                <cp.icon size={18} color={Colors.accent} />
                <Text className="text-white text-base">{cp.name}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row justify-between mt-6 bg-surface rounded-2xl p-4">
            <View className="items-center">
              <Text className="text-white font-bold text-lg">0.6 mi</Text>
              <Text className="text-text-muted text-xs">Distance</Text>
            </View>
            <View className="items-center">
              <Text className="text-white font-bold text-lg">10 min</Text>
              <Text className="text-text-muted text-xs">Est. Time</Text>
            </View>
            <View className="items-center">
              <Text className="text-white font-bold text-lg">4</Text>
              <Text className="text-text-muted text-xs">Checkpoints</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
