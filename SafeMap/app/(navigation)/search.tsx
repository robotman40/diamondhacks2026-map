import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, Search as SearchIcon } from "lucide-react-native";
import React, { useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const recentLocations = [
  { id: "1", name: "Campus Library" },
  { id: "2", name: "Student Recreation Center" },
  { id: "3", name: "Main Entrance - Building C" },
];

const indoorStops = [
  { id: "4", name: "Science Hall - Room 204" },
  { id: "5", name: "Dining Commons" },
  { id: "6", name: "Engineering Lab" },
];

const outdoorStops = [
  { id: "7", name: "Central Quad" },
  { id: "8", name: "West Parking Lot" },
  { id: "9", name: "Athletic Fields" },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"indoor" | "outdoor">("indoor");

  const places = activeTab === "indoor" ? indoorStops : outdoorStops;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4">
        <View className="flex-row items-center gap-3 mt-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text className="text-white text-xl font-bold">Safe Corridors</Text>
        </View>

        <View className="bg-input rounded-xl px-4 h-12 flex-row items-center gap-3 mt-4">
          <SearchIcon size={18} color={Colors.textMuted} />
          <TextInput
            className="flex-1 text-white text-base"
            placeholder="Search destinations..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-6 mb-3">
          Recent
        </Text>
      </View>

      <FlatList
        data={recentLocations}
        keyExtractor={(item) => item.id}
        className="px-4"
        renderItem={({ item }) => (
          <Pressable
            className="flex-row items-center gap-3 py-3"
            onPress={() => router.push("/choose-mode")}
          >
            <MapPin size={18} color={Colors.accent} />
            <Text className="text-white text-base">{item.name}</Text>
          </Pressable>
        )}
        ListFooterComponent={
          <View>
            <Text className="text-text-muted text-sm font-semibold mt-6 mb-3">
              Places of Interest
            </Text>
            <View className="flex-row gap-2 mb-4">
              <Pressable
                className={`px-4 py-2 rounded-xl ${activeTab === "indoor" ? "bg-accent" : "bg-surface"}`}
                onPress={() => setActiveTab("indoor")}
              >
                <Text
                  className={`text-sm font-semibold ${activeTab === "indoor" ? "text-background" : "text-white"}`}
                >
                  Indoor Stops
                </Text>
              </Pressable>
              <Pressable
                className={`px-4 py-2 rounded-xl ${activeTab === "outdoor" ? "bg-accent" : "bg-surface"}`}
                onPress={() => setActiveTab("outdoor")}
              >
                <Text
                  className={`text-sm font-semibold ${activeTab === "outdoor" ? "text-background" : "text-white"}`}
                >
                  Outdoor Stops
                </Text>
              </Pressable>
            </View>
            {places.map((item) => (
              <Pressable
                key={item.id}
                className="flex-row items-center gap-3 py-3"
                onPress={() => router.push("/choose-mode")}
              >
                <MapPin size={18} color={Colors.textMuted} />
                <Text className="text-white text-base">{item.name}</Text>
              </Pressable>
            ))}
          </View>
        }
      />
    </SafeAreaView>
  );
}
