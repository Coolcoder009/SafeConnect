from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import load_models, response

app = FastAPI(
    title = "Safe Connect",
    version = "1.0.0",
    description = "Abuse & Crisis Intervention detection System"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Add your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"Insights API is healthy!"}

app.include_router(load_models.router, prefix="/api/load", tags=["Models"])
app.include_router(response.router, prefix="/api/response", tags=["Responses"])