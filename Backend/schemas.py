from pydantic import BaseModel

class DatabaseSchema(BaseModel):
    incident_date: str
    crime_type: str
    latitude: float
    longitude: float