import Head from "next/head";
import { useMemo, useState } from "react";
import clsx from "clsx";
import AudioPlayer from "../components/AudioPlayer";
import ControlPanel from "../components/ControlPanel";
import FFTPlot from "../components/FFTPlot";
import GamePanel from "../components/GamePanel";
import IQVisualizer from "../components/IQVisualizer";
import QuantumPanel from "../components/QuantumPanel";
import SignalPlot from "../components/SignalPlot";
import { demodulateSignal } from "../lib/demodulation";
import { computeFFT } from "../lib/fft";
import { PRESETS, generateSignalFrame } from "../lib/signalGenerator";
import { scoreRecovery } from "../lib/scoring";

const STORY_STEPS = [
  "Signal is hidden in noise",
  "Apply demodulation",
  "Recover signal",
  "Compare with quantum measurement",
];

export default function Home() {
  const [presetKey, setPresetKey] = useState("radio");
  const [controls, setControls] = useState({
    ...PRESETS.radio,
    demodulationType: "homodyne",
    mode: "classical",
    gameMode: true,
    showQuantumOverlay: true,
  });

  const signalFrame = useMemo(
    () =>
      generateSignalFrame({
        ...controls,
        carrierFrequency: controls.frequency,
      }),
    [controls],
  );

  const demodulated = useMemo(
    () =>
      demodulateSignal({
        signal: signalFrame.noisy,
        time: signalFrame.t,
        carrierFrequency: controls.frequency,
        phase: controls.phase,
        sampleRate: controls.sampleRate,
        type: controls.demodulationType,
      }),
    [controls, signalFrame],
  );

  const score = useMemo(
    () => scoreRecovery(signalFrame.message, demodulated.recovered),
    [signalFrame, demodulated],
  );

  const noisySpectrum = useMemo(
    () => computeFFT(signalFrame.noisy, controls.sampleRate),
    [signalFrame, controls.sampleRate],
  );

  const activeStep = useMemo(() => {
    if (score.similarity < 45) return 0;
    if (score.similarity < 70) return 1;
    if (score.similarity < 88) return 2;
    return 3;
  }, [score.similarity]);

  const liveHint = useMemo(() => {
    if (score.similarity < 45) {
      return "The carrier lock is still drifting. Bring phase and carrier frequency closer to the preset to expose the buried envelope.";
    }
    if (score.similarity < 75) {
      return "You are partially synced. Try heterodyne mode when the signal is faint or phase-shifted to stabilize both I and Q components.";
    }
    return "Recovery lock achieved. The classical envelope now mirrors the hidden message strongly enough to compare against the quantum readout.";
  }, [score.similarity]);

  const applyPreset = (nextPresetKey) => {
    setPresetKey(nextPresetKey);
    setControls((prev) => ({
      ...prev,
      ...PRESETS[nextPresetKey],
      demodulationType: nextPresetKey === "deepSpace" ? "heterodyne" : prev.demodulationType,
    }));
  };

  return (
    <>
      <Head>
        <title>Quantum Signal Intelligence Lab</title>
        <meta
          name="description"
          content="Interactive DSP and quantum measurement lab for hackathon demos."
        />
      </Head>
      <main className="min-h-screen bg-radial-lab text-white">
        <div className="grid-overlay min-h-screen">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-6 glass-panel lg:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.4fr,0.8fr] lg:items-center">
                <div>
                  <div className="mb-4 inline-flex rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-accent">
                    Quantum Signal Intelligence Lab
                  </div>
                  <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                    Recover hidden transmissions and map classical demodulation to quantum measurement.
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg text-slate-300">
                    A story-driven lab dashboard for decoding noisy carriers, comparing homodyne and heterodyne recovery, and visualizing how uncertainty echoes across a Hadamard quantum measurement.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Preset</div>
                      <div className="mt-2 text-lg font-semibold">{PRESETS[presetKey].label}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Mode</div>
                      <div className="mt-2 text-lg font-semibold capitalize">{controls.demodulationType}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Recovery</div>
                      <div className="mt-2 text-lg font-semibold text-accent">{score.similarity}%</div>
                    </div>
                  </div>
                </div>
                <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/40 p-5 animate-float">
                  <div className="text-xs uppercase tracking-[0.35em] text-slate-400">Guided Story</div>
                  <div className="mt-5 space-y-3">
                    {STORY_STEPS.map((step, index) => (
                      <div
                        key={step}
                        className={clsx(
                          "rounded-2xl border border-white/10 px-4 py-3 text-sm transition",
                          index <= activeStep ? "story-step-active" : "bg-white/5 text-slate-400",
                        )}
                      >
                        <div className="font-medium">0{index + 1}</div>
                        <div className="mt-1">{step}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-2xl border border-electric/20 bg-electric/10 p-4 text-sm text-slate-200">
                    {PRESETS[presetKey].description}
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
              <ControlPanel
                controls={controls}
                setControls={setControls}
                presetKey={presetKey}
                applyPreset={applyPreset}
              />

              <div className="grid gap-6">
                <GamePanel
                  score={score.similarity}
                  mse={score.mse}
                  targetType={controls.demodulationType}
                  liveHint={liveHint}
                  gameMode={controls.gameMode}
                />
                <div className="grid gap-6 lg:grid-cols-2">
                  <AudioPlayer noisySignal={signalFrame.noisy} recoveredSignal={demodulated.recovered} />
                  <IQVisualizer iData={demodulated.iComponent} qData={demodulated.qComponent} />
                </div>
              </div>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <SignalPlot
                title="Hidden Carrier vs Ground Truth"
                time={signalFrame.t}
                traces={[
                  { name: "Noisy Modulated", values: signalFrame.noisy, color: "#73a5ff" },
                  { name: "Original Message", values: signalFrame.message, color: "#7cf7d4" },
                ]}
              />
              <SignalPlot
                title="Recovered Output and Residual Error"
                time={signalFrame.t}
                traces={[
                  { name: "Recovered", values: demodulated.recovered, color: "#7cf7d4" },
                  { name: "Error", values: score.error, color: "#ff6b8a" },
                ]}
              />
              <FFTPlot frequencies={noisySpectrum.frequencies} magnitudes={noisySpectrum.magnitudes} />
              <SignalPlot
                title="Homodyne vs Heterodyne Storyline"
                time={signalFrame.t}
                traces={[
                  { name: "I Component", values: demodulated.iComponent, color: "#f9c74f" },
                  { name: "Q Component", values: demodulated.qComponent, color: "#a78bfa" },
                ]}
              />
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-2">
              <div className="glass-panel rounded-3xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Classical Lane</p>
                    <h3 className="mt-2 text-xl font-semibold">DSP Signal Recovery</h3>
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    Frontend only
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Carrier Lock</div>
                    <div className="mt-2 text-3xl font-semibold text-electric">{controls.frequency} Hz</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Phase Alignment</div>
                    <div className="mt-2 text-3xl font-semibold text-accent">{controls.phase}°</div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                  Homodyne mixes against a synchronized local oscillator. Heterodyne preserves richer I/Q context for weak, drifting, or off-axis carriers.
                </div>
              </div>
              <QuantumPanel
                enabled={controls.mode === "quantum" || controls.showQuantumOverlay}
                snr={controls.snr}
                demodulationType={controls.demodulationType}
              />
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

