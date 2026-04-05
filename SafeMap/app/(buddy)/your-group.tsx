import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import BuddyCard from "@/components/BuddyCard";

const groupMembers = [
  { name: "Alex M. (Psych)", subtitle: "Walking to: Library" },
  { name: "Jamie S.", subtitle: "2 min away" },
];

export default function YourGroup() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 flex-1">
        <View className="flex-row items-center justify-between mt-4">
          <Text className="text-white text-xl font-bold">Your Group</Text>
          <Pressable onPress={() => router.back()}>
            <X size={24} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View className="gap-3 mt-6">
          {groupMembers.map((member) => (
            <BuddyCard
              key={member.name}
              name={member.name}
              subtitle={member.subtitle}
            />
          ))}
        </View>
      </View>

      <View className="px-4 pb-4">
        <Text className="text-text-muted text-xs text-center mb-3">
          You & your buddies will be notified when leaving
        </Text>
        <Pressable
          className="bg-danger rounded-xl py-4 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold text-base">Leave Group</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
