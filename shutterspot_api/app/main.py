from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.database import engine, Base
from app.routers import clients, shoots, proposals, client_shoots, client_proposals, drive, photos

# Create the database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(title="ShutterSpot API", description="API for ShutterSpot photography business management system")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(clients.router, prefix="/api", tags=["clients"])
app.include_router(shoots.router, prefix="/api", tags=["shoots"])
app.include_router(proposals.router, prefix="/api", tags=["proposals"])
app.include_router(client_shoots.router, prefix="/api", tags=["client_shoots"])
app.include_router(client_proposals.router, prefix="/api", tags=["client_proposals"])
app.include_router(drive.router)
app.include_router(photos.router)

@app.get("/")
async def root():
    return {"message": "Welcome to ShutterSpot API"}
