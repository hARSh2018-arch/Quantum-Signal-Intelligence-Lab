from __future__ import annotations

import random
from typing import Dict

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()

try:
    from qiskit import QuantumCircuit, transpile
    from qiskit_aer import AerSimulator

    simulator = AerSimulator()
except Exception:  # pragma: no cover - graceful fallback for local setup
    QuantumCircuit = None
    transpile = None
    simulator = None


class QuantumRequest(BaseModel):
    shots: int = Field(default=512, ge=1, le=4096)


class NoisyQuantumRequest(QuantumRequest):
    noise: float = Field(default=0.08, ge=0.0, le=0.45)


class QuantumResponse(BaseModel):
    counts: Dict[str, int]
    backend: str
    shots: int
    note: str


def _fallback_counts(shots: int, noise: float = 0.0) -> dict[str, int]:
    probability_zero = 0.5 + random.uniform(-noise, noise)
    probability_zero = max(0.05, min(0.95, probability_zero))
    zero_counts = round(probability_zero * shots)
    return {"0": zero_counts, "1": shots - zero_counts}


def _run_hadamard(shots: int) -> dict[str, int]:
    circuit = QuantumCircuit(1, 1)
    circuit.h(0)
    circuit.measure(0, 0)
    compiled = transpile(circuit, simulator)
    result = simulator.run(compiled, shots=shots).result()
    counts = dict(result.get_counts())
    return {"0": counts.get("0", 0), "1": counts.get("1", 0)}


@router.post("/simulate", response_model=QuantumResponse)
def simulate_quantum(request: QuantumRequest) -> QuantumResponse:
    if simulator is None or QuantumCircuit is None or transpile is None:
        return QuantumResponse(
            counts=_fallback_counts(request.shots),
            backend="fallback-simulator",
            shots=request.shots,
            note="Qiskit Aer not installed. Returning deterministic-balanced fallback counts.",
        )

    return QuantumResponse(
        counts=_run_hadamard(request.shots),
        backend="qiskit-aer",
        shots=request.shots,
        note="Balanced Hadamard measurement on |0>.",
    )


@router.post("/noisy", response_model=QuantumResponse)
def simulate_noisy_quantum(request: NoisyQuantumRequest) -> QuantumResponse:
    if simulator is None or QuantumCircuit is None or transpile is None:
        return QuantumResponse(
            counts=_fallback_counts(request.shots, request.noise),
            backend="fallback-simulator",
            shots=request.shots,
            note="Qiskit Aer not installed. Returning noise-skewed fallback counts.",
        )

    counts = _run_hadamard(request.shots)
    zero_to_one = sum(1 for _ in range(counts["0"]) if random.random() < request.noise)
    one_to_zero = sum(1 for _ in range(counts["1"]) if random.random() < request.noise)
    noisy_zero = counts["0"] - zero_to_one + one_to_zero
    noisy_one = counts["1"] - one_to_zero + zero_to_one

    return QuantumResponse(
        counts={"0": noisy_zero, "1": noisy_one},
        backend="qiskit-aer",
        shots=request.shots,
        note="Hadamard measurement with synthetic readout noise.",
    )
