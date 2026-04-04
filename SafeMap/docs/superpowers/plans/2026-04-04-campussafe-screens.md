# CampusSafe Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 16 CampusSafe mobile app screens as pixel-perfect React Native Expo components with NativeWind styling, Mapbox maps, and lucide icons.

**Architecture:** Single root Stack navigator (Expo Router) with route groups for file organization. Shared components (MapView, BuddyCard, ToggleRow, RouteCard) extracted to `components/`. Color tokens centralized in `constants/colors.ts`. All screens are functional components with hooks, styled exclusively via NativeWind classNames.

**Tech Stack:** React Native 0.81, Expo SDK 54, Expo Router v6, NativeWind v4, TailwindCSS, @rnmapbox/maps, lucide-react-native, react-native-svg

---

## File Map

```
Create: tailwind.config.js
Create: global.css
Create: metro.config.js
Create: babel.config.js
Create: nativewind-env.d.ts
Modify: app.json (add Mapbox plugin)
Modify: tsconfig.json (add nativewind types)
Modify: package.json (dependencies)

Create: constants/colors.ts
Create: components/MapView.tsx
Create: components/BuddyCard.tsx
Create: components/ToggleRow.tsx
Create: components/RouteCard.tsx

Modify: app/_layout.tsx (import global.css, configure Stack screens)
Modify: app/index.tsx (Welcome screen)
Create: app/(onboarding)/profile-setup.tsx
Create: app/(navigation)/home.tsx
Create: app/(navigation)/search.tsx
Create: app/(navigation)/choose-mode.tsx
Create: app/(navigation)/route-map.tsx
Create: app/(walking)/walking-solo.tsx
Create: app/(walking)/walk-completed.tsx
Create: app/(walking)/route-info.tsx
Create: app/(buddy)/finding-buddy.tsx
Create: app/(buddy)/buddy-found.tsx
Create: app/(buddy)/route-map-buddy.tsx
Create: app/(buddy)/your-group.tsx
Create: app/(settings)/settings.tsx
Create: app/(settings)/emergency-settings.tsx
```

---

### Task 1: Install Dependencies and Configure NativeWind

**Files:**
- Modify: `package.json`
- Create: `tailwind.config.js`
- Create: `global.css`
- Create: `metro.config.js`
- Create: `babel.config.js`
- Create: `nativewind-env.d.ts`
- Modify: `tsconfig.json`

- [ ] **Step 1: Install NativeWind, TailwindCSS, lucide, SVG, and Mapbox**

```bash
cd SafeMap
npx expo install nativewind tailwindcss @rnmapbox/maps lucide-react-native react-native-svg
```

- [ ] **Step 2: Create `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0f1a2e",
        surface: "#1a2840",
        input: "#1e3048",
        accent: "#2dd4a8",
        danger: "#ef6461",
        "text-primary": "#ffffff",
        "text-muted": "#8899aa",
        border: "#243447",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 3: Create `global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

- [ ] **Step 4: Create `metro.config.js`**

```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
```

- [ ] **Step 5: Create `babel.config.js`**

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
    ],
  };
};
```

- [ ] **Step 6: Create `nativewind-env.d.ts`**

```ts
/// <reference types="nativewind/types" />
```

- [ ] **Step 7: Update `tsconfig.json` to include NativeWind types**

Add `"nativewind-env.d.ts"` to the `include` array:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts",
    "nativewind-env.d.ts"
  ]
}
```

- [ ] **Step 8: Update `app.json` to add Mapbox plugin**

Add `"@rnmapbox/maps"` to the plugins array:

```json
"plugins": [
  "expo-router",
  [
    "expo-splash-screen",
    {
      "image": "./assets/images/splash-icon.png",
      "imageWidth": 200,
      "resizeMode": "contain",
      "backgroundColor": "#ffffff",
      "dark": {
        "backgroundColor": "#000000"
      }
    }
  ],
  [
    "@rnmapbox/maps",
    {
      "RNMapboxMapsDownloadToken": "YOUR_MAPBOX_TOKEN"
    }
  ]
]
```

- [ ] **Step 9: Verify setup compiles**

```bash
npx expo start --clear
```

Expected: Metro bundler starts without errors. Press `q` to quit.

- [ ] **Step 10: Commit**

```bash
git add tailwind.config.js global.css metro.config.js babel.config.js nativewind-env.d.ts tsconfig.json app.json package.json package-lock.json
git commit -m "feat: configure NativeWind, Mapbox, and lucide dependencies"
```

---

### Task 2: Create Color Constants and Shared Components

**Files:**
- Create: `constants/colors.ts`
- Create: `components/MapView.tsx`
- Create: `components/BuddyCard.tsx`
- Create: `components/ToggleRow.tsx`
- Create: `components/RouteCard.tsx`

- [ ] **Step 1: Create `constants/colors.ts`**

```ts
export const Colors = {
  background: "#0f1a2e",
  surface: "#1a2840",
  input: "#1e3048",
  accent: "#2dd4a8",
  danger: "#ef6461",
  textPrimary: "#ffffff",
  textMuted: "#8899aa",
  border: "#243447",
};
```

- [ ] **Step 2: Create `components/MapView.tsx`**

```tsx
import React from "react";
import { View } from "react-native";
import Mapbox from "@rnmapbox/maps";

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? "");

type Props = {
  showRoute?: boolean;
  routeCoordinates?: [number, number][];
  centerCoordinate?: [number, number];
  zoomLevel?: number;
  children?: React.ReactNode;
};

const routeGeoJSON = (coords: [number, number][]) => ({
  type: "FeatureCollection" as const,
  features: [
    {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: coords,
      },
      properties: {},
    },
  ],
});

export default function MapViewComponent({
  showRoute = false,
  routeCoordinates = [],
  centerCoordinate = [-117.2340, 32.8801],
  zoomLevel = 15,
  children,
}: Props) {
  return (
    <View className="flex-1">
      <Mapbox.MapView
        style={{ flex: 1 }}
        styleURL="mapbox://styles/mapbox/dark-v11"
      >
        <Mapbox.Camera
          centerCoordinate={centerCoordinate}
          zoomLevel={zoomLevel}
        />
        {showRoute && routeCoordinates.length > 1 && (
          <Mapbox.ShapeSource
            id="routeSource"
            shape={routeGeoJSON(routeCoordinates)}
          >
            <Mapbox.LineLayer
              id="routeLine"
              style={{
                lineColor: "#2dd4a8",
                lineWidth: 4,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </Mapbox.ShapeSource>
        )}
        {children}
      </Mapbox.MapView>
    </View>
  );
}
```

- [ ] **Step 3: Create `components/BuddyCard.tsx`**

```tsx
import React from "react";
import { View, Text } from "react-native";
import { User } from "lucide-react-native";
import { Colors } from "@/constants/colors";

type Props = {
  name: string;
  subtitle: string;
};

export default function BuddyCard({ name, subtitle }: Props) {
  return (
    <View className="flex-row items-center bg-surface rounded-xl p-3 gap-3">
      <View className="w-10 h-10 rounded-full bg-input items-center justify-center">
        <User size={20} color={Colors.textMuted} />
      </View>
      <View className="flex-1">
        <Text className="text-white font-semibold text-base">{name}</Text>
        <Text className="text-text-muted text-sm">{subtitle}</Text>
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Create `components/ToggleRow.tsx`**

```tsx
import React from "react";
import { View, Text, Switch } from "react-native";
import { Colors } from "@/constants/colors";

type Props = {
  label: string;
  description?: string;
  value: boolean;
  onToggle: (val: boolean) => void;
};

export default function ToggleRow({ label, description, value, onToggle }: Props) {
  return (
    <View className="flex-row items-center justify-between py-3">
      <View className="flex-1 mr-4">
        <Text className="text-white text-base">{label}</Text>
        {description && (
          <Text className="text-text-muted text-sm mt-1">{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.input, true: Colors.accent }}
        thumbColor="#ffffff"
      />
    </View>
  );
}
```

- [ ] **Step 5: Create `components/RouteCard.tsx`**

```tsx
import React from "react";
import { View, Text } from "react-native";

type Stat = { label: string; value: string };

type Props = {
  title: string;
  subtitle: string;
  stats?: Stat[];
};

export default function RouteCard({ title, subtitle, stats }: Props) {
  return (
    <View className="bg-surface rounded-2xl p-4">
      <Text className="text-white font-bold text-lg">{title}</Text>
      <Text className="text-text-muted text-sm mt-1">{subtitle}</Text>
      {stats && stats.length > 0 && (
        <View className="flex-row mt-4 justify-between">
          {stats.map((s) => (
            <View key={s.label} className="items-center">
              <Text className="text-white font-bold text-lg">{s.value}</Text>
              <Text className="text-text-muted text-xs">{s.label}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add constants/ components/
git commit -m "feat: add color constants and shared components"
```

---

### Task 3: Root Layout and Welcome Screen

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `app/index.tsx`
- Delete: `app/styles.tsx`

- [ ] **Step 1: Update `app/_layout.tsx`**

```tsx
import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0f1a2e" },
        animation: "slide_from_right",
      }}
    />
  );
}
```

- [ ] **Step 2: Rewrite `app/index.tsx` as Welcome screen**

```tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ShieldCheck, ArrowRight } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function Welcome() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <ShieldCheck size={48} color={Colors.accent} />
        <Text className="text-white text-3xl font-bold mt-6 text-center">
          Welcome to CampusSafe
        </Text>
        <Text className="text-text-muted text-sm mt-2 text-center">
          A safer community for your campus walking
        </Text>
      </View>
      <View className="px-4 pb-4">
        <Pressable
          className="bg-accent rounded-xl py-4 flex-row items-center justify-center gap-2"
          onPress={() => router.push("/profile-setup")}
        >
          <Text className="text-background font-bold text-base">
            Start with CampusSafe ID
          </Text>
          <ArrowRight size={20} color={Colors.background} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Delete `app/styles.tsx`** (unused)

```bash
rm app/styles.tsx
```

- [ ] **Step 4: Verify Welcome screen renders**

```bash
npx expo start --clear
```

Expected: Welcome screen shows with shield icon, title, subtitle, and green button.

- [ ] **Step 5: Commit**

```bash
git add app/_layout.tsx app/index.tsx global.css
git rm app/styles.tsx
git commit -m "feat: add root layout with global CSS and Welcome screen"
```

---

### Task 4: Profile Setup Screen

**Files:**
- Create: `app/(onboarding)/profile-setup.tsx`

- [ ] **Step 1: Create the route group directory**

```bash
mkdir -p app/\(onboarding\)
```

- [ ] **Step 2: Create `app/(onboarding)/profile-setup.tsx`**

```tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera, Check } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function ProfileSetup() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-2xl font-bold mt-6">
          Set Up Your Profile
        </Text>
        <Text className="text-text-muted text-sm mt-2">
          Fill in details to help your walking buddies connect with you
        </Text>

        <View className="items-center mt-6">
          <View className="w-20 h-20 rounded-full bg-surface items-center justify-center">
            <Camera size={28} color={Colors.textMuted} />
          </View>
          <Text className="text-text-muted text-xs mt-2">Add Photo</Text>
        </View>

        <View className="gap-4 mt-6">
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Display Name"
            placeholderTextColor={Colors.textMuted}
            value={displayName}
            onChangeText={setDisplayName}
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="alex@university.edu"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Phone number"
            placeholderTextColor={Colors.textMuted}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-8 mb-4">
          Emergency Contact
        </Text>
        <View className="gap-4">
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Emergency contact name"
            placeholderTextColor={Colors.textMuted}
            value={emergencyName}
            onChangeText={setEmergencyName}
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Phone number or email"
            placeholderTextColor={Colors.textMuted}
            value={emergencyContact}
            onChangeText={setEmergencyContact}
          />
        </View>
      </ScrollView>

      <View className="px-4 pb-4">
        <Pressable
          className="bg-accent rounded-xl py-4 flex-row items-center justify-center gap-2"
          onPress={() => router.push("/home")}
        >
          <Text className="text-background font-bold text-base">
            Complete Setup
          </Text>
          <Check size={20} color={Colors.background} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Verify screen renders**

Run the app, tap "Start with CampusSafe ID" on the Welcome screen. Expected: Profile setup form with avatar placeholder, input fields, and green "Complete Setup" button.

- [ ] **Step 4: Commit**

```bash
git add "app/(onboarding)/profile-setup.tsx"
git commit -m "feat: add Profile Setup screen"
```

---

### Task 5: Home Map Screen

**Files:**
- Create: `app/(navigation)/home.tsx`

- [ ] **Step 1: Create the route group directory**

```bash
mkdir -p app/\(navigation\)
```

- [ ] **Step 2: Create `app/(navigation)/home.tsx`**

```tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent />
      <View className="absolute bottom-8 left-4 right-4">
        <Pressable
          className="bg-surface rounded-2xl px-4 py-4 flex-row items-center gap-3"
          onPress={() => router.push("/search")}
        >
          <Search size={20} color={Colors.textMuted} />
          <Text className="text-text-muted text-base">
            Where are you heading?
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Verify map renders**

Run the app, complete profile setup. Expected: Full-screen dark Mapbox map with floating search bar at bottom.

Note: If Mapbox token is not configured, the map area will be blank. The search bar should still render correctly.

- [ ] **Step 4: Commit**

```bash
git add "app/(navigation)/home.tsx"
git commit -m "feat: add Home map screen with search bar"
```

---

### Task 6: Search / Destinations Screen

**Files:**
- Create: `app/(navigation)/search.tsx`

- [ ] **Step 1: Create `app/(navigation)/search.tsx`**

```tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Search as SearchIcon, MapPin } from "lucide-react-native";
import { Colors } from "@/constants/colors";

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
```

- [ ] **Step 2: Verify screen renders**

Navigate from Home search bar. Expected: Back arrow, "Safe Corridors" header, search input, Recent list, Indoor/Outdoor tabs.

- [ ] **Step 3: Commit**

```bash
git add "app/(navigation)/search.tsx"
git commit -m "feat: add Search destinations screen"
```

---

### Task 7: Choose Mode Screen

**Files:**
- Create: `app/(navigation)/choose-mode.tsx`

- [ ] **Step 1: Create `app/(navigation)/choose-mode.tsx`**

```tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ArrowLeft,
  MapPin,
  AlertTriangle,
  Users,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function ChooseMode() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 flex-1">
        <View className="flex-row items-center gap-3 mt-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text className="text-white text-xl font-bold">Choose Your Mode</Text>
        </View>

        <View className="mt-6">
          <Text className="text-text-muted text-sm font-semibold mb-3">
            Route
          </Text>
          <View className="bg-surface rounded-2xl p-4">
            <View className="flex-row items-center gap-3">
              <MapPin size={16} color={Colors.accent} />
              <Text className="text-white text-sm">Current Location</Text>
            </View>
            <View className="ml-2 border-l border-dashed border-text-muted h-6 my-1" />
            <View className="flex-row items-center gap-3">
              <MapPin size={16} color={Colors.danger} />
              <Text className="text-white text-sm">Campus Library</Text>
            </View>
            <Text className="text-text-muted text-xs mt-2 ml-7">
              ~10 min walk
            </Text>
          </View>
        </View>

        <View className="gap-4 mt-6">
          <Pressable
            className="bg-surface rounded-2xl p-4"
            onPress={() => router.push("/route-map")}
          >
            <AlertTriangle size={24} color="#f59e0b" />
            <Text className="text-white font-bold text-lg mt-3">
              Guided Solo
            </Text>
            <Text className="text-text-muted text-sm mt-1">
              Follow the safest route with real-time alerts. Best for confident,
              solo walkers.
            </Text>
          </Pressable>

          <Pressable
            className="bg-surface rounded-2xl p-4"
            onPress={() => router.push("/finding-buddy")}
          >
            <Users size={24} color={Colors.accent} />
            <Text className="text-white font-bold text-lg mt-3">
              Request Buddy
            </Text>
            <Text className="text-text-muted text-sm mt-1">
              Get paired with a verified student heading the same direction.
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-row gap-3 px-4 pb-4">
        <Pressable
          className="flex-1 bg-surface rounded-xl py-4 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-white font-semibold">End Route</Text>
        </Pressable>
        <Pressable
          className="flex-1 bg-accent rounded-xl py-4 items-center"
          onPress={() => {}}
        >
          <Text className="text-background font-semibold">Update GPS</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Verify screen renders**

Tap a destination from Search. Expected: Route summary card, Guided Solo and Request Buddy cards, bottom buttons.

- [ ] **Step 3: Commit**

```bash
git add "app/(navigation)/choose-mode.tsx"
git commit -m "feat: add Choose Mode screen"
```

---

### Task 8: Route Map Solo Screen

**Files:**
- Create: `app/(navigation)/route-map.tsx`

- [ ] **Step 1: Create `app/(navigation)/route-map.tsx`**

```tsx
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
```

- [ ] **Step 2: Verify screen renders**

Tap "Guided Solo" from Choose Mode. Expected: Map with route line, tab pills at top, route info card at bottom with Start button.

- [ ] **Step 3: Commit**

```bash
git add "app/(navigation)/route-map.tsx"
git commit -m "feat: add Route Map solo screen"
```

---

### Task 9: Walking Solo Screen

**Files:**
- Create: `app/(walking)/walking-solo.tsx`

- [ ] **Step 1: Create the route group directory**

```bash
mkdir -p app/\(walking\)
```

- [ ] **Step 2: Create `app/(walking)/walking-solo.tsx`**

```tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";
import BuddyCard from "@/components/BuddyCard";

const sampleRoute: [number, number][] = [
  [-117.2375, 32.8785],
  [-117.2365, 32.8790],
  [-117.2355, 32.8800],
  [-117.2345, 32.8810],
  [-117.2340, 32.8820],
];

export default function WalkingSolo() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent showRoute routeCoordinates={sampleRoute} />

      <SafeAreaView className="absolute top-0 left-0 right-0" edges={["top"]}>
        <View className="px-4 mt-2">
          <Text className="text-white text-lg font-bold">Walking Solo</Text>
        </View>
        <View className="flex-row gap-3 px-4 mt-3">
          <Pressable
            className="bg-surface rounded-xl px-4 py-2"
            onPress={() => router.push("/walk-completed")}
          >
            <Text className="text-white font-semibold text-sm">End Route</Text>
          </Pressable>
          <Pressable
            className="bg-accent rounded-xl px-4 py-2"
            onPress={() => router.push("/finding-buddy")}
          >
            <Text className="text-background font-semibold text-sm">
              Switch to Buddy Mode
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <View className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-2xl p-4 pb-8">
        <BuddyCard name="Alex M. (Psych)" subtitle="Walking to: Library" />
        <Text className="text-text-muted text-sm mt-3 text-center">
          Need company?
        </Text>
        <Pressable
          className="bg-accent rounded-xl py-4 items-center mt-3"
          onPress={() => router.push("/finding-buddy")}
        >
          <Text className="text-background font-bold text-base">
            Switch to Buddy Mode
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Verify screen renders**

Tap "Start" from Route Map. Expected: Map with route, "Walking Solo" label, buddy suggestion card at bottom.

- [ ] **Step 4: Commit**

```bash
git add "app/(walking)/walking-solo.tsx"
git commit -m "feat: add Walking Solo screen"
```

---

### Task 10: Route Info Screen

**Files:**
- Create: `app/(walking)/route-info.tsx`

- [ ] **Step 1: Create `app/(walking)/route-info.tsx`**

```tsx
import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Shield, MapPin, Lightbulb } from "lucide-react-native";
import { Colors } from "@/constants/colors";

const checkpoints = [
  { id: "1", name: "Well-lit Walkway", icon: Lightbulb },
  { id: "2", name: "Emergency Phone Station", icon: Shield },
  { id: "3", name: "Security Camera Zone", icon: Shield },
  { id: "4", name: "Campus Library Entrance", icon: MapPin },
];

export default function RouteInfo() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 flex-1">
        <View className="flex-row items-center gap-3 mt-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text className="text-white text-xl font-bold">Route Info</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="mt-6">
          <View className="bg-surface rounded-2xl p-4">
            <View className="flex-row items-center gap-2">
              <Shield size={20} color={Colors.accent} />
              <Text className="text-accent font-bold text-lg">92% Safety Score</Text>
            </View>
            <Text className="text-text-muted text-sm mt-2">
              This route follows well-lit paths with active security camera
              coverage and multiple emergency stations along the way.
            </Text>
          </View>

          <Text className="text-text-muted text-sm font-semibold mt-6 mb-3">
            Checkpoints
          </Text>
          <View className="gap-3">
            {checkpoints.map((cp) => (
              <View
                key={cp.id}
                className="bg-surface rounded-xl p-4 flex-row items-center gap-3"
              >
                <cp.icon size={18} color={Colors.accent} />
                <Text className="text-white text-base">{cp.name}</Text>
              </View>
            ))}
          </View>

          <View className="flex-row justify-between mt-6 bg-surface rounded-2xl p-4">
            <View className="items-center">
              <Text className="text-white font-bold text-lg">0.6 mi</Text>
              <Text className="text-text-muted text-xs">Distance</Text>
            </View>
            <View className="items-center">
              <Text className="text-white font-bold text-lg">10 min</Text>
              <Text className="text-text-muted text-xs">Est. Time</Text>
            </View>
            <View className="items-center">
              <Text className="text-white font-bold text-lg">4</Text>
              <Text className="text-text-muted text-xs">Checkpoints</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(walking)/route-info.tsx"
git commit -m "feat: add Route Info screen"
```

---

### Task 11: Walk Completed Screen

**Files:**
- Create: `app/(walking)/walk-completed.tsx`

- [ ] **Step 1: Create `app/(walking)/walk-completed.tsx`**

```tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckCircle } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function WalkCompleted() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 items-center justify-center">
        <CheckCircle size={64} color={Colors.accent} />
        <Text className="text-white text-2xl font-bold mt-6 text-center">
          Walk Completed
        </Text>
        <Text className="text-text-muted text-sm mt-2 text-center">
          You've safely arrived at your destination!
        </Text>

        <View className="bg-surface rounded-2xl p-4 mt-8 w-full">
          <Text className="text-text-muted text-sm font-semibold mb-3">
            Walking Details
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between">
              <Text className="text-text-muted text-sm">Walking buddy</Text>
              <Text className="text-white text-sm">Alex M. (Psych)</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-text-muted text-sm">Checkpoints</Text>
              <Text className="text-white text-sm">4 visited</Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-between mt-6 w-full bg-surface rounded-2xl p-4">
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">0.6 mi</Text>
            <Text className="text-text-muted text-xs">Distance</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">11 min</Text>
            <Text className="text-text-muted text-xs">Time</Text>
          </View>
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-xl">42</Text>
            <Text className="text-text-muted text-xs">Calories</Text>
          </View>
        </View>
      </View>

      <View className="px-4 pb-4">
        <Pressable
          className="bg-accent rounded-xl py-4 items-center"
          onPress={() => router.push("/home")}
        >
          <Text className="text-background font-bold text-base">
            Back to Home
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(walking)/walk-completed.tsx"
git commit -m "feat: add Walk Completed screen"
```

---

### Task 12: Finding Buddy Screen

**Files:**
- Create: `app/(buddy)/finding-buddy.tsx`

- [ ] **Step 1: Create the route group directory**

```bash
mkdir -p app/\(buddy\)
```

- [ ] **Step 2: Create `app/(buddy)/finding-buddy.tsx`**

```tsx
import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Users } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function FindingBuddy() {
  const router = useRouter();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start();

    const timeout = setTimeout(() => {
      router.replace("/buddy-found");
    }, 3500);

    return () => clearTimeout(timeout);
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <View className="w-20 h-20 rounded-full bg-surface items-center justify-center">
            <Users size={36} color={Colors.accent} />
          </View>
        </Animated.View>
        <Text className="text-white text-xl font-bold mt-6 text-center">
          Finding a Buddy...
        </Text>
        <Text className="text-text-muted text-sm mt-2 text-center">
          Searching for verified students heading the same direction
        </Text>
        <View className="w-48 h-1.5 bg-surface rounded-full mt-8 overflow-hidden">
          <Animated.View
            className="h-full bg-accent rounded-full"
            style={{ width: progressWidth }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Verify animation and auto-navigation**

Tap "Request Buddy" from Choose Mode. Expected: Pulsing Users icon, loading text, animated progress bar. After ~3.5s, auto-navigates to Buddy Found.

- [ ] **Step 4: Commit**

```bash
git add "app/(buddy)/finding-buddy.tsx"
git commit -m "feat: add Finding Buddy loading screen"
```

---

### Task 13: Buddy Found Screen

**Files:**
- Create: `app/(buddy)/buddy-found.tsx`

- [ ] **Step 1: Create `app/(buddy)/buddy-found.tsx`**

```tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { UserCheck } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import BuddyCard from "@/components/BuddyCard";

export default function BuddyFound() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 items-center justify-center px-4">
        <View className="w-20 h-20 rounded-full bg-surface items-center justify-center">
          <UserCheck size={36} color={Colors.accent} />
        </View>
        <Text className="text-white text-2xl font-bold mt-6 text-center">
          Buddy Found!
        </Text>

        <View className="w-full mt-6">
          <BuddyCard name="Jamie S." subtitle="Walking to: Library" />
        </View>

        <Text className="text-text-muted text-sm mt-4">
          Starting navigation...
        </Text>
      </View>

      <View className="px-4 pb-4">
        <Pressable
          className="bg-accent rounded-xl py-4 items-center"
          onPress={() => router.push("/route-map-buddy")}
        >
          <Text className="text-background font-bold text-base">
            Start Navigation
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(buddy)/buddy-found.tsx"
git commit -m "feat: add Buddy Found screen"
```

---

### Task 14: Route Map Buddy Screen

**Files:**
- Create: `app/(buddy)/route-map-buddy.tsx`

- [ ] **Step 1: Create `app/(buddy)/route-map-buddy.tsx`**

```tsx
import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";

const sampleRoute: [number, number][] = [
  [-117.2375, 32.8785],
  [-117.2365, 32.8790],
  [-117.2355, 32.8800],
  [-117.2345, 32.8810],
  [-117.2340, 32.8820],
];

const tabs = ["AI Route", "Alt Route", "Buddy Groups"];

export default function RouteMapBuddy() {
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
              onPress={() => {
                setActiveTab(tab);
                if (tab === "Buddy Groups") {
                  router.push("/your-group");
                }
              }}
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
        <Text className="text-white font-bold text-lg">Campus Library</Text>
        <Text className="text-text-muted text-sm mt-1">
          Walking with Jamie S.
        </Text>
        <View className="flex-row gap-3 mt-4">
          <Pressable
            className="flex-1 bg-input rounded-xl py-4 items-center"
            onPress={() => {}}
          >
            <Text className="text-white font-semibold">Estimate</Text>
          </Pressable>
          <Pressable
            className="flex-1 bg-accent rounded-xl py-4 items-center"
            onPress={() => router.push("/walk-completed")}
          >
            <Text className="text-background font-semibold">Add to Walk</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(buddy)/route-map-buddy.tsx"
git commit -m "feat: add Route Map Buddy screen"
```

---

### Task 15: Your Group Screen

**Files:**
- Create: `app/(buddy)/your-group.tsx`

- [ ] **Step 1: Create `app/(buddy)/your-group.tsx`**

```tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import BuddyCard from "@/components/BuddyCard";

const groupMembers = [
  { name: "Alex M. (Psych)", subtitle: "Walking to: Library" },
  { name: "Jamie S.", subtitle: "2 min away" },
];

export default function YourGroup() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="px-4 flex-1">
        <View className="flex-row items-center justify-between mt-4">
          <Text className="text-white text-xl font-bold">Your Group</Text>
          <Pressable onPress={() => router.back()}>
            <X size={24} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <View className="gap-3 mt-6">
          {groupMembers.map((member) => (
            <BuddyCard
              key={member.name}
              name={member.name}
              subtitle={member.subtitle}
            />
          ))}
        </View>
      </View>

      <View className="px-4 pb-4">
        <Text className="text-text-muted text-xs text-center mb-3">
          You & your buddies will be notified when leaving
        </Text>
        <Pressable
          className="bg-danger rounded-xl py-4 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-white font-bold text-base">Leave Group</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(buddy)/your-group.tsx"
git commit -m "feat: add Your Group screen"
```

---

### Task 16: Settings & Profile Screen

**Files:**
- Create: `app/(settings)/settings.tsx`

- [ ] **Step 1: Create the route group directory**

```bash
mkdir -p app/\(settings\)
```

- [ ] **Step 2: Create `app/(settings)/settings.tsx`**

```tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, User, Pencil } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import ToggleRow from "@/components/ToggleRow";

export default function Settings() {
  const router = useRouter();
  const [buddyNotify, setBuddyNotify] = useState(true);
  const [safetyAlerts, setSafetyAlerts] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 mt-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text className="text-white text-xl font-bold">
            Settings & Profile
          </Text>
        </View>

        <View className="items-center mt-6">
          <View className="w-20 h-20 rounded-full bg-surface items-center justify-center">
            <User size={28} color={Colors.textMuted} />
          </View>
          <View className="absolute right-1/2 mr-[-48px] mt-16 bg-accent rounded-full w-7 h-7 items-center justify-center">
            <Pencil size={14} color={Colors.background} />
          </View>
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-8 mb-3">
          Profile Details
        </Text>
        <View className="gap-3">
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Display Name"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Alex Martinez"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Title / Department"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Psychology"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Email"
            placeholderTextColor={Colors.textMuted}
            defaultValue="alex@university.edu"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Phone"
            placeholderTextColor={Colors.textMuted}
            defaultValue="(555) 123-4567"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Campus"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Student University - Main Campus"
          />
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-8 mb-3">
          Emergency Contact
        </Text>
        <View className="gap-3">
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Contact Name"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Jane Martinez"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Phone"
            placeholderTextColor={Colors.textMuted}
            defaultValue="(816) 555-1990"
          />
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-8 mb-1">
          Notification Preferences
        </Text>
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
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add "app/(settings)/settings.tsx"
git commit -m "feat: add Settings & Profile screen"
```

---

### Task 17: Emergency Settings Screen

**Files:**
- Create: `app/(settings)/emergency-settings.tsx`

- [ ] **Step 1: Create `app/(settings)/emergency-settings.tsx`**

```tsx
import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, ChevronDown } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import ToggleRow from "@/components/ToggleRow";

export default function EmergencySettings() {
  const router = useRouter();
  const [walkStarts, setWalkStarts] = useState(true);
  const [routeArrival, setRouteArrival] = useState(true);
  const [safeTypes, setSafeTypes] = useState(false);
  const [defaultCheckin, setDefaultCheckin] = useState(true);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center gap-3 mt-4">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text className="text-white text-xl font-bold">
            Emergency Settings
          </Text>
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-6 mb-3">
          Privacy
        </Text>
        <Pressable className="bg-input rounded-xl px-4 h-12 flex-row items-center justify-between">
          <Text className="text-white text-base">
            Share w/ Contacts + Main Campus
          </Text>
          <ChevronDown size={18} color={Colors.textMuted} />
        </Pressable>

        <Text className="text-text-muted text-sm font-semibold mt-6 mb-3">
          Emergency Contact
        </Text>
        <View className="gap-3">
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="First Name"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Jane"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Last Name"
            placeholderTextColor={Colors.textMuted}
            defaultValue="Martinez"
          />
          <TextInput
            className="bg-input text-white rounded-xl px-4 h-12 text-base"
            placeholder="Phone"
            placeholderTextColor={Colors.textMuted}
            defaultValue="(816) 555-1990"
            keyboardType="phone-pad"
          />
        </View>

        <Text className="text-text-muted text-sm font-semibold mt-6 mb-1">
          Emergency Contact Permissions
        </Text>
        <ToggleRow
          label="Notify when walk starts"
          value={walkStarts}
          onToggle={setWalkStarts}
        />
        <ToggleRow
          label="Notify on route arrival"
          value={routeArrival}
          onToggle={setRouteArrival}
        />
        <ToggleRow
          label="Notify on safe types"
          value={safeTypes}
          onToggle={setSafeTypes}
        />
        <ToggleRow
          label="Receive default check-in"
          value={defaultCheckin}
          onToggle={setDefaultCheckin}
        />
        <View className="h-8" />
      </ScrollView>

      <View className="px-4 pb-4">
        <Pressable
          className="bg-danger rounded-xl py-4 items-center"
          onPress={() => {}}
        >
          <Text className="text-white font-bold text-base">In Trip Use</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add "app/(settings)/emergency-settings.tsx"
git commit -m "feat: add Emergency Settings screen"
```

---

### Task 18: Wire Up Navigation in Home Screen

**Files:**
- Modify: `app/(navigation)/home.tsx`

The Home screen needs a way to access Settings. Add a settings gear icon in the top right.

- [ ] **Step 1: Update `app/(navigation)/home.tsx`**

Add a settings button overlay to the top-right of the map:

```tsx
import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Settings } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import MapViewComponent from "@/components/MapView";

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background">
      <MapViewComponent />

      <SafeAreaView
        className="absolute top-0 right-0"
        edges={["top"]}
      >
        <Pressable
          className="bg-surface rounded-xl p-3 mr-4 mt-2"
          onPress={() => router.push("/settings")}
        >
          <Settings size={20} color={Colors.textPrimary} />
        </Pressable>
      </SafeAreaView>

      <View className="absolute bottom-8 left-4 right-4">
        <Pressable
          className="bg-surface rounded-2xl px-4 py-4 flex-row items-center gap-3"
          onPress={() => router.push("/search")}
        >
          <Search size={20} color={Colors.textMuted} />
          <Text className="text-text-muted text-base">
            Where are you heading?
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Full navigation smoke test**

Run the app and verify all navigation paths:
1. Welcome → Profile Setup → Home
2. Home → Search → Choose Mode → Route Map → Walking Solo → Walk Completed → Home
3. Choose Mode → Finding Buddy → Buddy Found → Route Map Buddy → Your Group
4. Home → Settings
5. All back arrows navigate back

- [ ] **Step 3: Commit**

```bash
git add "app/(navigation)/home.tsx"
git commit -m "feat: add settings navigation to Home screen"
```

---

### Task 19: Final Polish and Cleanup

- [ ] **Step 1: Verify all screens compile without warnings**

```bash
npx expo start --clear
```

Check Metro bundler output for TypeScript or import errors.

- [ ] **Step 2: Verify no code comments exist in any file**

```bash
cd /home/tim/diamondhacks2026-map/SafeMap
grep -r "\/\/" --include="*.tsx" --include="*.ts" app/ components/ constants/ | grep -v "node_modules" | grep -v "http"
```

Remove any comments found.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: final cleanup and verification"
```
