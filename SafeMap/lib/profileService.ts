import AsyncStorage from "@react-native-async-storage/async-storage";
// import { supabase } from "./supabase"; // uncomment when Supabase is wired up

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

// ---------------------------------------------------------------------------
// Local storage (active now)
// ---------------------------------------------------------------------------

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));

  // ---------------------------------------------------------------------------
  // Supabase (wire up when ready)
  // ---------------------------------------------------------------------------
  // if (supabase) {
  //   const { error } = await supabase
  //     .from("profiles")
  //     .upsert({ ...profile, updated_at: new Date().toISOString() });
  //   if (error) throw error;
  // }
}

export async function loadProfile(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as UserProfile;
}

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
