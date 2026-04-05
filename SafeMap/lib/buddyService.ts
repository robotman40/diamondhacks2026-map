import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://147.135.115.199:8000";
const USER_ID_KEY = "@campussafe/user_id";

// ── Types ────────────────────────────────────────────────────────────────────

export type BuddyMatchRequest = {
  user_id: string;
  start_lat: number;
  start_lon: number;
  dest_lat: number;
  dest_lon: number;
  travel_time: string; // ISO 8601
  safety_preference?: "solo" | "buddy_preferred" | "buddy_required";
};

export type BuddyMatchResponse = {
  success: boolean;
  message: string;
  group_id: string | null;
  buddy_user_ids: string[] | null;
  status: "matched" | "waiting_for_match";
};

export type BuddyGroup = {
  user_id: string;
  status: "not_in_group" | "in_group";
  group_id?: string;
  buddy_count?: number;
  total_users?: number;
  buddy_user_ids?: string[];
};

export type MeetingPoint = {
  user_id: string;
  meeting_point?: unknown;
  status?: string;
  message?: string;
};

// ── User ID ──────────────────────────────────────────────────────────────────

/**
 * Returns a stable anonymous user ID, generating one if needed.
 * Uses email from profile if available, otherwise a random UUID.
 */
export async function getUserId(): Promise<string> {
  const stored = await AsyncStorage.getItem(USER_ID_KEY);
  if (stored) return stored;

  const id = `user_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
  await AsyncStorage.setItem(USER_ID_KEY, id);
  return id;
}

// ── API calls ────────────────────────────────────────────────────────────────

/**
 * Register for buddy matching. Returns immediately with either a match or
 * "waiting_for_match" status — poll getBuddyGroup if waiting.
 */
export async function registerBuddy(
  req: BuddyMatchRequest
): Promise<BuddyMatchResponse> {
  const response = await fetch(`${BACKEND_URL}/api/buddy/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Buddy match failed: ${response.status}`);
  return response.json() as Promise<BuddyMatchResponse>;
}

/**
 * Get current buddy group for a user.
 */
export async function getBuddyGroup(userId: string): Promise<BuddyGroup> {
  const response = await fetch(`${BACKEND_URL}/api/buddy/group/${encodeURIComponent(userId)}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Get group failed: ${response.status}`);
  return response.json() as Promise<BuddyGroup>;
}

/**
 * Get safe meeting point for a user's buddy group.
 */
export async function getMeetingPoint(userId: string): Promise<MeetingPoint> {
  const response = await fetch(
    `${BACKEND_URL}/api/buddy/meeting-point/${encodeURIComponent(userId)}`,
    { signal: AbortSignal.timeout(8000) }
  );
  if (!response.ok) throw new Error(`Get meeting point failed: ${response.status}`);
  return response.json() as Promise<MeetingPoint>;
}

/**
 * Check backend health.
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
