# Fetch.ai Buddy Matching Agent - Implementation Guide

## Overview

This autonomous agent matches SafeRoute users who have compatible travel routes and timing, enabling safer group travel without manual coordination.

**Key Feature:** The agent runs autonomously - it continuously monitors buddy requests and matches users in real-time using a sophisticated compatibility algorithm.

## How It Works

### 1. **Agent Registration**
Users register their travel plans:
- **Route:** Start and destination coordinates
- **Time:** When they plan to travel (ISO format datetime)
- **Preference:** `solo`, `buddy_preferred`, or `buddy_required`

### 2. **Autonomous Matching**
The agent scores every new request against existing requests using:

**Route Overlap Score (30% weight)**
- Calculates distance between start/end points
- High overlap = same departing area & destination
- Threshold: ~2km to start, ~5km acceptable

**Time Proximity Score (40% weight)** 
- Checks if travel times align
- Within 30 minutes = perfect match (1.0)
- 30-120 minutes = partial match (0.9-0.1)
- 120+ minutes = no match (0.0)

**Safety Preference Alignment (30% weight)**
- Both want buddies? Perfect match
- One solo, one wants buddy? Penalized
- Result factors are normalized

**Overall Compatibility Threshold: 70%** - Must score ≥0.7 to match

### 3. **Group Formation**
- Multiple users with >70% compatibility are grouped
- Groups capped at 3 people (user + 2 buddies)
- Meeting point calculated as centroid of start locations

## API Endpoints

### `POST /api/buddy/match`
Register for buddy matching.

**Request:**
```json
{
  "user_id": "alice_123",
  "start_lat": 32.876457,
  "start_lon": -117.236351,
  "dest_lat": 32.867836,
  "dest_lon": -117.233735,
  "travel_time": "2026-04-05T19:00:00",
  "safety_preference": "buddy_required"
}
```

**Response (if matched):**
```json
{
  "success": true,
  "message": "Matched with 1 buddy!",
  "group_id": "group_1712318400.0",
  "buddy_user_ids": ["bob_456"],
  "status": "matched"
}
```

**Response (if waiting):**
```json
{
  "success": true,
  "message": "Registered! We're looking for buddies for you.",
  "group_id": null,
  "status": "waiting_for_match"
}
```

### `GET /api/buddy/group/{user_id}`
Get current buddy group info.

**Response:**
```json
{
  "user_id": "alice_123",
  "group_id": "group_1712318400.0",
  "buddy_count": 1,
  "total_users": 2,
  "buddy_user_ids": ["bob_456"]
}
```

### `GET /api/buddy/meeting-point/{user_id}`
Get the safe meeting point for the buddy group.

**Response:**
```json
{
  "user_id": "alice_123",
  "meeting_point": {
    "meeting_lat": 32.876478,
    "meeting_lon": -117.236325,
    "description": "Safe meeting point - centroid of all starting locations"
  },
  "message": "Safe meeting point calculated"
}
```

### `GET /api/buddy/agent-status`
Check agent performance metrics.

**Response:**
```json
{
  "agent_status": "running",
  "timestamp": "2026-04-05T18:30:45.123456",
  "active_buddy_requests": 5,
  "successfully_matched_users": 12,
  "buddy_groups": 4,
  "total_matches_history": 23
}
```

## Frontend Integration

### ReactNative (SafeMap)

In `SafeMap/app/(navigation)/choose-mode.tsx`:

```typescript
export default function ChooseMode() {
  const [findingBuddy, setFindingBuddy] = useState(false);
  const [buddyInfo, setBuddyInfo] = useState(null);

  const handleFindBuddy = async () => {
    setFindingBuddy(true);
    
    try {
      // 1. Register for buddy matching
      const matchResponse = await fetch(
        'http://localhost:8000/api/buddy/match',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            start_lat: userLocation.latitude,
            start_lon: userLocation.longitude,
            dest_lat: destination.latitude,
            dest_lon: destination.longitude,
            travel_time: new Date().toISOString(),
            safety_preference: 'buddy_required'
          })
        }
      );

      const matchData = await matchResponse.json();

      if (matchData.status === 'matched') {
        // Buddies found immediately!
        
        // 2. Get meeting point
        const meettingRes = await fetch(
          `http://localhost:8000/api/buddy/meeting-point/${userId}`
        );
        const meetingData = await meettingRes.json();

        setBuddyInfo({
          buddies: matchData.buddy_user_ids,
          groupId: matchData.group_id,
          meetingPoint: meetingData.meeting_point,
          status: 'matched'
        });

        // Navigate to show buddies
        router.push('/walking-with-buddy');
      } else {
        // Still looking - poll every 10 seconds
        setBuddyInfo({ status: 'waiting' });
        
        const pollInterval = setInterval(async () => {
          const groupRes = await fetch(
            `http://localhost:8000/api/buddy/group/${userId}`
          );
          const groupData = await groupRes.json();

          if (groupData.group_id) {
            // Match found! Stop polling
            clearInterval(pollInterval);
            // ... get meeting point and navigate
          }
        }, 10000);
      }
    } catch (error) {
      console.error('Buddy matching error:', error);
      setFindingBuddy(false);
    }
  };

  return (
    <View>
      <Button 
        title={findingBuddy ? "Finding Buddy..." : "Find a Travel Buddy"}
        onPress={handleFindBuddy}
        loading={findingBuddy}
      />
      {buddyInfo?.status === 'matched' && (
        <Text>Found {buddyInfo.buddies.length} buddy(ies)! Meet at ({buddyInfo.meetingPoint.meeting_lat.toFixed(5)}, {buddyInfo.meetingPoint.meeting_lon.toFixed(5)})</Text>
      )}
    </View>
  );
}
```

### New Screen: `SafeMap/app/(walking)/walking-with-buddy.tsx`

```typescript
export default function WalkingWithBuddy() {
  const [groupInfo, setGroupInfo] = useState(null);
  const [meetingPoint, setMeetingPoint] = useState(null);

  useEffect(() => {
    const loadBuddyInfo = async () => {
      const res = await fetch(`http://localhost:8000/api/buddy/group/${userId}`);
      const data = await res.json();
      setGroupInfo(data);

      const meetRes = await fetch(
        `http://localhost:8000/api/buddy/meeting-point/${userId}`
      );
      const meetData = await meetRes.json();
      setMeetingPoint(meetData.meeting_point);
    };

    loadBuddyInfo();
  }, []);

  return (
    <View>
      <Text>Traveling with {groupInfo?.buddy_count} buddy(ies)</Text>
      <MapView
        meetingPoints={[meetingPoint]}
        buddyLocations={groupInfo?.buddy_user_ids}
      />
      <RouteCard meetingPoint={meetingPoint} />
    </View>
  );
}
```

## Advanced Features

### Polling for Delayed Matches
```typescript
async function waitForBuddy(userId, maxWaitSeconds = 60) {
  const startTime = Date.now();
  
  while ((Date.now() - startTime) / 1000 < maxWaitSeconds) {
    const res = await fetch(`http://localhost:8000/api/buddy/group/${userId}`);
    const data = await res.json();
    
    if (data.group_id) {
      return data;  // Buddy matched!
    }
    
    await new Promise(r => setTimeout(r, 10000));  // Wait 10 seconds
  }
  
  throw new Error('Timeout waiting for buddy');
}
```

### Integration with Safe Route Finding
```typescript
async function findSafestGroupRoute(groupId) {
  // Get all users in group
  const groupRes = await fetch(`http://localhost:8000/api/buddy/group/${userId}`);
  const group = await groupRes.json();
  
  // Find safest route to meeting point and beyond
  const routeRes = await fetch('http://localhost:8000/api/safest-route', {
    params: {
      start_lat: userLocation.latitude,
      start_lon: userLocation.longitude,
      dest_lat: meetingPoint.meeting_lat,
      dest_lon: meetingPoint.meeting_lon
    }
  });
  
  return routeRes.json();
}
```

## Architecture Benefits

1. **Autonomous** - No server voting or user interaction needed
2. **Scalable** - Matches O(n) requests in real-time
3. **Fair** - Scoring is objective (distance, time, preferences)
4. **Safe** - Groups small (3 max) and can reject solo travelers
5. **Extensible** - Easy to add new scoring factors (reputation, friend lists, etc.)

## Testing the Agent

Run the example:
```bash
python buddy_agent_example.py
```

This will:
1. Register two compatible users
2. Show them getting matched
3. Display the buddy group info
4. Calculate the meeting point
5. Show agent status metrics

## Future Enhancements

- **Reputation scoring:** Prefer users with good safety records
- **Friend integration:** Prioritize matching with known friends
- **Dynamic rerouting:** If buddy doesn't show, suggest alternate meeting points
- **Emergency escalation:** If buddy reports incident, alert others in group
- **Feedback loop:** Score accuracy improves based on actual matches
- **Group chat:** Built-in messaging for group coordination

## Why Fetch.ai Works Here

The buddy matching problem is perfect for autonomous agents:
- **No central authority needed** - Agent makes independent matching decisions
- **Continuous operation** - Runs 24/7 matching incoming requests
- **No human bottleneck** - Scales instantly with new users
- **Trustless matching** - Algorithm is transparent and fair
- **Real-time coordination** - Meeting points calculated instantly
