import React from "react";
import { View, Text, Switch } from "react-native";
import { Colors } from "@/constants/colors";

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onToggle: (val: boolean) => void;
};

export default function ToggleRow({ label, description, value, onToggle }: Props) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-1 mr-4">
        <Text className="text-white text-base">{label}</Text>
        {description && (
          <Text className="text-text-muted text-sm mt-1">{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.input, true: Colors.accent }}
        thumbColor="#ffffff"
      />
    </View>
  );
}
