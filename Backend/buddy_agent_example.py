"""
Example: How to use the Buddy Matching Agent from your frontend.

This demonstrates the flow:
1. User registers their travel plan
2. Agent autonomously finds compatible buddies
3. Get meeting point and group info
"""

import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000/api"

# ==================== Example: Two Users Finding Each Other ====================

def example_buddy_matching():
    """Example: Two users looking for travel buddies near same location."""
    
    # User 1: Alice wants to travel from point A to point B at 6:00 PM
    alice_request = {
        "user_id": "alice_123",
        "start_lat": 32.876457,
        "start_lon": -117.236351,
        "dest_lat": 32.867836,
        "dest_lon": -117.233735,
        "travel_time": (datetime.now() + timedelta(hours=1)).isoformat(),
        "safety_preference": "buddy_required"  # Alice wants a buddy
    }
    
    # User 2: Bob has similar route, wants to travel same time
    bob_request = {
        "user_id": "bob_456",
        "start_lat": 32.876500,  # ~50m from Alice's start
        "start_lon": -117.236300,
        "dest_lat": 32.867800,   # ~50m from Alice's dest
        "dest_lon": -117.233700,
        "travel_time": (datetime.now() + timedelta(hours=1, minutes=5)).isoformat(),
        "safety_preference": "buddy_preferred"
    }
    
    print("=" * 60)
    print("BUDDY MATCHING AGENT EXAMPLE")
    print("=" * 60)
    
    # Alice registers
    print("\n1. Alice registers for travel...")
    alice_response = requests.post(
        f"{BASE_URL}/buddy/match",
        json=alice_request
    )
    alice_data = alice_response.json()
    print(f"   Status: {alice_data['status']}")
    print(f"   Message: {alice_data['message']}")
    
    # Bob registers - should match with Alice
    print("\n2. Bob registers for travel (agent autonomous matching)...")
    bob_response = requests.post(
        f"{BASE_URL}/buddy/match",
        json=bob_request
    )
    bob_data = bob_response.json()
    print(f"   Status: {bob_data['status']}")
    print(f"   Message: {bob_data['message']}")
    
    if bob_data['status'] == 'matched':
        print(f"   ✓ Matched with buddies: {bob_data['buddy_user_ids']}")
        group_id = bob_data['group_id']
        
        # Get Bob's buddy group info
        print(f"\n3. Bob checks his buddy group...")
        group_response = requests.get(
            f"{BASE_URL}/buddy/group/bob_456"
        )
        group_info = group_response.json()
        print(f"   Group ID: {group_info['group_id']}")
        print(f"   Buddies: {group_info['buddy_user_ids']}")
        print(f"   Total group size: {group_info['total_users']}")
        
        # Get safe meeting point
        print(f"\n4. Get safe meeting point for the group...")
        meeting_response = requests.get(
            f"{BASE_URL}/buddy/meeting-point/bob_456"
        )
        meeting_data = meeting_response.json()
        meeting = meeting_data['meeting_point']
        print(f"   Meeting at: ({meeting['meeting_lat']:.6f}, {meeting['meeting_lon']:.6f})")
        print(f"   Note: {meeting['description']}")
    
    # Check agent status
    print(f"\n5. Agent Status (autonomous tracking)...")
    status_response = requests.get(
        f"{BASE_URL}/buddy/agent-status"
    )
    status = status_response.json()
    print(f"   Agent Status: {status['agent_status']}")
    print(f"   Active Requests: {status['active_buddy_requests']}")
    print(f"   Successfully Matched Users: {status['successfully_matched_users']}")
    print(f"   Buddy Groups: {status['buddy_groups']}")
    
    print("\n" + "=" * 60)


# ==================== Example: Check Existing Group ====================

def example_check_group():
    """Example: User checking if they have a buddy group."""
    
    print("\nWould Alice be in a group?")
    group_response = requests.get(
        f"{BASE_URL}/buddy/group/alice_123"
    )
    group_info = group_response.json()
    
    if group_info['status'] == 'not_in_group':
        print(f"   Status: {group_info['message']}")
    else:
        print(f"   Group ID: {group_info['group_id']}")
        print(f"   Buddies: {group_info['buddy_user_ids']}")


# ==================== Frontend Integration Example ====================

def frontend_integration_example():
    """
    How this looks in your React Native frontend:
    
    ```typescript
    // SafeMap/app/(walking)/walking-solo.tsx
    const handleFindBuddy = async () => {
      const response = await fetch('http://localhost:8000/api/buddy/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          start_lat: routeStart.latitude,
          start_lon: routeStart.longitude,
          dest_lat: routeEnd.latitude,
          dest_lon: routeEnd.longitude,
          travel_time: new Date().toISOString(),
          safety_preference: 'buddy_required'
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'matched') {
        // Show buddies found!
        setBuddies(data.buddy_user_ids);
        
        // Get meeting point
        const meetingRes = await fetch(
          `http://localhost:8000/api/buddy/meeting-point/${userId}`
        );
        const meetingData = await meetingRes.json();
        setMeetingPoint({
          lat: meetingData.meeting_point.meeting_lat,
          lng: meetingData.meeting_point.meeting_lon
        });
      } else {
        // Still looking - poll again in 10 seconds
        setTimeout(handleFindBuddy, 10000);
      }
    };
    ```
    """
    pass


if __name__ == "__main__":
    example_buddy_matching()
    example_check_group()
    print("\n\nFrontend Integration Notes:")
    print(frontend_integration_example.__doc__)
