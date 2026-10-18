import { useMemo, useRef } from "react";

function prepareSignalForPlayback(signal, { removeDc = false } = {}) {
  if (!signal.length) return [];

  let processed = signal;

  if (removeDc) {
    const mean = signal.reduce((sum, value) => sum + value, 0) / signal.length;
    processed = signal.map((value) => value - mean);
  }

  const peak = Math.max(...processed.map((value) => Math.abs(value)), 1e-6);
  return processed.map((value) => value / peak);
}

function createBufferFromSignal(context, signal, gain, options = {}) {
  const buffer = context.createBuffer(1, signal.length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  const prepared = prepareSignalForPlayback(signal, options);

  for (let index = 0; index < prepared.length; index += 1) {
    channel[index] = prepared[index] * gain;
  }

  return buffer;
}

export default function AudioPlayer({ noisySignal, recoveredSignal }) {
  const audioRef = useRef(null);

  const canPlay = useMemo(
    () => noisySignal.length > 0 && recoveredSignal.length > 0 && typeof window !== "undefined",
    [noisySignal, recoveredSignal],
  );

  const playSignal = async (signal, options = {}) => {
    if (!canPlay) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioRef.current = audioRef.current || new AudioContextClass();
    if (audioRef.current.state === "suspended") {
      await audioRef.current.resume();
    }
    const source = audioRef.current.createBufferSource();
    source.buffer = createBufferFromSignal(audioRef.current, signal, options.gain ?? 0.35, options);
    source.connect(audioRef.current.destination);
    source.start();
  };

  return (
    <div className="glass-panel flex h-full flex-col rounded-3xl p-4 lg:p-5">
      <div className="mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Audio Probe</p>
          <h3 className="mt-2 text-lg font-semibold">Hear the signal emerge</h3>
        </div>
      </div>
      <div className="grid flex-1 gap-2.5 md:grid-cols-2">
        <button
          type="button"
          onClick={() => playSignal(noisySignal, { gain: 0.32 })}
          className="flex min-h-[160px] flex-col justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/10"
        >
          <div className="text-sm font-medium text-white">Play Noisy Signal</div>
          <div className="mt-1 text-xs text-slate-400">Raw modulated waveform through the noise floor.</div>
        </button>
        <button
          type="button"
          onClick={() => playSignal(recoveredSignal, { gain: 0.5, removeDc: true })}
          className="flex min-h-[160px] flex-col justify-between rounded-2xl border border-accent/20 bg-accent/10 px-4 py-4 text-left transition hover:bg-accent/15"
        >
          <div className="text-sm font-medium text-accent">Play Recovered Signal</div>
          <div className="mt-1 text-xs text-slate-300">Demodulated output after DSP recovery.</div>
        </button>
      </div>
    </div>
  );
}
