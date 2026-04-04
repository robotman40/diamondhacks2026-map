import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, Check } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function ProfileSetup() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mt-6">
          Set Up Your Profile
        </Text>
        <Text className="text-text-muted text-sm mt-2">
          Fill in details to help your walking buddies connect with you
        </Text>

        <View className="items-center mt-6">
          <View className="w-20 h-20 rounded-full bg-surface items-center justify-center">
            <Camera size={28} color={Colors.textMuted} />
          </View>
          <Text className="text-text-muted text-xs mt-2">Add Photo</Text>
        </View>

        <View className="gap-4 mt-6">
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Display Name"
            placeholderTextColor={Colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="alex@university.edu"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Phone number"
            placeholderTextColor={Colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-8 mb-4">
          Emergency Contact
        </Text>
        <View className="gap-4">
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Emergency contact name"
            placeholderTextColor={Colors.textMuted}
            value={emergencyName}
            onChangeText={setEmergencyName}
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Phone number or email"
            placeholderTextColor={Colors.textMuted}
            value={emergencyContact}
            onChangeText={setEmergencyContact}
          />
        </View>
      </ScrollView>

      <View className="px-4 pb-4">
        <Pressable
          className="bg-accent rounded-xl py-4 flex-row items-center justify-center gap-2"
          onPress={() => router.push("/home")}
        >
          <Text className="text-background font-bold text-base">
            Complete Setup
          </Text>
          <Check size={20} color={Colors.background} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
