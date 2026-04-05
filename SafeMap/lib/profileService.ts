import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "./supabase";

const PROFILE_KEY = "@campussafe/profile";

export type UserProfile = {
  displayName: string;
  email: string;
  phone: string;
  department?: string;
  campus?: string;
  emergencyName: string;
  emergencyContact: string;
  photoUri?: string;
};

// ── Save ─────────────────────────────────────────────────────────────────────

export async function saveProfile(profile: UserProfile): Promise<void> {
  // Always write to local storage first so the app works offline
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  // Sync to Supabase (best-effort — failures don't throw)
  try {
    const { error } = await supabase.from("profiles").upsert({
      email: profile.email,
      display_name: profile.displayName,
      phone: profile.phone,
      department: profile.department ?? null,
      campus: profile.campus ?? null,
      emergency_name: profile.emergencyName,
      emergency_contact: profile.emergencyContact,
      photo_uri: profile.photoUri ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) console.warn("[profileService] Supabase upsert failed:", error.message);
  } catch (err) {
    console.warn("[profileService] Supabase unreachable:", err);
  }
}

// ── Load ──────────────────────────────────────────────────────────────────────

export async function loadProfile(): Promise<UserProfile | null> {
  // Try Supabase first so we get the latest cross-device state
  try {
    const local = await AsyncStorage.getItem(PROFILE_KEY);
    const localProfile: UserProfile | null = local ? JSON.parse(local) : null;

    if (localProfile?.email) {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", localProfile.email)
        .single();

      if (!error && data) {
        const remote: UserProfile = {
          displayName: data.display_name,
          email: data.email,
          phone: data.phone,
          department: data.department ?? undefined,
          campus: data.campus ?? undefined,
          emergencyName: data.emergency_name,
          emergencyContact: data.emergency_contact,
          photoUri: data.photo_uri ?? undefined,
        };
        // Keep local cache in sync
        await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(remote));
        return remote;
      }
    }

    return localProfile;
  } catch {
    // Network unavailable — fall back to local
    const raw = await AsyncStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export async function isProfileComplete(): Promise<boolean> {
  const profile = await loadProfile();
  if (!profile) return false;
  return (
    profile.displayName.trim().length > 0 &&
    profile.email.trim().length > 0 &&
    profile.phone.trim().length > 0 &&
    profile.emergencyName.trim().length > 0 &&
    profile.emergencyContact.trim().length > 0
  );
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}
