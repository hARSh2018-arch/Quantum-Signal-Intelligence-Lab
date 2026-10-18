# Quantum Signal Intelligence Lab Working Notes

This file is the current project working reference for the repository as it exists now.

## Project Summary

Quantum Signal Intelligence Lab is a browser-first signal analysis project with a small FastAPI quantum backend. The frontend is the main computation layer. It simulates a received signal, a local oscillator, demodulation behavior, FFT spectra, and IQ motion. The backend is used only for the quantum comparison panel.

## Current Repository Shape

```text
api/
  app/
    __init__.py
    main.py
    quantum.py
  main.py
  requirements.txt
frontend/
  components/
    AudioPlayer.js
    ControlPanel.js
    FFTPlot.js
    GamePanel.js
    IQVisualizer.js
    QuantumPanel.js
    SignalPlot.js
  lib/
    demodulation.js
    fft.js
    noise.js
    scoring.js
    signalGenerator.js
  pages/
    _app.js
    index.js
  styles/
    globals.css
README.md
working.md
```

## Important Runtime Split

### Website backend

The live website backend is:

`api/app/main.py`

Run it with:

```bash
cd api
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

### Standalone Python demo

`api/main.py` is no longer the FastAPI export file. It is now a standalone NumPy + Matplotlib simulation script with sliders.

It currently demonstrates:

- received signal
- local oscillator
- frequency distortion
- floppy noise via random noise level
- FFT spectrum
- offset control

Run it with:

```bash
python api/main.py
```

## Frontend Responsibilities

The frontend performs the main signal workflow:

1. create the baseband message
2. simulate the received RF path
3. add noise and frequency behavior
4. mix with a local oscillator
5. recover homodyne or heterodyne output
6. score recovery quality
7. compute spectra
8. render plots, audio, and IQ visualization

## Current Website Features

- Homodyne and heterodyne analysis
- Classical and quantum mode toggle
- Received signal simulation
- Local oscillator simulation
- Frequency offset control
- Adjustable LO offset
- Noise level control through SNR
- Received-vs-message plot
- Local oscillator and mixed output plot
- Recovered output plot
- Frequency drift tracking plot
- Received spectrum FFT
- Local oscillator spectrum FFT
- Audio probe
- IQ constellation
- Recovery scoring card
- Signal status and oscillator sync cards
- Quantum histogram comparison panel

## Main Frontend Files

### `frontend/pages/index.js`

Main orchestration file.

Responsibilities:

- stores active controls and preset
- runs signal generation
- runs demodulation
- computes scores and spectra
- assembles the dashboard

### `frontend/lib/signalGenerator.js`

Creates the simulated received path.

Includes:

- message generation
- ideal transmitted carrier
- received carrier instability
- offset behavior
- noise injection

### `frontend/lib/demodulation.js`

Handles:

- local oscillator generation
- mixer I output
- mixer Q output
- moving-average smoothing
- homodyne recovery
- heterodyne recovery

### `frontend/lib/fft.js`

Current spectrum implementation used by the UI FFT cards.

### `frontend/components/ControlPanel.js`

Current control deck includes:

- received carrier
- received phase
- noise level
- sampling rate
- local oscillator frequency
- local oscillator phase
- local oscillator amplitude
- LO offset slider behavior
- demodulation mode
- analysis mode
- drift/distortion toggle
- frequency offset toggle
- comparison mode
- game mode
- standalone frequency offset card below the switch group

### `frontend/components/AudioPlayer.js`

Audio playback card for:

- noisy signal
- recovered signal

Recovered playback currently removes DC before playback so it is easier to hear.

### `frontend/components/IQVisualizer.js`

Three.js constellation panel with:

- live motion
- signal-reactive pulsing
- animated ring and halo

### `frontend/components/QuantumPanel.js`

Fetches:

- `/quantum/simulate`
- `/quantum/noisy`

and renders the histogram comparison panel.

## Backend Responsibilities

### `api/app/main.py`

Creates the FastAPI app, installs CORS middleware, mounts the quantum router, and exposes the root health route.

### `api/app/quantum.py`

Provides:

- quantum request schemas
- noisy quantum request schema
- response schema
- Qiskit-backed Hadamard simulation
- fallback simulation when Qiskit Aer is unavailable

## Current Design Notes

- The classical DSP lane is frontend-driven.
- The quantum lane is backend-driven.
- Plotly is used for signal and spectrum charts.
- Three.js is used for IQ visualization.
- Web Audio API is used for audio playback.

## Current Documentation Reality Check

The project has changed from its earlier layout and wording. The key current truths are:

- `api/main.py` is a standalone signal demo, not the live FastAPI entry file.
- The website focuses on received signal, local oscillator, spectra, offset control, audio probe, and IQ visualization.
- The control panel has been simplified compared with earlier broader impairment controls.
- The heading and dashboard now frame the project around homodyne and heterodyne simulation analysis in classical and quantum mode.

## Recommended Next Cleanup

- Keep README and working notes aligned whenever control labels change.
- If `api/main.py` is meant to stay as a separate demo, consider renaming it later to avoid confusion with the real API app.
