import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Pencil, Check, X, LogOut } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import ToggleRow from "@/components/ToggleRow";
import { loadProfile, saveProfile, clearProfile, UserProfile } from "@/lib/profileService";
import ProfileAvatar from "@/components/ProfileAvatar";
import { pickProfilePhoto } from "@/hooks/usePhotoPicker";

export default function Settings() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [draft, setDraft] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [buddyNotify, setBuddyNotify] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);

  useEffect(() => {
    loadProfile().then((p) => {
      if (p) { setProfile(p); setDraft(p); }
    });
  }, []);

  function startEditing() {
    setDraft(profile ? { ...profile } : null);
    setEditing(true);
  }

  function cancelEditing() {
    setDraft(profile ? { ...profile } : null);
    setEditing(false);
  }

  async function saveEdits() {
    if (!draft) return;
    if (!draft.displayName.trim() || !draft.email.trim() || !draft.phone.trim()) {
      Alert.alert("Required fields", "Display name, email and phone cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await saveProfile(draft);
      setProfile(draft);
      setEditing(false);
    } catch {
      Alert.alert("Error", "Could not save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleSignOut() {
    Alert.alert(
      "Sign Out",
      "This will clear your saved profile and return you to the welcome screen.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await clearProfile();
            router.replace("/");
          },
        },
      ]
    );
  }

  function field(key: keyof UserProfile) {
    return draft?.[key] ?? "";
  }

  function setField(key: keyof UserProfile, value: string) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  const inputClass = (editable: boolean) =>
    `rounded-xl px-4 h-12 text-base ${editable ? "bg-input text-white" : "bg-surface text-text-muted"}`;

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator color={Colors.accent} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="flex-row items-center justify-between mt-4">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => router.back()}>
              <ArrowLeft size={24} color={Colors.textPrimary} />
            </Pressable>
            <Text className="text-white text-xl font-bold">Settings & Profile</Text>
          </View>

          {editing ? (
            <View className="flex-row gap-2">
              <Pressable
                className="bg-surface rounded-xl px-3 py-2 flex-row items-center gap-1"
                onPress={cancelEditing}
              >
                <X size={16} color={Colors.textMuted} />
                <Text className="text-text-muted text-sm">Cancel</Text>
              </Pressable>
              <Pressable
                className="bg-accent rounded-xl px-3 py-2 flex-row items-center gap-1"
                onPress={saveEdits}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.background} />
                ) : (
                  <>
                    <Check size={16} color={Colors.background} />
                    <Text className="text-background text-sm font-bold">Save</Text>
                  </>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable
              className="bg-surface rounded-xl px-3 py-2 flex-row items-center gap-2"
              onPress={startEditing}
            >
              <Pencil size={16} color={Colors.accent} />
              <Text className="text-accent text-sm font-semibold">Edit</Text>
            </Pressable>
          )}
        </View>

        {/* Avatar */}
        <View className="items-center mt-6">
          <ProfileAvatar
            uri={draft?.photoUri}
            size={80}
            onPress={editing ? async () => {
              const uri = await pickProfilePhoto();
              if (uri) setDraft((d) => d ? { ...d, photoUri: uri } : d);
            } : undefined}
          />
          {editing && (
            <Text className="text-text-muted text-xs mt-2">{draft?.photoUri ? "Tap to change photo" : "Add Photo"}</Text>
          )}
          <Text className="text-white font-bold text-lg mt-2">{profile.displayName}</Text>
          <Text className="text-text-muted text-sm">{profile.email}</Text>
          {profile.department ? (
            <Text className="text-text-muted text-xs mt-0.5">{profile.department}{profile.campus ? ` · ${profile.campus}` : ""}</Text>
          ) : null}
        </View>

        {/* Profile fields */}
        <Text className="text-text-muted text-sm font-semibold mt-8 mb-3">Profile Details</Text>
        <View className="gap-3">
          <TextInput
            className={inputClass(editing)}
            placeholder="Display Name"
            placeholderTextColor={Colors.textMuted}
            value={field("displayName")}
            onChangeText={(v) => setField("displayName", v)}
            editable={editing}
          />
          <TextInput
            className={inputClass(editing)}
            placeholder="Department / Major"
            placeholderTextColor={Colors.textMuted}
            value={field("department")}
            onChangeText={(v) => setField("department", v)}
            editable={editing}
          />
          <TextInput
            className={inputClass(editing)}
            placeholder="Campus"
            placeholderTextColor={Colors.textMuted}
            value={field("campus")}
            onChangeText={(v) => setField("campus", v)}
            editable={editing}
          />
          <TextInput
            className={inputClass(editing)}
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            value={field("email")}
            onChangeText={(v) => setField("email", v)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={editing}
          />
          <TextInput
            className={inputClass(editing)}
            placeholder="Phone"
            placeholderTextColor={Colors.textMuted}
            value={field("phone")}
            onChangeText={(v) => setField("phone", v)}
            keyboardType="phone-pad"
            editable={editing}
          />
        </View>

        {/* Emergency contact */}
        <Text className="text-text-muted text-sm font-semibold mt-8 mb-3">Emergency Contact</Text>
        <View className="gap-3">
          <TextInput
            className={inputClass(editing)}
            placeholder="Contact Name"
            placeholderTextColor={Colors.textMuted}
            value={field("emergencyName")}
            onChangeText={(v) => setField("emergencyName", v)}
            editable={editing}
          />
          <TextInput
            className={inputClass(editing)}
            placeholder="Phone or Email"
            placeholderTextColor={Colors.textMuted}
            value={field("emergencyContact")}
            onChangeText={(v) => setField("emergencyContact", v)}
            editable={editing}
          />
        </View>

        {/* Notifications */}
        <Text className="text-text-muted text-sm font-semibold mt-8 mb-1">Notification Preferences</Text>
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

        {/* Sign out */}
        <View className="mt-8 mb-4">
          <Pressable
            className="flex-row items-center justify-center gap-2 border border-danger rounded-xl py-4"
            onPress={handleSignOut}
          >
            <LogOut size={18} color={Colors.danger} />
            <Text className="text-danger font-semibold text-base">Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
