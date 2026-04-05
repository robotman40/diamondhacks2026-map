# WalkBack — Campus Safety Navigation

WalkBack is a mobile safety app for college students walking alone or in groups at night. It calculates the safest walking route to your destination using well-lit corridors and high-traffic paths, then guides you with live GPS tracking.

**Solo Walk** — Get a safety-optimized route to your destination with a one-tap SOS button that alerts your emergency contact with your current location.

**Buddy System** — Match with nearby students heading in the same direction and walk together. Everyone in the group has access to the shared map and SOS feature.

---

## Tech Stack

- **Frontend**: React Native, Expo SDK 54, Expo Router, NativeWind (TailwindCSS)
- **Maps**: `react-native-maps` with Google Maps provider, dark map styling, live GPS tracking
- **Backend**: FastAPI (Python) deployed on Render — `POST /api/safest-route`
- **Routing**: GraphHopper with safety-aware path scoring
- **Storage**: AsyncStorage (on-device, no account required)

---

## Getting Started

### Prerequisites

- Node.js v20+
- Expo Go app on your phone
- A `.env.local` file in the `SafeMap/` directory with the following keys:

```
EXPO_PUBLIC_BACKEND_URL=
EXPO_PUBLIC_GH_API_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_MAPBOX_TOKEN=
```

### Install & Run

```bash
npm install
npx expo start --tunnel
```

Scan the QR code with Expo Go on your phone.

---

## Project Structure

```
SafeMap/
├── app/                  # Screens (file-based routing via Expo Router)
│   ├── (navigation)/     # Home, search, route map
│   ├── (walking)/        # Solo walk, walk completed
│   ├── (buddy)/          # Buddy matching, group walk
│   ├── (settings)/       # Settings, emergency contact
│   └── (onboarding)/     # Profile setup
├── components/           # Shared UI components (MapView, RouteCard, etc.)
├── hooks/                # useLocation
├── lib/                  # routeService, routeStore, profileService
└── constants/            # Colors, theme
```

---

## Backend

The backend repository handles safety-aware route calculation using GraphHopper and is deployed separately on Render. On first request after inactivity, the server may take up to 60 seconds to wake up — the app retries automatically.
