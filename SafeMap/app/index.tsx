import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShieldCheck, ArrowRight } from "lucide-react-native";
import { Text, Pressable } from "react-native";
import { Colors } from "@/constants/colors";
import { isProfileComplete } from "@/lib/profileService";

export default function Welcome() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    isProfileComplete().then((complete) => {
      if (complete) {
        router.replace("/home");
      } else {
        setChecking(false);
      }
    });
  }, []);

  if (checking) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <ShieldCheck size={48} color={Colors.accent} />
        <Text className="text-white text-3xl font-bold mt-6 text-center">
          Welcome to CampusSafe
        </Text>
        <Text className="text-text-muted text-sm mt-2 text-center">
          A safer community for your campus walking
        </Text>
      </View>
      <View className="px-4 pb-4">
        <Pressable
          className="bg-accent rounded-xl py-4 flex-row items-center justify-center gap-2"
          onPress={() => router.push("/profile-setup")}
        >
          <Text className="text-background font-bold text-base">
            Start with CampusSafe ID
          </Text>
          <ArrowRight size={20} color={Colors.background} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
