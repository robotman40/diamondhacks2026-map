import fastapi
import httpx
import os
import requests
import dotenv
from shapely.geometry import Point, LineString
from shapely.ops import unary_union
import datetime
from supabase_client import get_supabase_client
from collections import Counter
import math
dotenv.load_dotenv()

GRAPHOPPER_API_KEY = os.getenv('GH_API_KEY')

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
        route_coords = [(pt["lat"], pt["lng"]) for pt in r["points"]["coordinates"]]
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
    response = supabase.table("crime-data").select("Incident_date, crime_type, Latitude, Longitude").execute()
    crimes = response.data

    nearby_crimes = {}
    for route_id, corridor in route_corridors.items():
        matches = []
        for crime in crimes:
            point = Point(crime["Latitude"], crime["Longitude"])
            if corridor.contains(point):
                matches.append({
                    "lat": crime["Latitude"],
                    "lng": crime["Longitude"],
                    "crime_type": int(crime["crime_type"]),
                    "date": crime["Incident_date"]
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
    safest_route_id = safest_route["route_id"]
    
    return {
        "route": safest_route,
        "risk_score": route_scores[safest_route_id],
        "patterns": route_patterns[safest_route_id],
        "all_route_scores": route_scores,
        "all_patterns": route_patterns
    }
    

    # Recency multipliers
def recency_multiplier(incident_date_str):
    incident_date = datetime.strptime(incident_date_str, "%Y-%m-%d")
    days_old = (datetime.now() - incident_date).days
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


def find_stores_along_route(route_coords, stores_df, buffer_meters=100):
    buffer_deg = buffer_meters / 111000  # rough meters → degrees
    route_line = LineString(route_coords)
    route_corridor = route_line.buffer(buffer_deg)

    nearby_stores = []

    for _, store in stores_df.iterrows():
        store_point = Point(store["lat"], store["lng"])

        if route_corridor.contains(store_point):
            dist_deg = store_point.distance(route_line)
            dist_m = dist_deg * 111000

            nearby_stores.append({
                "name": store["name"],
                "category": store["category"],
                "lat": store["lat"],
                "lng": store["lng"],
                "distance_from_route_m": round(dist_m, 1)
            })

    # Sort closest stores first
    nearby_stores.sort(key=lambda s: s["distance_from_route_m"])

    return nearby_stores