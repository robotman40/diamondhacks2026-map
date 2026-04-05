import fastapi
import httpx
import requests
import asyncio
import json
from shapely.geometry import Point, LineString
from shapely.ops import unary_union
import datetime
from supabase_client import get_supabase_client
from collections import Counter
import math
from config import get_bu_api_key, get_gh_creds
from pydantic import BaseModel
from typing import Optional

GRAPHOPPER_API_KEY = get_gh_creds()
GRAPHOPPER_URL = "https://graphhopper.com/api/1/route"

def get_routes(start_lat, start_lon, destination_lat,destination_long, alternatives=3):
    params = {
        "point": [f"{start_lat},{start_lon}", f"{destination_lat},{destination_long}"],
        "vehicle": "foot",
        "locale": "en",
        "points_encoded": "false",
        "calc_points": "true",
        "alternative_route.max_paths": alternatives,
        "key": GRAPHOPPER_API_KEY
    }
    response = requests.get(GRAPHOPPER_URL, params=params)
    data = response.json()
    routes = []
    for idx, r in enumerate(data["paths"]):
        # Handle GeoJSON LineString format from GraphHopper
        # coordinates are [lng, lat] pairs
        if isinstance(r.get("points"), dict) and "coordinates" in r["points"]:
            # Convert [lng, lat] to (lat, lng) tuples
            route_coords = [(pt[1], pt[0]) for pt in r["points"]["coordinates"]]
        else:
            route_coords = []
        
        routes.append({
            "route_id": f"route_{idx+1}",
            "distance_m": r["distance"],
            "time_s": r["time"]/1000,
            "coordinates": route_coords
        })
    return routes

def get_near_crimes(routes):
    BUFFER_DISTANCE_DEGREES = 0.00045  # Roughly ~50m, approx conversion

    route_corridors = {}
    for route in routes:
        line = LineString(route["coordinates"])
        corridor = line.buffer(BUFFER_DISTANCE_DEGREES)
        route_corridors[route["route_id"]] = corridor

    # --------------------------
    # STAGE 4: Query nearby crimes for each route
    # --------------------------
    supabase = get_supabase_client()
    response = supabase.table("crime-data").select("incident_date, crime_type, latitude, longitude").execute()
    crimes = response.data

    nearby_crimes = {}
    for route_id, corridor in route_corridors.items():
        matches = []
        for crime in crimes:
            point = Point(crime["latitude"], crime["longitude"])
            if corridor.contains(point):
                matches.append({
                    "lat": crime["latitude"],
                    "lng": crime["longitude"],
                    "crime_type": int(crime["crime_type"]),
                    "date": crime["incident_date"]
                })
        nearby_crimes[route_id] = matches
    return nearby_crimes


def analyze_crime_clustering(crimes, route_coords):
    """
    Calculate clustering score based on spatial variance of crimes.
    Returns value between 0-1 where 1 = highly clustered, 0 = spread out.
    """
    if len(crimes) <= 1:
        return 0.0
    
    # Calculate distance of each crime from route line
    route_line = LineString(route_coords)
    distances_from_route = []
    for crime in crimes:
        point = Point(crime["lat"], crime["lng"])
        dist_deg = point.distance(route_line)
        dist_m = dist_deg * 111000
        distances_from_route.append(dist_m)
    
    # Calculate spatial variance
    if not distances_from_route:
        return 0.0
    
    mean_dist = sum(distances_from_route) / len(distances_from_route)
    variance = sum((d - mean_dist) ** 2 for d in distances_from_route) / len(distances_from_route)
    std_dev = math.sqrt(variance)
    
    # Normalize: high std_dev means spread out (low clustering), low std_dev means clustered
    # Using sigmoid-like normalization: std_dev around 30m is neutral
    clustering_score = 1.0 / (1.0 + (std_dev / 20.0))
    return min(clustering_score, 1.0)


def detect_crime_surge(crimes):
    """
    Detect recent crime surge by analyzing ratio of recent to older crimes.
    Returns surge multiplier (>1.0 indicates surge).
    """
    if not crimes:
        return 1.0
    
    recent_count = 0
    older_count = 0
    
    for crime in crimes:
        incident_date = datetime.datetime.strptime(crime["date"], "%Y-%m-%d")
        days_old = (datetime.datetime.now() - incident_date).days
        if days_old <= 28:
            recent_count += 1
        else:
            older_count += 1
    
    # If more than 50% of crimes are recent, apply surge multiplier
    if older_count == 0 and recent_count > 0:
        return 1.5  # All crimes are recent
    elif older_count == 0:
        return 1.0
    
    recent_ratio = recent_count / (recent_count + older_count)
    if recent_ratio > 0.5:
        # Scale from 1.0 (at 50%) to 1.5 (at 100%)
        surge_multiplier = 1.0 + (recent_ratio - 0.5) * 1.0
        return surge_multiplier
    return 1.0


def calculate_crime_density(crimes, route_distance_m):
    """
    Calculate crime density normalized by route distance.
    Returns density multiplier (crimes per 1km of route).
    """
    if route_distance_m == 0:
        return 0.0
    
    density = len(crimes) / (route_distance_m / 1000)  # crimes per km
    # Normalize: assume 5 crimes per km is high risk (multiplier 1.0)
    density_multiplier = min(density / 5.0, 1.0)
    return density_multiplier


def analyze_crime_types(crimes):
    """
    Analyze crime type distribution to detect violent crime clustering.
    Returns type distribution multiplier.
    """
    if not crimes:
        return 1.0
    
    crime_counts = Counter(c["crime_type"] for c in crimes)
    violent_crimes = crime_counts.get(2, 0)  # Type 2 is violent
    total_crimes = len(crimes)
    
    violent_ratio = violent_crimes / total_crimes if total_crimes > 0 else 0
    
    # If more than 30% are violent, apply additional penalty
    if violent_ratio > 0.3:
        type_multiplier = 1.0 + (violent_ratio - 0.3) * 1.5
        return type_multiplier
    return 1.0


def identify_hotspots(crimes, route_coords):
    """
    Identify geographic hotspot overlay - proximity clusters of crimes.
    Returns hotspot multiplier based on density of crime clusters.
    """
    if len(crimes) <= 2:
        return 1.0
    
    # Group crimes into clusters: crimes within 50m of each other
    CLUSTER_THRESHOLD_M = 50
    clusters = []
    used = set()
    
    for i, crime1 in enumerate(crimes):
        if i in used:
            continue
        cluster = [crime1]
        used.add(i)
        
        for j, crime2 in enumerate(crimes[i+1:], start=i+1):
            if j in used:
                continue
            p1 = Point(crime1["lat"], crime1["lng"])
            p2 = Point(crime2["lat"], crime2["lng"])
            dist_deg = p1.distance(p2)
            dist_m = dist_deg * 111000
            
            if dist_m <= CLUSTER_THRESHOLD_M:
                cluster.append(crime2)
                used.add(j)
        
        if len(cluster) > 1:  # Only count clusters with 2+ crimes
            clusters.append(cluster)
    
    # More clusters = higher hotspot risk
    hotspot_density = len(clusters) / max(len(crimes), 1)
    hotspot_multiplier = 1.0 + hotspot_density * 0.5
    return hotspot_multiplier


def get_safest_route(routes, nearby_crimes):
    crime_weights = {1: 4, 2: 9, 3: 6}
    route_scores = {}
    route_patterns = {}
    
    for route in routes:
        route_id = route["route_id"]
        crimes = nearby_crimes[route_id]
        
        # Calculate base risk from individual crimes
        risk = 0
        for crime in crimes:
            base_weight = crime_weights[crime["crime_type"]]
            recency = recency_multiplier(crime["date"])
            dist_deg = point_to_route_distance(crime["lat"], crime["lng"], route["coordinates"])
            dist_m = dist_deg * 111000  # rough conversion deg → meters
            dist_mult = distance_multiplier(dist_m)
            risk += base_weight * recency * dist_mult
        
        # Analyze crime patterns and apply multipliers
        clustering_score = analyze_crime_clustering(crimes, route["coordinates"])
        surge_multiplier = detect_crime_surge(crimes)
        density_multiplier = calculate_crime_density(crimes, route["distance_m"])
        type_multiplier = analyze_crime_types(crimes)
        hotspot_multiplier = identify_hotspots(crimes, route["coordinates"])
        
        # Apply pattern-based adjustments to risk
        pattern_multiplier = 1.0
        pattern_multiplier *= surge_multiplier
        pattern_multiplier *= type_multiplier
        pattern_multiplier *= hotspot_multiplier
        
        # Clustering reduces risk slightly if crimes are spread out
        pattern_multiplier *= (1.0 + clustering_score * 0.3)
        
        # Density is already normalized, apply gently
        pattern_multiplier *= (1.0 + density_multiplier * 0.2)
        
        # Final risk with patterns
        final_risk = risk * pattern_multiplier
        
        route_scores[route_id] = final_risk
        route_patterns[route_id] = {
            "base_risk": risk,
            "pattern_multiplier": pattern_multiplier,
            "clustering_score": clustering_score,
            "surge_multiplier": surge_multiplier,
            "type_multiplier": type_multiplier,
            "hotspot_multiplier": hotspot_multiplier,
            "density_multiplier": density_multiplier,
            "crime_count": len(crimes)
        }

    safest_route = min(routes, key=lambda r: route_scores[r["route_id"]])
    #safest_route_id = safest_route["route_id"]
    
    # return {
    #     "route": safest_route,
    #     "risk_score": route_scores[safest_route_id],
    #     "patterns": route_patterns[safest_route_id],
    #     "all_route_scores": route_scores,
    #     "all_patterns": route_patterns
    # }
    return {
        "route": safest_route
    }
    

    # Recency multipliers
def recency_multiplier(incident_date_str):
    incident_date = datetime.datetime.strptime(incident_date_str, "%Y-%m-%d")
    days_old = (datetime.datetime.now() - incident_date).days
    if days_old <= 7:
        return 1.0
    elif days_old <= 30:
        return 0.7
    elif days_old <= 90:
        return 0.4
    else:
        return 0.15

    # Distance multiplier (meters)
def distance_multiplier(distance_m):
    if distance_m <= 20:
        return 1.0
    elif distance_m <= 50:
        return 0.7
    elif distance_m <= 100:
        return 0.4
    else:
        return 0.0

    # Helper to compute shortest distance from point to route (in degrees, approx)
def point_to_route_distance(point_lat, point_lng, route_coords):
    point = Point(point_lat, point_lng)
    line = LineString(route_coords)
    return point.distance(line)


async def find_stores_along_route(route_coords, buffer_meters=500, sample_size=5):
    """
    Find stores along a route by sampling key points and using Browser Use API.
    
    Uses Browser Use Cloud to search for stores near strategic points along the route.
    This reduces API calls by only checking sampled points instead of every point.
    
    Args:
        route_coords: List of (lat, lng) tuples representing the route
        buffer_meters: Search radius in meters around each sample point (default: 500m)
        sample_size: Number of points to sample along the route (default: 5)
    
    Returns:
        List of unique stores found along the route, sorted by distance from route.
        Store format: {"name": str, "category": str, "lat": float, "lng": float, ...}
    """
    if not route_coords or len(route_coords) == 0:
        return []
    
    # Await the async function
    #return await _find_stores_async(route_coords, buffer_meters, sample_size)
    
    midpoint_idx = len(route_coords) // 2
    midpoint_lat, midpoint_lng = route_coords[midpoint_idx]

    return await _find_stores_overpass(midpoint_lat,midpoint_lng, buffer_meters)


async def _find_stores_async(route_coords, buffer_meters=500, sample_size=1):
    """
    Find 5 nearby stores near the midpoint of the route using Overpass API (fast).
    Then check their hours using Browser Use API.
    """
    if not route_coords or len(route_coords) == 0:
        return []
    
    # Get the midpoint of the route
    midpoint_idx = len(route_coords) // 2
    midpoint_lat, midpoint_lng = route_coords[midpoint_idx]
    
    # Step 1: Use Overpass API to find 5 nearby stores (free, fast)
    stores_data = await _find_stores_overpass(midpoint_lat, midpoint_lng)
    return stores_data
    if not stores_data:
        return []
    
    # Step 2: Check hours of each store using Browser Use
    api_key = get_bu_api_key()
    if not api_key:
        print("Warning: BROWSER_USE_API_KEY not set. Returning stores without hours.")
        return stores_data
    
    enriched_stores = []
    async with httpx.AsyncClient() as client:
        for store in stores_data[:2]:
            store_name = store.get("name", "")
            store_type = store.get("type", "store")
            
            if not store_name:
                enriched_stores.append(store)
                continue
            
            # Create a task to check store hours
            hours_task = (
                f"Find the operating hours for '{store_name}'. "
                f"Use Google Maps or Google Search to look up the store. "
                f"Return ONLY a JSON object with this exact format (no markdown, no text): "
                f"{{'store_name': '{store_name}', 'hours': 'opening-closing hours (e.g., 9AM-10PM)', 'is_open_now': true/false}}"
            )
            
            try:
                # Create session to check hours
                headers = {"X-Browser-Use-API-Key": api_key, "Content-Type": "application/json"}
                
                hours_session = await client.post(
                    "https://api.browser-use.com/api/v3/sessions",
                    json={"task": hours_task, "model": "claude-sonnet-4.6"},
                    headers=headers,
                    timeout=120.0
                )
                
                if hours_session.status_code not in (200, 201):
                    enriched_stores.append(store)
                    continue
                
                hours_session_id = hours_session.json().get("id")
                if not hours_session_id:
                    enriched_stores.append(store)
                    continue
                
                # Poll for hours information
                import asyncio as aio
                hours_start = datetime.datetime.now()
                hours_data = None
                
                while True:
                    hours_status = await client.get(
                        f"https://api.browser-use.com/api/v3/sessions/{hours_session_id}",
                        headers=headers,
                        timeout=30.0
                    )
                    
                    if hours_status.status_code != 200:
                        break
                    
                    hours_status_data = hours_status.json()
                    status = hours_status_data.get("status")
                    
                    if status in ["idle", "stopped", "error", "timed_out"]:
                        output = hours_status_data.get("output")
                        if output:
                            try:
                                hours_data = json.loads(output)
                            except json.JSONDecodeError:
                                pass
                        break
                    
                    elapsed = (datetime.datetime.now() - hours_start).total_seconds()
                    if elapsed > 60:
                        break
                    
                    await aio.sleep(2)
                
                # Add store with hours information
                if hours_data:
                    store["hours"] = hours_data.get("hours", "Unknown")
                    store["is_open_now"] = hours_data.get("is_open_now")
                
                enriched_stores.append(store)
                
            except Exception as e:
                print(f"Error checking hours for {store_name}: {e}")
                enriched_stores.append(store)
    
    return enriched_stores


async def _find_stores_overpass(lat: float, lng: float, radius_meters: int = 1000):
    amenity_filter = "convenience|supermarket|restaurant|pharmacy|police"
    
    # "around" is faster than bbox for point-radius searches
    query = f"""
    [out:json][timeout:6];
    (
      node[amenity~"{amenity_filter}"](around:{radius_meters},{lat},{lng});
      way[amenity~"{amenity_filter}"](around:{radius_meters},{lat},{lng});
    );
    out center 10;
    """

    # Try multiple Overpass endpoints, use whichever responds first
    endpoints = [
        "https://overpass-api.de/api/interpreter",
        "https://overpass.kumi.systems/api/interpreter",
    ]

    async with httpx.AsyncClient() as client:
        tasks = [
            client.post(url, data=query, timeout=8.0)
            for url in endpoints
        ]
        # Race them — first one to respond wins
        data = None
        for coro in asyncio.as_completed(tasks):
            try:
                response = await coro
                if response.status_code == 200:
                    data = response.json()
                    break
            except Exception:
                continue

    if not data:
        return []

    all_stores = []
    for element in data.get('elements', []):
        elem_lat = element['center'].get('lat') if 'center' in element else element.get('lat')
        elem_lng = element['center'].get('lon') if 'center' in element else element.get('lon')
        if elem_lat is None or elem_lng is None:
            continue
        tags = element.get('tags', {})
        all_stores.append({
            'name': tags.get('name', tags.get('amenity', 'Unknown').capitalize()),
            'type': tags.get('amenity'),
            'lat': elem_lat,
            'lng': elem_lng,
        })

    all_stores.sort(key=lambda s: (s['lat'] - lat)**2 + (s['lng'] - lng)**2)

    seen, unique = set(), []
    for store in all_stores:
        if store['name'].lower() not in seen:
            seen.add(store['name'].lower())
            unique.append(store)

    return unique[:5]