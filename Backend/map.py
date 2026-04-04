import fastapi
import httpx
import os
import requests
import dotenv
from shapely.geometry import Point, LineString
from shapely.ops import unary_union
import datetime

dotenv.load_dotenv()

router = fastapi.APIRouter()

GRAPHOPPER_API_KEY = os.getenv('GH_API_KEY')

@router.get("/get_routes")
def get_routes(start_lat, start_lon, destinationlat,destination_long, alternatives=3):
    params = {
        "point": [f"{start_lat},{start_lon}", f"{destinationlat},{destination_long}"],
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

@router.get('/get_near_crimes')
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
    nearby_crimes = {}
    for route_id, corridor in route_corridors.items():
        matches = []
        for _, crime in crime_df.iterrows():
            point = Point(crime["lat"], crime["lng"])
            if corridor.contains(point):
                matches.append(crime.to_dict())
        nearby_crimes[route_id] = matches
    return nearby_crimes



crime_weights = {1: 2, 2: 8, 3: 3}

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

# Compute risk for each route
route_scores = {}
for route in routes:
    route_id = route["route_id"]
    risk = 0
    for crime in nearby_crimes[route_id]:
        base_weight = crime_weights[crime["crime_type"]]
        recency = recency_multiplier(crime["date"])
        dist_deg = point_to_route_distance(crime["lat"], crime["lng"], route["coordinates"])
        dist_m = dist_deg * 111000  # rough conversion deg → meters
        dist_mult = distance_multiplier(dist_m)
        risk += base_weight * recency * dist_mult
    route_scores[route_id] = risk