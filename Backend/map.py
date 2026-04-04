import fastapi
import httpx
import os
import dotenv

dotenv.load_dotenv()

router = fastapi.APIRouter()

http_client = httpx.AsyncClient()

@router.get("/calculate_route")
async def calculate_route(f_lat, f_lon, l_lat, l_lon, points_to_exclude):
    response = await http_client.post(
        'https://graphhopper.com/api/1/route', 
        
        json={
            "points": [
                [f_lon, f_lat],
                [l_lon, l_lat]
            ],
            "profile": "foot",
            "elevation": False,
            "instructions": True,
            "points_encoded": False,
            "calc_points": True,
            "custom_model" : {
                "priority": [{
                    "if": "in_restricted_zone",
                    "multiply_by": 0.2
                }],
                "areas": {
                    "restricted_zone": {
                        "type": "Feature",
                        "properties": {},
                        "geometry": {
                            "type": "Polygon",
                            "coordinates": [points_to_exclude]
                        }
                    }
                }
            }
        },
        params={ "key": os.getenv('API_KEY') },
        headers={"Content-Type": "application/json"}
    )

    return response.json()