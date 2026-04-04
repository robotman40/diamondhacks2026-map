# CampusSafe Mobile App - Screen Implementation Spec

## Overview

Implement 16 screens for the CampusSafe mobile app using React Native Expo with Expo Router. The app provides safe campus navigation with solo and buddy walking modes.

## Tech Stack

- **Framework:** React Native Expo (SDK 54)
- **Router:** Expo Router v6 (file-based, single root Stack)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Icons:** lucide-react-native
- **Maps:** @rnmapbox/maps (Mapbox dark style `mapbox://styles/mapbox/dark-v11`)
- **SVG:** react-native-svg (required by lucide)
- **State:** React hooks (useState, useEffect) -- no external state management

## Dependencies to Install

```
nativewind tailwindcss @rnmapbox/maps lucide-react-native react-native-svg
```

NativeWind also requires `tailwind.config.js`, `global.css`, and babel plugin configuration.

## Color Palette

| Token        | Hex       | Usage                              |
|-------------|-----------|-------------------------------------|
| background  | `#0f1a2e` | Screen backgrounds                  |
| surface     | `#1a2840` | Cards, elevated containers          |
| input       | `#1e3048` | Text input backgrounds              |
| accent      | `#2dd4a8` | Primary buttons, active states, route paths |
| danger      | `#ef6461` | Destructive/alert buttons           |
| textPrimary | `#ffffff` | Headings, primary text              |
| textMuted   | `#8899aa` | Secondary text, labels              |
| border      | `#243447` | Subtle borders on cards/inputs      |

## Typography

- Font family: System default (no custom fonts required)
- Headings: bold, white (`#ffffff`)
- Body: regular, white or muted (`#8899aa`)
- Size scale: 12 / 14 / 16 / 18 / 20 / 24 / 32

## Grid System

- Base unit: 4px
- Standard padding: 16px (`p-4`)
- Card border radius: 16px (`rounded-2xl`)
- Button border radius: 12px (`rounded-xl`)
- Screen horizontal padding: 16px
- Spacing between sections: 24px (`gap-6`)

## File Structure

```
app/
  _layout.tsx                      Single root Stack navigator, headerShown: false
  index.tsx                        Welcome/Splash screen

  (onboarding)/
    profile-setup.tsx              Profile setup form

  (navigation)/
    home.tsx                       Main map view with search bar
    search.tsx                     Destination search with location list
    choose-mode.tsx                Solo vs Buddy mode selection
    route-map.tsx                  Map with solo route overlay

  (walking)/
    walking-solo.tsx               Active solo navigation with buddy prompt
    walk-completed.tsx             Walk stats and completion
    route-info.tsx                 Route detail panel

  (buddy)/
    finding-buddy.tsx              Buddy matching loading screen
    buddy-found.tsx                Buddy match result
    route-map-buddy.tsx            Map with buddy route
    your-group.tsx                 Group member list

  (settings)/
    settings.tsx                   Profile and preferences
    emergency-settings.tsx         Emergency contacts and notification toggles

components/
  MapView.tsx                      Mapbox wrapper component
  RouteCard.tsx                    Route info summary card
  BuddyCard.tsx                   Buddy profile avatar + name card
  ToggleRow.tsx                    Label + description + toggle switch row

constants/
  colors.ts                        Color token exports
```

## Screen Specifications

### 1. Welcome (index.tsx)

- Full screen dark background (`#0f1a2e`)
- Centered layout, vertical stack
- Top: `ShieldCheck` icon from lucide (teal accent, ~48px)
- Title: "Welcome to CampusSafe" (24px bold white)
- Subtitle: "A safer community for your campus walking" (14px muted)
- Bottom CTA: Green accent button "Start with CampusSafe ID" (full width, rounded-xl, 16px horizontal margin)
- Button has arrow-right icon suffix

### 2. Profile Setup (profile-setup.tsx)

- Header: "Set Up Your Profile" (24px bold)
- Subtext: "Fill in details to help your walking buddies connect with you" (14px muted)
- Circular avatar placeholder (80px) with `Camera` icon overlay for upload
- Form fields (dark input bg `#1e3048`, rounded-xl, 48px height):
  - Display Name
  - Email (pre-filled placeholder)
  - Phone (placeholder format)
- Section: "Emergency Contact"
  - Emergency contact name input
  - Phone number or email input
- Bottom CTA: "Complete Setup" button (accent green, full width, with checkmark icon)

### 3. Home / Map (home.tsx)

- Full screen Mapbox map (dark style)
- Floating search bar at bottom: "Where are you heading?" with `Search` icon
- Map fills entire screen behind status bar
- Search bar: surface color bg, rounded-2xl, 16px margin from edges

### 4. Search / Destinations (search.tsx)

- Header with back arrow + "Safe Corridors" title
- Search input at top with `Search` icon
- Section: "Recent"
  - List items with `MapPin` icon: "Campus Library", "Student Recreation Center", "Main Entrance - Building C"
- Section: "Places of Interest"
  - Segmented toggle tabs: "Indoor Stops" / "Outdoor Stops"
  - List of locations below tabs

### 5. Choose Your Mode (choose-mode.tsx)

- Header with back arrow + "Choose Your Mode"
- Section: "Route"
  - Current Location indicator with `MapPin`
  - Destination with `MapPin`
  - Dotted line connecting them
  - ETA display: "~10 min walk"
- Two mode cards stacked vertically:
  - **Guided Solo** card:
    - `AlertTriangle` icon (amber/yellow)
    - Title: "Guided Solo"
    - Description: "Follow the safest route with real-time alerts. Best for confident, solo walkers."
  - **Request Buddy** card:
    - `Users` icon (teal)
    - Title: "Request Buddy"
    - Description: "Get paired with a verified student heading the same direction."
- Bottom: Two buttons side by side
  - "End Route" (outline/surface style)
  - "Update GPS" (accent green)

### 6. Route Map - Solo (route-map.tsx)

- Full screen map with route polyline (teal `#2dd4a8`)
- Route has waypoint dots along the path
- Top tabs: "AI Route" (active), "Alt Route", "Buddy Groups"
- Bottom floating panel (surface bg, rounded-t-2xl):
  - "Route Info" header
  - Walking stats summary
  - Destination info

### 7. Walking Solo (walking-solo.tsx)

- Full screen map with active route
- Top: "Walking Solo" label
- Bottom panel:
  - Buddy suggestion card: avatar + "Alex M. (Psych)" with walk direction
  - Prompt: "Need company?"
  - Button: "Switch to Buddy Mode" (accent, full width)
- Top buttons: "End Route" (surface) and "Switch to Buddy Mode" (accent)

### 8. Route Info (route-info.tsx)

- Dark overlay/panel screen
- Route details:
  - Safety score
  - Route description text
  - Checkpoints list with icons
  - Estimated time and distance
- Can be presented as a modal over the map

### 9. Walk Completed (walk-completed.tsx)

- Full screen dark background
- Top: Checkmark circle icon (accent green)
- Title: "Walk Completed"
- Subtitle: "You've safely arrived at your destination"
- Stats section with summary text
- Walking details:
  - "Walking buddy" info
  - Checkpoints visited
- Stats row at bottom: Distance | Time | Calories (3 columns)
- Bottom CTA: "Back to Home" (accent green, full width)

### 10. Settings & Profile (settings.tsx)

- Header with back arrow + "Settings & Profile"
- Avatar section with `Edit` badge
- Profile fields section:
  - Display Name
  - Title / Department
  - Email
  - Phone
  - Campus selection: "Student University - Main Campus"
- Emergency Contact section:
  - Contact Name
  - Phone
  - Relationship: "(816) 555-1990"
- Notification Preferences section with toggle rows:
  - "Notify when buddy joins you"
  - "Notify me of safety alerts near my location"
  - Toggle switches (accent green when on)

### 11. Finding Buddy (finding-buddy.tsx)

- Full screen dark background
- Centered layout:
  - `Users` icon with loading animation (pulsing or spinning)
  - Title: "Finding a Buddy..."
  - Subtitle: "Searching for verified students heading the same direction"
  - Loading progress bar (accent green, animated)

### 12. Buddy Found (buddy-found.tsx)

- Full screen dark background
- Centered layout:
  - `UserCheck` icon (accent green)
  - Title: "Buddy Found!"
  - Buddy card: avatar + name (e.g., "Jamie S.")
  - Button: "Start Navigation" or similar (accent green)
  - Subtitle: "Starting navigation..."

### 13. Route Map - Buddy (route-map-buddy.tsx)

- Same as route-map but with buddy mode active
- Top tabs: "AI Route" / "Alt Route" / "Buddy Groups"
- Map shows route with multiple user indicators
- Bottom panel:
  - "Unknown Givens" location info
  - Two buttons: "Estimate" (surface) and "Add to Walk" (accent green)

### 14. Buddy Route View (route variation within route-map-buddy)

- Variation of buddy map with different bottom panel content
- Shows estimated arrival and route details

### 15. Your Group (your-group.tsx)

- Header: "Your Group" with close (X) button
- List of buddy cards:
  - Each card: avatar + name + subtitle (e.g., "Alex M. (Psych)" + "Walking to: Library")
  - Each card: avatar + name + subtitle (e.g., "Jamie S." + "2 min away")
- Bottom CTA: "Leave Group" (danger red `#ef6461`, full width)
- Footer text: "You & your buddies will be notified when leaving"

### 16. Emergency Settings (emergency-settings.tsx)

- Header: "Emergency Settings"
- Privacy section:
  - Dropdown/selector: "Share w/ Contacts + Main Campus"
- Emergency Contact section:
  - First Name input
  - Last Name input
  - Phone input: "(816) 555-1990"
- Emergency Contact Permissions section with toggle rows:
  - "Notify when walk starts"
  - "Notify on route arrival"
  - "Notify on safe types"
  - "Receive default check-in..."
  - Each with accent green toggle
- Bottom CTA: "In Trip Use" (danger red, full width)

## Shared Components

### MapView.tsx
- Wraps `@rnmapbox/maps` MapView
- Props: `showRoute?: boolean`, `routeCoordinates?: [number, number][]`, `markers?: {lat, lng, label}[]`
- Uses dark style: `mapbox://styles/mapbox/dark-v11`
- Handles camera positioning and route line rendering
- Route line color: accent `#2dd4a8`, width 4

### RouteCard.tsx
- Surface background, rounded-2xl, 16px padding
- Props: `title`, `subtitle`, `stats?: {label, value}[]`
- Used in route-map, walking-solo, walk-completed

### BuddyCard.tsx
- Surface background, rounded-xl, 12px padding
- Horizontal layout: avatar circle (40px) + name/subtitle stack
- Props: `name`, `subtitle`, `avatarUrl?`
- Used in walking-solo, buddy-found, your-group

### ToggleRow.tsx
- Horizontal layout: label stack (title + description) + Switch
- Switch uses accent green when active
- Props: `label`, `description?`, `value`, `onToggle`
- Used in settings, emergency-settings

## Navigation Flow

```
Welcome → Profile Setup → Home (map)
Home → Search → Choose Mode → Route Map (solo) → Walking Solo → Walk Completed → Home
                            → Finding Buddy → Buddy Found → Route Map (buddy) → Your Group
Home → Settings → Emergency Settings
Walking Solo → Switch to Buddy Mode → Finding Buddy
```

## Constraints

- No code comments in any file
- All styling via NativeWind className props (no StyleSheet.create)
- Functional components with hooks only
- 16pt grid system for all spacing
- Safe area handling via `react-native-safe-area-context`
- No external state management libraries
- Mapbox access token will be provided via environment variable `EXPO_PUBLIC_MAPBOX_TOKEN`
