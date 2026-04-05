import AsyncStorage from "@react-native-async-storage/async-storage";

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
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

// ── Load ──────────────────────────────────────────────────────────────────────

export async function loadProfile(): Promise<UserProfile | null> {
  // Try Supabase first so we get the latest cross-device state
  try {
    const local = await AsyncStorage.getItem(PROFILE_KEY);
    const localProfile: UserProfile | null = local ? JSON.parse(local) : null;

    return localProfile;
  } catch {
    return null;
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
