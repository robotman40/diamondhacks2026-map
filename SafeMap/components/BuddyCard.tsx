import React from "react";
import { View, Text } from "react-native";
import { User } from "lucide-react-native";
import { Colors } from "@/constants/colors";

type Props = {
  name: string;
  subtitle: string;
};

export default function BuddyCard({ name, subtitle }: Props) {
  return (
    <View className="flex-row items-center bg-surface rounded-xl p-3 gap-3">
      <View className="w-10 h-10 rounded-full bg-input items-center justify-center">
        <User size={20} color={Colors.textMuted} />
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{name}</Text>
        <Text className="text-text-muted text-sm">{subtitle}</Text>
      </View>
    </View>
  );
}
