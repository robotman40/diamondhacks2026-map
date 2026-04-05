import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserCheck } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import BuddyCard from "@/components/BuddyCard";

export default function BuddyFound() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    destName?: string;
    destLat?: string;
    destLng?: string;
  }>();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <View className="w-20 h-20 rounded-full bg-surface items-center justify-center">
          <UserCheck size={36} color={Colors.accent} />
        </View>
        <Text className="text-white text-2xl font-bold mt-6 text-center">
          Buddy Found!
        </Text>

        <View className="w-full mt-6">
          <BuddyCard
            name="Jamie S."
            subtitle={`Walking to: ${params.destName ?? "Destination"}`}
          />
        </View>

        <Text className="text-text-muted text-sm mt-4">
          Starting navigation...
        </Text>
      </View>

      <View className="px-4 pb-4">
        <Pressable
          className="bg-accent rounded-xl py-4 items-center"
          onPress={() =>
            router.push({
              pathname: "/route-map-buddy",
              params: {
                destName: params.destName,
                destLat: params.destLat,
                destLng: params.destLng,
              },
            })
          }
        >
          <Text className="text-background font-bold text-base">
            Start Navigation
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
