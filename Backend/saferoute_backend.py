import fastapi
import uvicorn

from map import router as map

app = fastapi.FastAPI()

app.include_router(map, prefix="/map")

uvicorn.run(app, host="127.0.0.1", port=8000)