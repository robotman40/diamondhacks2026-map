import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X, UserCheck } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import BuddyCard from "@/components/BuddyCard";
import { loadProfile } from "@/lib/profileService";

const otherMembers = [
  { name: "Alex M. (Psych)", subtitle: "2 min away" },
  { name: "Jamie S.", subtitle: "En route to meet you" },
];

export default function YourGroup() {
  const router = useRouter();
  const params = useLocalSearchParams<{ destName?: string }>();
  const [selfName, setSelfName] = useState("You");

  useEffect(() => {
    loadProfile().then((p) => {
      if (p?.displayName) setSelfName(p.displayName);
    });
  }, []);

  const destName = params.destName ?? "Destination";

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 flex-1">
        <View className="flex-row items-center justify-between mt-4">
          <View>
            <Text className="text-white text-xl font-bold">Your Group</Text>
            <Text className="text-text-muted text-xs mt-0.5">Walking to: {destName}</Text>
          </View>
          <Pressable onPress={() => router.back()}>
            <X size={24} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View className="gap-3 mt-6">
          {/* Self */}
          <View className="bg-surface rounded-2xl px-4 py-3 flex-row items-center gap-3">
            <View className="w-9 h-9 rounded-full bg-accent/20 items-center justify-center">
              <UserCheck size={18} color={Colors.accent} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">{selfName}</Text>
              <Text className="text-accent text-xs">You · Group leader</Text>
            </View>
          </View>

          {/* Others */}
          {otherMembers.map((member) => (
            <BuddyCard key={member.name} name={member.name} subtitle={member.subtitle} />
          ))}
        </View>
      </View>

      <View className="px-4 pb-4 gap-3">
        <Text className="text-text-muted text-xs text-center">
          You & your buddies will be notified when leaving
        </Text>
        <Pressable
          className="bg-surface border border-surface rounded-xl py-4 items-center"
          onPress={() =>
            router.push({
              pathname: "/walking-solo",
              params: { destName: params.destName },
            })
          }
        >
          <Text className="text-white font-semibold text-base">Switch to Solo Mode</Text>
        </Pressable>
        <Pressable
          className="bg-danger rounded-xl py-4 items-center"
          onPress={() =>
            Alert.alert(
              "Leave Group",
              "Leaving the group will end your current route. Are you sure?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Leave Group",
                  style: "destructive",
                  onPress: () => router.replace("/home"),
                },
              ]
            )
          }
        >
          <Text className="text-white font-bold text-base">Leave Group</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
