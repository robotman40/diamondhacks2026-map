// Route service — fetches pedestrian routes from the FastAPI + GraphHopper backend.
//
// Backend endpoint: GET /map/get_routes
//   ?start_lat=&start_lon=&destinationlat=&destination_long=&alternatives=3
//
// Set EXPO_PUBLIC_BACKEND_URL in .env.local to point at the backend.
// Example (LAN dev): EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:8000

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export type Route = {
  id: string;
  /** Coordinates in [longitude, latitude] order (matches MapView routeCoordinates) */
  coordinates: [number, number][];
  distanceMeters: number;
  timeSeconds: number;
};

// UCSD Library Walk fallback — used when the backend is unreachable.
// Coordinates trace the actual pedestrian path rather than a straight line.
const FALLBACK_ROUTES: Route[] = [
  {
    id: "route_1",
    coordinates: [
      [-117.2365, 32.8793], // Price Center East entrance
      [-117.2367, 32.8799], // Library Walk – south section
      [-117.2369, 32.8806],
      [-117.2371, 32.8812],
      [-117.2372, 32.8819], // Library Walk – mid section
      [-117.2373, 32.8825],
      [-117.2374, 32.8831], // Approaching Geisel Library
      [-117.2374, 32.8836], // Geisel Library entrance
    ],
    distanceMeters: 600,
    timeSeconds: 450,
  },
];

/**
 * Fetch walking routes from the backend.
 *
 * @param originLat      Starting latitude  (e.g. 32.8793)
 * @param originLng      Starting longitude (e.g. -117.2365)
 * @param destLat        Destination latitude
 * @param destLng        Destination longitude
 * @param alternatives   Number of alternative routes (default 3)
 */
export async function fetchRoutes(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
  alternatives = 3
): Promise<Route[]> {
  const url =
    `${BACKEND_URL}/map/get_routes` +
    `?start_lat=${originLat}&start_lon=${originLng}` +
    `&destinationlat=${destLat}&destination_long=${destLng}` +
    `&alternatives=${alternatives}`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!response.ok) throw new Error(`Backend ${response.status}`);

    const data = await response.json();

    // Backend returns coordinates as [lat, lng] pairs.
    // MapView expects [lng, lat] — swap here.
    return (data as Array<{
      route_id: string;
      distance_m: number;
      time_s: number;
      coordinates: [number, number][];
    }>).map((r) => ({
      id: r.route_id,
      distanceMeters: r.distance_m,
      timeSeconds: r.time_s,
      coordinates: r.coordinates.map(([lat, lng]) => [lng, lat] as [number, number]),
    }));
  } catch {
    // Backend not reachable — return fallback so the map always shows something.
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
