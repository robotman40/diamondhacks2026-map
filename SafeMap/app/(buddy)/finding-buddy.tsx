import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, Pressable } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users, X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { registerBuddy, getBuddyGroup, getUserId } from "@/lib/buddyService";
import { useLocation, UCSD_DEFAULT } from "@/hooks/useLocation";

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS = 30000;

export default function FindingBuddy() {
  const router = useRouter();
  const { coords } = useLocation();
  const params = useLocalSearchParams<{
    destName?: string;
    destLat?: string;
    destLng?: string;
  }>();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [statusText, setStatusText] = useState("Searching for verified students heading the same direction");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();

    const progress = Animated.timing(progressAnim, {
      toValue: 0.6,
      duration: POLL_TIMEOUT_MS,
      useNativeDriver: false,
    });
    progress.start();

    let cancelled = false;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;

    async function startMatching() {
      const origin = coords ?? UCSD_DEFAULT;
      const destLat = params.destLat ? parseFloat(params.destLat) : 32.8812;
      const destLng = params.destLng ? parseFloat(params.destLng) : -117.2378;

      try {
        const userId = await getUserId();
        const result = await registerBuddy({
          user_id: userId,
          start_lat: origin.latitude,
          start_lon: origin.longitude,
          dest_lat: destLat,
          dest_lon: destLng,
          travel_time: new Date().toISOString(),
          safety_preference: "buddy_preferred",
        });

        if (cancelled) return;

        if (result.status === "matched" && result.buddy_user_ids?.length) {
          Animated.timing(progressAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
          navigateToFound(result.buddy_user_ids, result.group_id);
          return;
        }

        setStatusText("Waiting for a match… checking every few seconds");

        pollTimer = setInterval(async () => {
          if (cancelled) return;
          try {
            const group = await getBuddyGroup(userId);
            if (group.status === "in_group" && group.buddy_user_ids?.length) {
              clearInterval(pollTimer!);
              clearTimeout(timeoutTimer!);
              Animated.timing(progressAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
              navigateToFound(group.buddy_user_ids!, group.group_id ?? null);
            }
          } catch {
          }
        }, POLL_INTERVAL_MS);

        timeoutTimer = setTimeout(() => {
          if (cancelled) return;
          clearInterval(pollTimer!);
          setStatusText("No buddies found nearby. Try solo mode.");
          setFailed(true);
          Animated.timing(progressAnim, { toValue: 1, duration: 300, useNativeDriver: false }).start();
        }, POLL_TIMEOUT_MS);

      } catch {
        if (!cancelled) {
          setStatusText("Could not reach server. Check your connection.");
          setFailed(true);
        }
      }
    }

    startMatching();

    return () => {
      cancelled = true;
      pulse.stop();
      progress.stop();
      if (pollTimer) clearInterval(pollTimer);
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };
  }, [coords]);

  function navigateToFound(buddyIds: string[], groupId: string | null) {
    router.replace({
      pathname: "./buddy-found",
      params: {
        destName: params.destName,
        destLat: params.destLat,
        destLng: params.destLng,
        buddyUserIds: JSON.stringify(buddyIds),
        groupId: groupId ?? "",
      },
    });
  }

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="absolute top-4 right-4">
        <Pressable onPress={() => router.back()}>
          <X size={24} color={Colors.textMuted} />
        </Pressable>
      </View>

      <View className="flex-1 items-center justify-center px-4">
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View
            className="w-20 h-20 rounded-full bg-surface items-center justify-center"
            style={failed ? { opacity: 0.5 } : undefined}
          >
            <Users size={36} color={Colors.accent} />
          </View>
        </Animated.View>

        <Text className="text-white text-xl font-bold mt-6 text-center">
          {failed ? "No Match Found" : "Finding a Buddy..."}
        </Text>
        <Text className="text-text-muted text-sm mt-2 text-center">{statusText}</Text>

        <View className="w-48 h-1.5 bg-surface rounded-full mt-8 overflow-hidden">
          <Animated.View className="h-full bg-accent rounded-full" style={{ width: progressWidth }} />
        </View>

        {failed && (
          <Pressable
            className="mt-8 bg-surface rounded-xl px-8 py-4"
            onPress={() => router.back()}
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
