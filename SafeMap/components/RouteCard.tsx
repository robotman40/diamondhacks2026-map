import React from "react";
import { View, Text } from "react-native";

type Stat = { label: string; value: string };

type Props = {
  title: string;
  subtitle: string;
  stats?: Stat[];
};

export default function RouteCard({ title, subtitle, stats }: Props) {
  return (
    <View className="bg-surface rounded-2xl p-4">
      <Text className="text-white font-bold text-lg">{title}</Text>
      <Text className="text-text-muted text-sm mt-1">{subtitle}</Text>
      {stats && stats.length > 0 && (
        <View className="flex-row mt-4 justify-between">
          {stats.map((s) => (
            <View key={s.label} className="items-center">
              <Text className="text-white font-bold text-lg">{s.value}</Text>
              <Text className="text-text-muted text-xs">{s.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
