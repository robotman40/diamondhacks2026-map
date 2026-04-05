import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import ToggleRow from "@/components/ToggleRow";

export default function EmergencySettings() {
  const router = useRouter();
  const [walkStarts, setWalkStarts] = useState(true);
  const [routeArrival, setRouteArrival] = useState(true);
  const [safeTypes, setSafeTypes] = useState(false);
  const [defaultCheckin, setDefaultCheckin] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 mt-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text className="text-white text-xl font-bold">
            Emergency Settings
          </Text>
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-6 mb-3">
          Privacy
        </Text>
        <Pressable className="bg-input rounded-xl px-4 h-12 flex-row items-center justify-between">
          <Text className="text-white text-base">
            Share w/ Contacts + Main Campus
          </Text>
          <ChevronDown size={18} color={Colors.textMuted} />
        </Pressable>

        <Text className="text-text-muted text-sm font-semibold mt-6 mb-3">
          Emergency Contact
        </Text>
        <View className="gap-3">
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="First Name"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Jane"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Last Name"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Martinez"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Phone"
            placeholderTextColor={Colors.textMuted}
            defaultValue="(816) 555-1990"
            keyboardType="phone-pad"
          />
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-6 mb-1">
          Emergency Contact Permissions
        </Text>
        <ToggleRow
          label="Notify when walk starts"
          value={walkStarts}
          onToggle={setWalkStarts}
        />
        <ToggleRow
          label="Notify on route arrival"
          value={routeArrival}
          onToggle={setRouteArrival}
        />
        <ToggleRow
          label="Notify on safe types"
          value={safeTypes}
          onToggle={setSafeTypes}
        />
        <ToggleRow
          label="Receive default check-in"
          value={defaultCheckin}
          onToggle={setDefaultCheckin}
        />
        <View className="h-8" />
      </ScrollView>

      <View className="px-4 pb-4">
        <Pressable
          className="bg-danger rounded-xl py-4 items-center"
          onPress={() => {}}
        >
          <Text className="text-white font-bold text-base">In Trip Use</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
