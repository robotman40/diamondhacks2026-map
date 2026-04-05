import { Colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { ArrowLeft, MapPin, Search as SearchIcon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Place = {
  id: string;
  name: string;
  subtitle: string;
  lat: number;
  lng: number;
};

const RECENT: Place[] = [
  {
    id: "r1",
    name: "Geisel Library",
    subtitle: "UC San Diego Main Library",
    lat: 32.8812,
    lng: -117.2378,
  },
  {
    id: "r2",
    name: "Price Center",
    subtitle: "Student Union & Food Court",
    lat: 32.8796,
    lng: -117.2359,
  },
  {
    id: "r3",
    name: "CSE Building",
    subtitle: "Computer Science & Engineering",
    lat: 32.8823,
    lng: -117.2335,
  },
];

const INDOOR: Place[] = [
  {
    id: "i1",
    name: "Geisel Library",
    subtitle: "UC San Diego Main Library",
    lat: 32.8812,
    lng: -117.2378,
  },
  {
    id: "i2",
    name: "Price Center Food Court",
    subtitle: "Level 1, Price Center East",
    lat: 32.8795,
    lng: -117.2357,
  },
  {
    id: "i3",
    name: "Student Services Center",
    subtitle: "Registrar, Financial Aid",
    lat: 32.8765,
    lng: -117.2372,
  },
  {
    id: "i4",
    name: "Center Hall",
    subtitle: "Revelle College",
    lat: 32.8777,
    lng: -117.2368,
  },
  {
    id: "i5",
    name: "Warren Lecture Hall",
    subtitle: "Warren College",
    lat: 32.8788,
    lng: -117.2334,
  },
  {
    id: "i6",
    name: "The Loft (Price Center)",
    subtitle: "Student lounge & café",
    lat: 32.8797,
    lng: -117.2356,
  },
];

const OUTDOOR: Place[] = [
  {
    id: "o1",
    name: "Sun God Lawn",
    subtitle: "Iconic UCSD gathering spot",
    lat: 32.8800,
    lng: -117.2374,
  },
  {
    id: "o2",
    name: "RIMAC Arena",
    subtitle: "Recreation, Intramural & Athletic Complex",
    lat: 32.8889,
    lng: -117.2413,
  },
  {
    id: "o3",
    name: "Warren Mall",
    subtitle: "Warren College outdoor mall",
    lat: 32.8794,
    lng: -117.2341,
  },
  {
    id: "o4",
    name: "Revelle Plaza",
    subtitle: "Revelle College central plaza",
    lat: 32.8747,
    lng: -117.2415,
  },
  {
    id: "o5",
    name: "Pepper Canyon Trailhead",
    subtitle: "Canyon trail access point",
    lat: 32.8785,
    lng: -117.2383,
  },
  {
    id: "o6",
    name: "Muir Quad",
    subtitle: "John Muir College quad",
    lat: 32.8754,
    lng: -117.2424,
  },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"indoor" | "outdoor">("indoor");

  const places = activeTab === "indoor" ? INDOOR : OUTDOOR;

  const filteredPlaces = useMemo(() => {
    if (!query.trim()) return places;
    const q = query.toLowerCase();
    return [...INDOOR, ...OUTDOOR, ...RECENT].filter(
      (p) =>
        p.name.toLowerCase().includes(q) || p.subtitle.toLowerCase().includes(q)
    );
  }, [query, places]);

  function navigateTo(place: Place) {
    router.push({
      pathname: "/choose-mode",
      params: {
        destName: place.name,
        destLat: place.lat.toString(),
        destLng: place.lng.toString(),
      },
    });
  }

  const showSearch = query.trim().length > 0;

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
            placeholder="Search UCSD destinations..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {!showSearch && (
          <Text className="text-text-muted text-sm font-semibold mt-6 mb-3">
            Recent
          </Text>
        )}
      </View>

      {showSearch ? (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.id}
          className="px-4 mt-2"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              className="flex-row items-center gap-3 py-3"
              onPress={() => navigateTo(item)}
            >
              <MapPin size={18} color={Colors.accent} />
              <View className="flex-1">
                <Text className="text-white text-base">{item.name}</Text>
                <Text className="text-text-muted text-xs mt-0.5">{item.subtitle}</Text>
              </View>
            </Pressable>
          )}
        />
      ) : (
        <FlatList
          data={RECENT}
          keyExtractor={(item) => item.id}
          className="px-4"
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              className="flex-row items-center gap-3 py-3"
              onPress={() => navigateTo(item)}
            >
              <MapPin size={18} color={Colors.accent} />
              <View className="flex-1">
                <Text className="text-white text-base">{item.name}</Text>
                <Text className="text-text-muted text-xs mt-0.5">{item.subtitle}</Text>
              </View>
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
                    Indoor
                  </Text>
                </Pressable>
                <Pressable
                  className={`px-4 py-2 rounded-xl ${activeTab === "outdoor" ? "bg-accent" : "bg-surface"}`}
                  onPress={() => setActiveTab("outdoor")}
                >
                  <Text
                    className={`text-sm font-semibold ${activeTab === "outdoor" ? "text-background" : "text-white"}`}
                  >
                    Outdoor
                  </Text>
                </Pressable>
              </View>
              {places.map((item) => (
                <Pressable
                  key={item.id}
                  className="flex-row items-center gap-3 py-3"
                  onPress={() => navigateTo(item)}
                >
                  <MapPin size={18} color={Colors.textMuted} />
                  <View className="flex-1">
                    <Text className="text-white text-base">{item.name}</Text>
                    <Text className="text-text-muted text-xs mt-0.5">{item.subtitle}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
