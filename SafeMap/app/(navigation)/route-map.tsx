import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";
import RouteCard from "@/components/RouteCard";

const sampleRoute: [number, number][] = [
  [-117.2375, 32.8785],
  [-117.2365, 32.8790],
  [-117.2355, 32.8800],
  [-117.2345, 32.8810],
  [-117.2340, 32.8820],
];

const tabs = ["AI Route", "Alt Route", "Buddy Groups"];

export default function RouteMap() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("AI Route");

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent showRoute routeCoordinates={sampleRoute} />

      <SafeAreaView className="absolute top-0 left-0 right-0" edges={["top"]}>
        <View className="flex-row gap-2 px-4 mt-2">
          {tabs.map((tab) => (
            <Pressable
              key={tab}
              className={`px-4 py-2 rounded-xl ${activeTab === tab ? "bg-accent" : "bg-surface"}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`text-sm font-semibold ${activeTab === tab ? "text-background" : "text-white"}`}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>

      <View className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-4 pb-8">
        <RouteCard
          title="Route Info"
          subtitle="Safest path via well-lit corridors"
          stats={[
            { label: "Distance", value: "0.6 mi" },
            { label: "Time", value: "10 min" },
            { label: "Safety", value: "92%" },
          ]}
        />
        <Pressable
          className="bg-accent rounded-xl py-4 items-center mt-4"
          onPress={() => router.push("/walking-solo")}
        >
          <Text className="text-background font-bold text-base">Start</Text>
        </Pressable>
      </View>
    </View>
  );
}
