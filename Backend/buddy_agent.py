"""
Fetch.ai Autonomous Buddy Matching Agent for SafeRoute.

This agent autonomously:
- Registers users looking for travel buddies
- Matches users with compatible routes and safety preferences
- Suggests safe meeting points
- Manages buddy coordination status
"""

import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, asdict
import math

@dataclass
class BuddyRequest:
    """User's request to find a travel buddy."""
    user_id: str
    start_lat: float
    start_lon: float
    dest_lat: float
    dest_lon: float
    travel_time: str  # ISO format datetime
    safety_preference: str  # "solo", "buddy_preferred", "buddy_required"
    group_size: int = 1
    created_at: str = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = datetime.now().isoformat()


class BuddyMatchingAgent:
    """Autonomous agent for matching SafeRoute travelers."""
    
    def __init__(self):
        self.active_requests: Dict[str, BuddyRequest] = {}
        self.matched_groups: Dict[str, List[str]] = {}  # group_id -> [user_ids]
        self.match_history: List[Dict] = []
    
    def register_buddy_request(self, request: BuddyRequest) -> Dict[str, Any]:
        """Register a user looking for travel buddies."""
        self.active_requests[request.user_id] = request
        
        # Autonomously find matches
        matches = self._find_matches(request)
        
        if matches:
            group_id = self._create_group(request.user_id, matches)
            self.match_history.append({
                "timestamp": datetime.now().isoformat(),
                "group_id": group_id,
                "users": [request.user_id] + matches,
                "status": "matched"
            })
            return {
                "success": True,
                "message": f"Matched with {len(matches)} buddy(ies)!",
                "group_id": group_id,
                "buddy_user_ids": matches,
                "status": "matched"
            }
        else:
            self.match_history.append({
                "timestamp": datetime.now().isoformat(),
                "user_id": request.user_id,
                "status": "waiting"
            })
            return {
                "success": True,
                "message": "Registered! We're looking for buddies for you.",
                "group_id": None,
                "status": "waiting_for_match"
            }
    
    def _find_matches(self, request: BuddyRequest) -> List[str]:
        """
        Autonomously find compatible buddy requests.
        Returns list of matching user_ids.
        """
        matches = []
        
        for user_id, other_request in self.active_requests.items():
            if user_id == request.user_id:
                continue
            
            # Don't rematch already grouped users
            if any(user_id in group for group in self.matched_groups.values()):
                continue
            
            # Check compatibility
            compatibility_score = self._calculate_compatibility(request, other_request)
            
            # Match if score is high enough (threshold: 0.7 = 70% compatible)
            if compatibility_score >= 0.7:
                matches.append(user_id)
        
        return matches[:2]  # Max 2 additional buddies to keep group small
    
    def _calculate_compatibility(self, req1: BuddyRequest, req2: BuddyRequest) -> float:
        """
        Calculate compatibility score (0.0 - 1.0) between two buddy requests.
        Factors: route overlap, time proximity, safety preferences.
        """
        score = 0.0
        
        # 1. Route overlap (30% weight)
        route_overlap = self._calculate_route_overlap(req1, req2)
        score += route_overlap * 0.3
        
        # 2. Time proximity (40% weight)
        time_proximity = self._calculate_time_proximity(req1.travel_time, req2.travel_time)
        score += time_proximity * 0.4
        
        # 3. Safety preference alignment (30% weight)
        safety_match = self._calculate_safety_alignment(req1.safety_preference, req2.safety_preference)
        score += safety_match * 0.3
        
        return min(score, 1.0)
    
    def _calculate_route_overlap(self, req1: BuddyRequest, req2: BuddyRequest) -> float:
        """Calculate how much the routes overlap (0.0 - 1.0)."""
        # Euclidean distance between start points (rough estimate)
        start_dist = self._degrees_to_km(
            math.sqrt((req1.start_lat - req2.start_lat)**2 + (req1.start_lon - req2.start_lon)**2)
        )
        
        # Euclidean distance between end points
        end_dist = self._degrees_to_km(
            math.sqrt((req1.dest_lat - req2.dest_lat)**2 + (req1.dest_lon - req2.dest_lon)**2)
        )
        
        # If both start and end are within 2km, consider high overlap
        if start_dist < 2 and end_dist < 2:
            return 1.0
        elif start_dist < 5 and end_dist < 5:
            return 0.7
        else:
            return max(0, 1.0 - (start_dist + end_dist) / 20)
    
    def _calculate_time_proximity(self, time1: str, time2: str) -> float:
        """Calculate how close the travel times are (0.0 - 1.0)."""
        try:
            dt1 = datetime.fromisoformat(time1)
            dt2 = datetime.fromisoformat(time2)
            time_diff_minutes = abs((dt1 - dt2).total_seconds() / 60)
            
            # Within 30 minutes = perfect match, 120+ minutes = no match
            if time_diff_minutes <= 30:
                return 1.0
            elif time_diff_minutes <= 120:
                return 1.0 - (time_diff_minutes - 30) / 90
            else:
                return 0.0
        except:
            return 0.5
    
    def _calculate_safety_alignment(self, pref1: str, pref2: str) -> float:
        """Check if safety preferences align."""
        if pref1 == pref2:
            return 1.0
        if pref1 in ["buddy_preferred", "buddy_required"] and pref2 in ["buddy_preferred", "buddy_required"]:
            return 0.9
        return 0.5
    
    def _degrees_to_km(self, degrees: float) -> float:
        """Rough conversion from degrees to kilometers."""
        return degrees * 111  # 1 degree ≈ 111 km
    
    def _create_group(self, initiator_id: str, buddy_ids: List[str]) -> str:
        """Create a buddy group and return group ID."""
        group_id = f"group_{datetime.now().timestamp()}"
        self.matched_groups[group_id] = [initiator_id] + buddy_ids
        return group_id
    
    def get_buddy_group(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get the buddy group info for a user."""
        for group_id, users in self.matched_groups.items():
            if user_id in users:
                return {
                    "group_id": group_id,
                    "users": users,
                    "buddy_count": len(users) - 1
                }
        return None
    
    def get_meeting_point(self, user_id: str) -> Optional[Dict[str, float]]:
        """
        Calculate safe meeting point (midpoint between all group members).
        Uses centroids for multiple users.
        """
        group = self.get_buddy_group(user_id)
        if not group:
            return None
        
        user_requests = [self.active_requests.get(uid) for uid in group["users"] if uid in self.active_requests]
        if not user_requests:
            return None
        
        # Calculate centroid of all start positions
        avg_lat = sum(req.start_lat for req in user_requests) / len(user_requests)
        avg_lon = sum(req.start_lon for req in user_requests) / len(user_requests)
        
        return {
            "meeting_lat": avg_lat,
            "meeting_lon": avg_lon,
            "description": "Safe meeting point - centroid of all starting locations"
        }
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get current agent status."""
        active_count = len(self.active_requests)
        matched_count = sum(len(users) for users in self.matched_groups.values())
        
        return {
            "agent_status": "running",
            "timestamp": datetime.now().isoformat(),
            "active_buddy_requests": active_count,
            "successfully_matched_users": matched_count,
            "buddy_groups": len(self.matched_groups),
            "total_matches_history": len(self.match_history)
        }


# Global agent instance
buddy_agent = BuddyMatchingAgent()
