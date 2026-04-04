import fastapi
import uvicorn

from map import map

app = fastapi.FastAPI()

app.include_router(map, prefix="/map")

uvicorn.run(app, host="0.0.0.0", port=8000)