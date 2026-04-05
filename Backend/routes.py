from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Any, Optional
from map import (
    get_routes,
    get_near_crimes,
    get_safest_route,
    find_stores_along_route
)
from buddy_agent import buddy_agent, BuddyRequest

router = APIRouter(prefix="/api", tags=["routes"])

# ==================== Pydantic Models ====================

class RouteResponse(BaseModel):
    route_id: str
    distance_m: float
    time_s: float
    coordinates: List[tuple]

class SafestRouteResponse(BaseModel):
    route: dict
    amenities: Any

class BuddyMatchRequest(BaseModel):
    """Request to find a travel buddy."""
    user_id: str
    start_lat: float
    start_lon: float
    dest_lat: float
    dest_lon: float
    travel_time: str  # ISO format datetime
    safety_preference: str = "buddy_preferred"  # solo, buddy_preferred, buddy_required

class BuddyMatchResponse(BaseModel):
    success: bool
    message: str
    group_id: Optional[str]
    buddy_user_ids: Optional[List[str]] = None
    status: str  # matched, waiting_for_match

# ==================== Endpoints ====================

@router.post("/safest-route", response_model=SafestRouteResponse)
async def find_safest_route(
    start_lat: float = Query(..., description="Starting latitude"),
    start_lon: float = Query(..., description="Starting longitude"),
    dest_lat: float = Query(..., description="Destination latitude"),
    dest_lon: float = Query(..., description="Destination longitude")
):
    """
    Find the safest route between two coordinates based on crime data analysis.
    
    Takes start and end coordinates and analyzes multiple route options to return 
    the safest route considering crime type, recency, density, clustering, and hotspots.
    """
    try:
        # Get multiple route options
        routes = get_routes(start_lat, start_lon, dest_lat, dest_lon, alternatives=3)
        
        if not routes or not isinstance(routes, list):
            raise ValueError(f"Invalid routes data: {routes}")
        
        # Analyze crime data for each route
        nearby_crimes = get_near_crimes(routes)
        
        if not isinstance(nearby_crimes, dict):
            raise ValueError(f"Invalid nearby_crimes data: {nearby_crimes}")
        
        # Get the safest route based on crime analysis
        result = get_safest_route(routes, nearby_crimes)
        
        if not isinstance(result, dict) or "route" not in result:
            raise ValueError(f"Invalid result from get_safest_route: {result}")
        
        safest_route = result["route"]
        
        if not isinstance(safest_route, dict):
            raise ValueError(f"safest_route is not a dict: {safest_route}")
        
        # Find stores and amenities along the safest route
        amenity_data = await find_stores_along_route(safest_route["coordinates"])
        
        return {
            "route": safest_route,
            "amenities": amenity_data
        }
    except Exception as e:
        import traceback
        print(f"Error traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error finding safest route: {str(e)}")


# ==================== Buddy Matching Endpoints ====================

@router.post("/buddy/match", response_model=BuddyMatchResponse)
async def find_travel_buddy(request: BuddyMatchRequest):
    """
    Register for buddy matching. The agent automatically finds compatible travelers.
    
    Returns:
    - If matches found: Matched buddy IDs and group ID
    - If no matches yet: Status "waiting_for_match" - keep polling
    """
    try:
        buddy_req = BuddyRequest(
            user_id=request.user_id,
            start_lat=request.start_lat,
            start_lon=request.start_lon,
            dest_lat=request.dest_lat,
            dest_lon=request.dest_lon,
            travel_time=request.travel_time,
            safety_preference=request.safety_preference
        )
        
        result = buddy_agent.register_buddy_request(buddy_req)
        
        return BuddyMatchResponse(
            success=result["success"],
            message=result["message"],
            group_id=result.get("group_id"),
            buddy_user_ids=result.get("buddy_user_ids"),
            status=result["status"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in buddy matching: {str(e)}")


@router.get("/buddy/group/{user_id}")
async def get_buddy_group(user_id: str):
    """Get the buddy group information for a user."""
    try:
        group = buddy_agent.get_buddy_group(user_id)
        
        if not group:
            return {
                "user_id": user_id,
                "status": "not_in_group",
                "message": "User is not in any buddy group yet"
            }
        
        return {
            "user_id": user_id,
            "group_id": group["group_id"],
            "buddy_count": group["buddy_count"],
            "total_users": len(group["users"]),
            "buddy_user_ids": [uid for uid in group["users"] if uid != user_id]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting buddy group: {str(e)}")


@router.get("/buddy/meeting-point/{user_id}")
async def get_meeting_point(user_id: str):
    """Get the safe meeting point for a buddy group."""
    try:
        meeting = buddy_agent.get_meeting_point(user_id)
        
        if not meeting:
            return {
                "user_id": user_id,
                "status": "no_meeting_point",
                "message": "User is not in a buddy group"
            }
        
        return {
            "user_id": user_id,
            "meeting_point": meeting,
            "message": "Safe meeting point calculated"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting meeting point: {str(e)}")


@router.get("/buddy/agent-status")
async def get_agent_status():
    """Get current status of the buddy matching agent."""
    try:
        return buddy_agent.get_agent_status()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting agent status: {str(e)}")


@router.get("/health")

async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
