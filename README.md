# Quantum Signal Intelligence Lab

Quantum Signal Intelligence Lab is a full-stack interactive dashboard that turns noisy signal recovery into a story-driven demo. The frontend performs real-time DSP in the browser, while the FastAPI backend exposes small Qiskit-powered endpoints to compare classical demodulation with quantum measurement.

## Features

- Story-first hero flow that guides judges from hidden signal to recovered output to quantum comparison
- Signal recovery game with live scoring, residual error tracking, and homodyne / heterodyne switching
- Real-time dashboard panels for noisy waveform, recovered waveform, FFT spectrum, and I/Q constellation
- Three.js constellation visualizer and Web Audio playback for the noisy and recovered signals
- Presets for radio, deep space, and quantum experiment scenarios
- FastAPI backend with `/quantum/simulate` and `/quantum/noisy`
- Graceful backend fallback when Qiskit is not installed yet

## Project Structure

```text
frontend/
  pages/
  components/
  lib/
  styles/
api/
  app/
    main.py
    quantum.py
  main.py
  requirements.txt
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

If your backend is running somewhere else, set:

```bash
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
```

## Backend Setup

```bash
python -m venv api/.venv
api\.venv\Scripts\python.exe -m pip install -r api\requirements.txt
cd api
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

## Demo Flow

1. Start with `Deep Space Signal` to show the hardest recovery case.
2. Move between homodyne and heterodyne while adjusting carrier frequency and phase.
3. Play the noisy and recovered audio to make the improvement obvious.
4. Toggle quantum mode to show the Hadamard histogram and talk through amplitude vs probability.

## Notes

- All signal generation, demodulation, scoring, FFT work, and audio rendering happen in the browser for low-latency interaction.
- The backend is reserved for quantum simulation only, matching the requested performance constraint.
- Verified frontend production build on March 28, 2026.
- The backend dependency pins target Windows CPython 3.14-compatible wheels as available on PyPI: `qiskit` 2.3.0 and `qiskit-aer` 0.17.2.
