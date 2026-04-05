import React from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Camera, User } from "lucide-react-native";
import { Colors } from "@/constants/colors";

type Props = {
  uri?: string | null;
  size?: number;
  /** If provided, tapping the avatar triggers this callback (edit mode) */
  onPress?: () => void;
};

export default function ProfileAvatar({ uri, size = 80, onPress }: Props) {
  const iconSize = Math.round(size * 0.35);
  const badgeSize = Math.round(size * 0.3);

  const avatar = (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className="bg-surface items-center justify-center overflow-hidden"
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: size, height: size }}
          contentFit="cover"
        />
      ) : (
        <User size={iconSize} color={Colors.textMuted} />
      )}
    </View>
  );

  if (!onPress) return avatar;

  return (
    <Pressable onPress={onPress} className="relative">
      {avatar}
      {/* Camera badge */}
      <View
        style={{ width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }}
        className="absolute bottom-0 right-0 bg-accent items-center justify-center"
      >
        <Camera size={Math.round(badgeSize * 0.55)} color={Colors.background} />
      </View>
    </Pressable>
  );
}
