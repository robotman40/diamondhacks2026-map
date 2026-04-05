import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User, Pencil } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import ToggleRow from "@/components/ToggleRow";

export default function Settings() {
  const router = useRouter();
  const [buddyNotify, setBuddyNotify] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 mt-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text className="text-white text-xl font-bold">
            Settings & Profile
          </Text>
        </View>

        <View className="items-center mt-6">
          <View className="w-20 h-20 rounded-full bg-surface items-center justify-center">
            <User size={28} color={Colors.textMuted} />
          </View>
          <View className="absolute right-1/2 mr-[-48px] mt-16 bg-accent rounded-full w-7 h-7 items-center justify-center">
            <Pencil size={14} color={Colors.background} />
          </View>
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-8 mb-3">
          Profile Details
        </Text>
        <View className="gap-3">
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Display Name"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Alex Martinez"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Title / Department"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Psychology"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            defaultValue="alex@university.edu"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Phone"
            placeholderTextColor={Colors.textMuted}
            defaultValue="(555) 123-4567"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Campus"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Student University - Main Campus"
          />
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-8 mb-3">
          Emergency Contact
        </Text>
        <View className="gap-3">
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Contact Name"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Jane Martinez"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Phone"
            placeholderTextColor={Colors.textMuted}
            defaultValue="(816) 555-1990"
          />
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-8 mb-1">
          Notification Preferences
        </Text>
        <ToggleRow
          label="Notify when buddy joins you"
          description="Get a push notification when a buddy starts walking with you"
          value={buddyNotify}
          onToggle={setBuddyNotify}
        />
        <ToggleRow
          label="Notify me of safety alerts near my location"
          description="Receive alerts about incidents near your current location"
          value={safetyAlerts}
          onToggle={setSafetyAlerts}
        />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
