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
  "Transmit the clean message",
  "Impair the RF path with drift, offset, and noise",
  "Mix against a local oscillator",
  "Observe the recovered baseband",
];

function buildSpectrumTrace(name, spectrum, color, fillColor) {
  return {
    name,
    frequencies: spectrum.frequencies,
    magnitudes: spectrum.magnitudes,
    color,
    fillColor,
  };
}

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
        frequencyOffset: controls.frequencyOffset,
        phase: controls.phase,
        loFrequency: controls.loFrequency,
        loPhase: controls.loPhase,
        loAmplitude: controls.loAmplitude,
        sampleRate: controls.sampleRate,
        type: controls.demodulationType,
      }),
    [controls, signalFrame],
  );

  const idealDemodulated = useMemo(
    () =>
      demodulateSignal({
        signal: signalFrame.idealReceived,
        time: signalFrame.t,
        carrierFrequency: controls.frequency,
        frequencyOffset: 0,
        phase: controls.phase,
        loFrequency: controls.frequency,
        loPhase: controls.phase,
        loAmplitude: 1,
        sampleRate: controls.sampleRate,
        type: controls.demodulationType,
      }),
    [controls, signalFrame],
  );

  const score = useMemo(
    () => scoreRecovery(signalFrame.message, demodulated.recovered),
    [signalFrame, demodulated],
  );

  const idealScore = useMemo(
    () => scoreRecovery(signalFrame.message, idealDemodulated.recovered),
    [signalFrame, idealDemodulated],
  );

  const receivedSpectrum = useMemo(
    () => computeFFT(signalFrame.noisy, controls.sampleRate),
    [signalFrame, controls.sampleRate],
  );

  const localOscillatorSpectrum = useMemo(
    () => computeFFT(demodulated.localOscillator, controls.sampleRate),
    [demodulated, controls.sampleRate],
  );

  const activeStep = useMemo(() => {
    if (score.similarity < 45) return 0;
    if (score.similarity < 70) return 1;
    if (score.similarity < 88) return 2;
    return 3;
  }, [score.similarity]);

  const liveHint = useMemo(() => {
    if (score.similarity < 45) {
      return "The receiver is not coherently locked yet. Reduce offset or line up the local oscillator frequency and phase to expose the envelope.";
    }
    if (score.similarity < 75) {
      return "Recovery is emerging, but the RF path is still unstable. Lower the drift randomness or switch to heterodyne mode to preserve I/Q information.";
    }
    return "Carrier recovery is holding. Use comparison mode to contrast the ideal demodulator against the impaired path and study the residual distortion.";
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
          <div className="mx-auto max-w-7xl px-3 py-5 sm:px-5 lg:px-6 lg:py-6">
            <section className="mb-5 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 glass-panel lg:mb-6 lg:p-6">
              <div className="grid gap-6 lg:grid-cols-[1.4fr,0.8fr] lg:items-center">
                <div>
                  <div className="mb-4 inline-flex rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-accent">
                    Quantum Signal Intelligence Lab
                  </div>
                  <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
                    Explore homodyne and heterodyne simulation analysis in classical and quantum mode.
                  </h1>
                  <p className="mt-4 max-w-2xl text-lg text-slate-300">
                    This live lab lets you compare homodyne and heterodyne demodulation across classical and quantum modes while tracking how the received signal, local oscillator, spectrum, and recovered output behave in real time.
                  </p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-4">
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
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">LO Offset</div>
                      <div className="mt-2 text-lg font-semibold text-electric">
                        {(demodulated.oscillatorFrequency - controls.frequency).toFixed(1)} Hz
                      </div>
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

            <section className="grid gap-5 xl:grid-cols-[0.9fr,1.1fr] xl:items-stretch">
              <ControlPanel
                controls={controls}
                setControls={setControls}
                presetKey={presetKey}
                applyPreset={applyPreset}
              />

              <div className="grid min-w-0 content-start gap-5 self-stretch">
                <GamePanel
                  score={score.similarity}
                  mse={score.mse}
                  targetType={controls.demodulationType}
                  liveHint={liveHint}
                  gameMode={controls.gameMode}
                />
                <div className="grid items-stretch gap-5 lg:grid-cols-2 lg:auto-rows-fr">
                  <AudioPlayer noisySignal={signalFrame.noisy} recoveredSignal={demodulated.recovered} />
                  <IQVisualizer iData={demodulated.iComponent} qData={demodulated.qComponent} />
                </div>
                <div className="grid items-stretch gap-5 lg:grid-cols-2">
                  <div className="glass-panel flex h-full flex-col rounded-3xl p-4 lg:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-warning/90">Signal Status</p>
                        <h3 className="mt-2 text-lg font-semibold">Received path summary</h3>
                      </div>
                      <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                        Live
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Rx Frequency</div>
                        <div className="mt-2 text-2xl font-semibold text-electric">{controls.frequency} Hz</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Noise Level</div>
                        <div className="mt-2 text-2xl font-semibold text-warning">{controls.snr} dB</div>
                      </div>
                    </div>
                    <div className="mt-auto pt-4">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-sm text-slate-300 lg:p-4">
                      The received signal reflects the active noise, drift, and offset controls before demodulation.
                      </div>
                    </div>
                  </div>
                  <div className="glass-panel flex h-full flex-col rounded-3xl p-4 lg:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Oscillator Sync</p>
                        <h3 className="mt-2 text-lg font-semibold">Local oscillator status</h3>
                      </div>
                      <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                        Tracking
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">LO Frequency</div>
                        <div className="mt-2 text-2xl font-semibold text-accent">{controls.loFrequency} Hz</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 lg:p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Phase</div>
                        <div className="mt-2 text-2xl font-semibold text-slate-200">{controls.loPhase} deg</div>
                      </div>
                    </div>
                    <div className="mt-auto pt-4">
                      <div className="rounded-2xl border border-electric/20 bg-electric/10 p-3 text-sm text-slate-200 lg:p-4">
                        Current LO offset: {(demodulated.oscillatorFrequency - controls.frequency).toFixed(1)} Hz
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-2 lg:mt-6 lg:gap-6">
              <SignalPlot
                title="Original Message vs Received RF"
                time={signalFrame.t}
                traces={[
                  { name: "Transmitted Message", values: signalFrame.message, color: "#f9c74f" },
                  { name: "Received RF", values: signalFrame.noisy, color: "#73a5ff" },
                  ...(controls.enableComparison
                    ? [
                        {
                          name: "Ideal RF",
                          values: signalFrame.idealReceived,
                          color: "#f9c74f",
                          dash: "dot",
                        },
                      ]
                    : []),
                ]}
              />
              <SignalPlot
                title="Local Oscillator and Mixed Output"
                time={signalFrame.t}
                traces={[
                  {
                    name: "Local Oscillator",
                    values: demodulated.localOscillator,
                    color: "#f9c74f",
                    dash: "dot",
                    opacity: 0.7,
                  },
                  {
                    name: "Mixer I Output",
                    values: demodulated.mixedInPhase,
                    color: "#ff6b8a",
                    opacity: 0.95,
                  },
                  ...(controls.demodulationType === "heterodyne"
                    ? [
                        {
                          name: "Mixer Q Output",
                          values: demodulated.mixedQuadrature,
                          color: "#a78bfa",
                          opacity: 0.72,
                        },
                      ]
                    : []),
                ]}
                layoutOverrides={{
                  xaxis: {
                    title: "Seconds",
                    gridcolor: "rgba(148,163,184,0.14)",
                    range: [0, Math.min(0.8, signalFrame.t[signalFrame.t.length - 1])],
                  },
                }}
              />
              <SignalPlot
                title="Recovered Demodulated Output"
                time={signalFrame.t}
                traces={[
                  { name: "Recovered", values: demodulated.recovered, color: "#7cf7d4" },
                  { name: "Residual Error", values: score.error, color: "#ff6b8a" },
                  ...(controls.enableComparison
                    ? [
                        {
                          name: "Ideal Recovery",
                          values: idealDemodulated.recovered,
                          color: "#f9c74f",
                          dash: "dot",
                        },
                      ]
                    : []),
                ]}
              />
              <SignalPlot
                title="Frequency Drift Profile"
                time={signalFrame.t}
                traces={[
                  { name: "Instantaneous Carrier", values: signalFrame.instantaneousFrequency, color: "#73a5ff" },
                  {
                    name: "LO Frequency",
                    values: signalFrame.t.map(() => demodulated.oscillatorFrequency),
                    color: "#f9c74f",
                    dash: "dash",
                  },
                ]}
                tag="Frequency Tracking"
              />
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-2 lg:mt-6 lg:gap-6">
              <FFTPlot
                title="Received Signal Spectrum"
                traces={[
                  buildSpectrumTrace(
                    "Received RF",
                    receivedSpectrum,
                    "#73a5ff",
                    "rgba(115,165,255,0.18)",
                  ),
                ]}
              />
              <FFTPlot
                title="Local Oscillator Spectrum"
                traces={[
                  buildSpectrumTrace(
                    "Local Oscillator",
                    localOscillatorSpectrum,
                    "#f9c74f",
                    "rgba(249,199,79,0.18)",
                  ),
                ]}
              />
            </section>

            <section className="mt-5 grid gap-5 xl:grid-cols-2 lg:mt-6 lg:gap-6">
              <div className="glass-panel rounded-3xl p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Classical Lane</p>
                    <h3 className="mt-2 text-xl font-semibold">Imperfection Summary</h3>
                  </div>
                  <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                    Frontend only
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Rx Carrier</div>
                    <div className="mt-2 text-3xl font-semibold text-electric">{controls.frequency} Hz</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">LO Frequency</div>
                    <div className="mt-2 text-3xl font-semibold text-accent">{controls.loFrequency} Hz</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Measured SNR</div>
                    <div className="mt-2 text-3xl font-semibold text-warning">{controls.snr} dB</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Ideal Recovery</div>
                    <div className="mt-2 text-3xl font-semibold text-slate-200">{idealScore.similarity}%</div>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950/40 p-4 text-sm text-slate-300">
                  Homodyne emphasizes coherent carrier alignment. Heterodyne exposes both I and Q channels, making frequency offset and phase mismatch easier to study when the received oscillator is unstable.
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
