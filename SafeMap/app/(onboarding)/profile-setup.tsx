import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, Check } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { saveProfile } from "@/lib/profileService";

type FieldErrors = {
  displayName?: string;
  email?: string;
  phone?: string;
  emergencyName?: string;
  emergencyContact?: string;
};

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function ProfileSetup() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [campus, setCampus] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!displayName.trim()) next.displayName = "Required";
    if (!email.trim()) {
      next.email = "Required";
    } else if (!validateEmail(email)) {
      next.email = "Enter a valid email address";
    }
    if (!phone.trim()) next.phone = "Required";
    if (!emergencyName.trim()) next.emergencyName = "Required";
    if (!emergencyContact.trim()) next.emergencyContact = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleComplete() {
    if (!validate()) return;
    setSaving(true);
    try {
      await saveProfile({ displayName, email, phone, department, campus, emergencyName, emergencyContact });
      router.replace("/home");
    } catch {
      Alert.alert("Error", "Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const isReady =
    displayName.trim() &&
    email.trim() &&
    phone.trim() &&
    emergencyName.trim() &&
    emergencyContact.trim();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text className="text-white text-2xl font-bold mt-6">Set Up Your Profile</Text>
          <Text className="text-text-muted text-sm mt-2">
            Fill in details to help your walking buddies connect with you
          </Text>

          <View className="items-center mt-6">
            <View className="w-20 h-20 rounded-full bg-surface items-center justify-center">
              <Camera size={28} color={Colors.textMuted} />
            </View>
            <Text className="text-text-muted text-xs mt-2">Add Photo</Text>
          </View>

          <Text className="text-text-muted text-sm font-semibold mt-8 mb-4">Personal Info</Text>
          <View className="gap-4">
            <View>
              <TextInput
                className={`bg-input text-white rounded-xl px-4 h-12 text-base ${errors.displayName ? "border border-danger" : ""}`}
                placeholder="Display Name *"
                placeholderTextColor={Colors.textMuted}
                value={displayName}
                onChangeText={(v) => { setDisplayName(v); setErrors((e) => ({ ...e, displayName: undefined })); }}
              />
              {errors.displayName && <Text className="text-danger text-xs mt-1 ml-1">{errors.displayName}</Text>}
            </View>

            <View>
              <TextInput
                className={`bg-input text-white rounded-xl px-4 h-12 text-base ${errors.email ? "border border-danger" : ""}`}
                placeholder="Email (e.g. triton@ucsd.edu) *"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: undefined })); }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email && <Text className="text-danger text-xs mt-1 ml-1">{errors.email}</Text>}
            </View>

            <View>
              <TextInput
                className={`bg-input text-white rounded-xl px-4 h-12 text-base ${errors.phone ? "border border-danger" : ""}`}
                placeholder="Phone number *"
                placeholderTextColor={Colors.textMuted}
                value={phone}
                onChangeText={(v) => { setPhone(v); setErrors((e) => ({ ...e, phone: undefined })); }}
                keyboardType="phone-pad"
              />
              {errors.phone && <Text className="text-danger text-xs mt-1 ml-1">{errors.phone}</Text>}
            </View>

            <TextInput
              className="bg-input text-white rounded-xl px-4 h-12 text-base"
              placeholder="Department / Major (optional)"
              placeholderTextColor={Colors.textMuted}
              value={department}
              onChangeText={setDepartment}
            />

            <TextInput
              className="bg-input text-white rounded-xl px-4 h-12 text-base"
              placeholder="Campus (optional)"
              placeholderTextColor={Colors.textMuted}
              value={campus}
              onChangeText={setCampus}
            />
          </View>

          <Text className="text-text-muted text-sm font-semibold mt-8 mb-4">Emergency Contact</Text>
          <View className="gap-4">
            <View>
              <TextInput
                className={`bg-input text-white rounded-xl px-4 h-12 text-base ${errors.emergencyName ? "border border-danger" : ""}`}
                placeholder="Emergency contact name *"
                placeholderTextColor={Colors.textMuted}
                value={emergencyName}
                onChangeText={(v) => { setEmergencyName(v); setErrors((e) => ({ ...e, emergencyName: undefined })); }}
              />
              {errors.emergencyName && <Text className="text-danger text-xs mt-1 ml-1">{errors.emergencyName}</Text>}
            </View>

            <View>
              <TextInput
                className={`bg-input text-white rounded-xl px-4 h-12 text-base ${errors.emergencyContact ? "border border-danger" : ""}`}
                placeholder="Phone number or email *"
                placeholderTextColor={Colors.textMuted}
                value={emergencyContact}
                onChangeText={(v) => { setEmergencyContact(v); setErrors((e) => ({ ...e, emergencyContact: undefined })); }}
              />
              {errors.emergencyContact && <Text className="text-danger text-xs mt-1 ml-1">{errors.emergencyContact}</Text>}
            </View>
          </View>

          <View className="h-8" />

          <View className="px-4 pb-4">
            <Pressable
              className={`rounded-xl py-4 flex-row items-center justify-center gap-2 ${isReady ? "bg-accent" : "bg-surface"}`}
              onPress={handleComplete}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.background} />
              ) : (
                <>
                  <Text className={`font-bold text-base ${isReady ? "text-background" : "text-text-muted"}`}>
                    Complete Setup
                  </Text>
                  {isReady && <Check size={20} color={Colors.background} />}
                </>
              )}
              </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
