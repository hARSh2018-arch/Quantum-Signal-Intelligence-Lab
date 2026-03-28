from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .quantum import router as quantum_router

app = FastAPI(
    title="Quantum Signal Intelligence Lab API",
    version="1.0.0",
    description="Quantum simulation backend for the Quantum Signal Intelligence Lab frontend.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(quantum_router, prefix="/quantum", tags=["quantum"])


@app.get("/")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": "quantum-signal-intelligence-lab"}

