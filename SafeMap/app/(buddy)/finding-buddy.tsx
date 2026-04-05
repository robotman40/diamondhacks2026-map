import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function FindingBuddy() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    const timeout = setTimeout(() => {
      router.replace("/buddy-found");
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View className="w-20 h-20 rounded-full bg-surface items-center justify-center">
            <Users size={36} color={Colors.accent} />
          </View>
        </Animated.View>
        <Text className="text-white text-xl font-bold mt-6 text-center">
          Finding a Buddy...
        </Text>
        <Text className="text-text-muted text-sm mt-2 text-center">
          Searching for verified students heading the same direction
        </Text>
        <View className="w-48 h-1.5 bg-surface rounded-full mt-8 overflow-hidden">
          <Animated.View
            className="h-full bg-accent rounded-full"
            style={{ width: progressWidth }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
