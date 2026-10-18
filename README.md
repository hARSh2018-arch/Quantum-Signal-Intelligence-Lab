# Quantum Signal Intelligence Lab

Quantum Signal Intelligence Lab is an interactive signal-analysis dashboard built with Next.js plus a small FastAPI quantum service. The browser simulates received RF, local-oscillator behavior, homodyne and heterodyne demodulation, spectra, audio playback, and IQ visualization in real time.

## What The Website Shows

- Homodyne and heterodyne analysis modes
- Classical and quantum comparison modes
- Simulated received signal and local oscillator
- Frequency offset and LO offset controls
- Noise-controlled received path
- Time-domain plots for received, local oscillator, mixed, and recovered signals
- FFT spectrum for the received signal and local oscillator
- Live IQ constellation with Three.js
- Audio probe for noisy and recovered playback
- Quantum histogram panel backed by FastAPI and Qiskit fallback logic

Additional implemented features in the current code:

- Scenario presets for radio, deep-space, and quantum experiments
- Comparison mode for ideal vs impaired recovery
- Drift and distortion toggles
- Recovery scoring and guided game panel

## Current Project Layout

```text
frontend/
  components/
  lib/
  pages/
  styles/
api/
  app/
    main.py
    quantum.py
  main.py
  requirements.txt
README.md
working.md
working1.md
```

## Important Backend Note

There are now two different Python entry files:

- `api/app/main.py`
  This is the real FastAPI backend used by the website.

- `api/main.py`
  This is a standalone NumPy + Matplotlib signal simulation script with sliders for noise, distortion, and offset.

If you want to run the website backend, use `api/app/main.py`, not `api/main.py`.

## Backend API Surface

The FastAPI app currently exposes:

- `GET /`
  Healthcheck returning service status.

- `POST /quantum/simulate`
  Returns a balanced Hadamard measurement histogram.

- `POST /quantum/noisy`
  Returns a Hadamard histogram with synthetic readout noise.

If Qiskit Aer is not installed, the backend falls back to deterministic pseudo-count generation so the frontend demo still works.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

If the backend is running at a different address, set:

```bash
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000
```

## Backend Setup For The Website

```bash
python -m venv api/.venv
api\.venv\Scripts\python.exe -m pip install -r api\requirements.txt
cd api
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Backend URL:

```text
http://127.0.0.1:8000
```

## Standalone Python Signal Demo

To run the standalone NumPy + Matplotlib demo in `api/main.py`:

```bash
python api/main.py
```

That script includes:

- received signal simulation
- local oscillator simulation
- frequency distortion
- noise level control
- frequency offset control
- FFT spectrum view

## Main Frontend Files

- `frontend/pages/index.js`
  Main page layout, state orchestration, and signal pipeline wiring.

- `frontend/components/ControlPanel.js`
  Demodulation deck and experiment controls.

- `frontend/components/AudioPlayer.js`
  Audio probe for noisy and recovered playback.

- `frontend/components/IQVisualizer.js`
  Three.js live IQ constellation.

- `frontend/components/QuantumPanel.js`
  Quantum histogram and classical-vs-quantum comparison card.

- `frontend/lib/signalGenerator.js`
  Received signal synthesis, noise, drift, and offset behavior.

- `frontend/lib/demodulation.js`
  Homodyne and heterodyne demodulation logic.

- `frontend/lib/fft.js`
  Spectrum computation used by the FFT charts.

## Additional Active Frontend Modules

- `frontend/components/GamePanel.js`
  Recovery scoring panel with live hints for the guided lab flow.

- `frontend/components/SignalPlot.js`
  Shared time-domain plotting component for message, RF, mixer, recovery, and drift views.

- `frontend/components/FFTPlot.js`
  Shared spectrum plotting component for received and oscillator FFT views.

- `frontend/lib/scoring.js`
  Recovery similarity, error, and MSE scoring used by the game panel.

- `frontend/lib/noise.js`
  AWGN injection used to degrade the received path from the SNR control.

## Notes

- Most DSP behavior runs in the frontend for immediate interaction.
- The quantum backend is intentionally small and only serves the quantum lane.
- The UI has been tuned around received signal, local oscillator, offset control, FFT views, audio probe, and IQ visualization.
