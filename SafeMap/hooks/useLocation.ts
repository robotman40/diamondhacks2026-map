import { useEffect, useState } from "react";
import * as Location from "expo-location";

export type Coords = {
  latitude: number;
  longitude: number;
};

type LocationState = {
  coords: Coords | null;
  /** true while the initial fix is pending */
  loading: boolean;
  /** "denied" | error message | null */
  error: string | null;
};

// UCSD campus centre — used as fallback when permission is denied or unavailable
export const UCSD_DEFAULT: Coords = { latitude: 32.8801, longitude: -117.234 };

export function useLocation(): LocationState {
  const [state, setState] = useState<LocationState>({
    coords: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== "granted") {
        setState({ coords: UCSD_DEFAULT, loading: false, error: "denied" });
        return;
      }

      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (!cancelled) {
          setState({
            coords: { latitude: loc.coords.latitude, longitude: loc.coords.longitude },
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            coords: UCSD_DEFAULT,
            loading: false,
            error: err instanceof Error ? err.message : "Location unavailable",
          });
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return state;
}
