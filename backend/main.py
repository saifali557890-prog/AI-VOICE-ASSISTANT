from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.chat import router as chat_router
from backend.routes.speech import router as speech_router
from backend.routes.converse import router as converse_router

app = FastAPI(
    title="AI Voice Assistant",
    version="1.0.0"
)

# CORS
# NOTE: allow_credentials must be False when allow_origins is "*"
# (browsers block credentialed requests with a wildcard origin).
# Frontend fetch() calls don't send credentials, so this is safe.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===========================
# API Routes
# ===========================

app.include_router(
    chat_router,
    prefix="/api",
    tags=["Chat"]
)

app.include_router(
    speech_router,
    prefix="/api",
    tags=["Speech"]
)

app.include_router(
    converse_router,
    prefix="/api",
    tags=["Converse"]
)

# ===========================
# Root Route
# ===========================

@app.get("/")
def home():
    return {
        "message": "AI Voice Assistant Backend Running"
    }

# ===========================
# Health Check
# ===========================

@app.get("/health")
def health():
    return {
        "status": "ok"
    }