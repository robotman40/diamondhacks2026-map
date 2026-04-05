const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? "https://diamond-safety.onrender.com";

export type Route = {
  id: string;
  /** Coordinates in [longitude, latitude] order (matches MapView routeCoordinates) */
  coordinates: [number, number][];
  distanceMeters: number;
  timeSeconds: number;
  amenities?: unknown;
};

// Fallback route (Library Walk N-S axis) used when the backend is unreachable.
// Coordinates sit on the pedestrian path — no building phase-through.
const FALLBACK_ROUTE: Route = {
  id: "fallback_library_walk",
  coordinates: [
    [-117.2374, 32.8793],
    [-117.2374, 32.8798],
    [-117.2374, 32.8803],
    [-117.2374, 32.8808],
    [-117.2374, 32.8813],
    [-117.2374, 32.8818],
    [-117.2374, 32.8823],
    [-117.2374, 32.8828],
    [-117.2374, 32.8833],
    [-117.2374, 32.8836],
  ],
  distanceMeters: 540,
  timeSeconds: 390,
};

/**
 * Fetch the safest walking route from the backend.
 * POST /api/safest-route?start_lat=&start_lon=&dest_lat=&dest_lon=
 *
 * Falls back to a hardcoded Library Walk route if the server is unreachable.
 */
export async function fetchRoutes(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number
): Promise<Route[]> {
  const url =
    `${BACKEND_URL}/api/safest-route` +
    `?start_lat=${originLat}&start_lon=${originLng}` +
    `&dest_lat=${destLat}&dest_lon=${destLng}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[routeService] Backend returned ${response.status}`);
      return [FALLBACK_ROUTE];
    }

    const data = await response.json() as {
      route: {
        route_id?: string;
        distance_m?: number;
        time_s?: number;
        coordinates?: [number, number][];
      };
      amenities: unknown;
    };

    const r = data.route;
    if (!r || !Array.isArray(r.coordinates) || r.coordinates.length === 0) {
      console.warn("[routeService] Invalid route data from backend, using fallback");
      return [FALLBACK_ROUTE];
    }

    // Backend returns coordinates as [lat, lng] — MapView expects [lng, lat]
    const route: Route = {
      id: r.route_id ?? "safest",
      distanceMeters: r.distance_m ?? 0,
      timeSeconds: r.time_s ?? 0,
      coordinates: r.coordinates.map(([lat, lng]) => [lng, lat] as [number, number]),
      amenities: data.amenities,
    };

    return [route];
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn("[routeService] Backend unreachable, using fallback:", err);
    return [FALLBACK_ROUTE];
  }
}

export function formatDistance(meters: number): string {
  const miles = meters / 1609.34;
  return miles < 0.1 ? `${Math.round(meters)} m` : `${miles.toFixed(1)} mi`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  return mins < 1 ? "< 1 min" : `${mins} min`;
}
