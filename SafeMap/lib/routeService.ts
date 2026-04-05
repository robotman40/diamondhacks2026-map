const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://147.135.115.199:8000";

export type Route = {
  id: string;
  /** Coordinates in [longitude, latitude] order (matches MapView routeCoordinates) */
  coordinates: [number, number][];
  distanceMeters: number;
  timeSeconds: number;
};

export type RouteWithAmenities = {
  route: Route;
  amenities: unknown;
};

// UCSD Library Walk fallback — used when the backend is unreachable.
const FALLBACK_ROUTES: Route[] = [
  {
    id: "route_1",
    coordinates: [
      [-117.2365, 32.8793],
      [-117.2367, 32.8799],
      [-117.2369, 32.8806],
      [-117.2371, 32.8812],
      [-117.2372, 32.8819],
      [-117.2373, 32.8825],
      [-117.2374, 32.8831],
      [-117.2374, 32.8836],
    ],
    distanceMeters: 600,
    timeSeconds: 450,
  },
];

/**
 * Fetch the safest walking route from the backend.
 * Calls POST /api/safest-route with start/dest coordinates as query params.
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

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Backend ${response.status}`);

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
    if (!r || !Array.isArray(r.coordinates)) return FALLBACK_ROUTES;

    // Backend returns coordinates as [lat, lng] — MapView expects [lng, lat]
    const route: Route = {
      id: r.route_id ?? "safest",
      distanceMeters: r.distance_m ?? 0,
      timeSeconds: r.time_s ?? 0,
      coordinates: r.coordinates.map(([lat, lng]) => [lng, lat] as [number, number]),
    };

    return [route];
  } catch {
    return FALLBACK_ROUTES;
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
