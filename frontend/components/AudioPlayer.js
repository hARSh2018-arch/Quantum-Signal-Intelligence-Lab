import { useMemo, useRef } from "react";

function createBufferFromSignal(context, signal, gain) {
  const buffer = context.createBuffer(1, signal.length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  const normalized = Math.max(...signal.map((value) => Math.abs(value)), 1e-6);
  for (let index = 0; index < signal.length; index += 1) {
    channel[index] = (signal[index] / normalized) * gain;
  }
  return buffer;
}

export default function AudioPlayer({ noisySignal, recoveredSignal }) {
  const audioRef = useRef(null);

  const canPlay = useMemo(
    () => noisySignal.length > 0 && recoveredSignal.length > 0 && typeof window !== "undefined",
    [noisySignal, recoveredSignal],
  );

  const playSignal = async (signal) => {
    if (!canPlay) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioRef.current = audioRef.current || new AudioContextClass();
    if (audioRef.current.state === "suspended") {
      await audioRef.current.resume();
    }
    const source = audioRef.current.createBufferSource();
    source.buffer = createBufferFromSignal(audioRef.current, signal, 0.35);
    source.connect(audioRef.current.destination);
    source.start();
  };

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Audio Probe</p>
          <h3 className="mt-2 text-lg font-semibold">Hear the signal emerge</h3>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => playSignal(noisySignal)}
          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:bg-white/10"
        >
          <div className="text-sm font-medium text-white">Play Noisy Signal</div>
          <div className="mt-1 text-xs text-slate-400">Raw modulated waveform through the noise floor.</div>
        </button>
        <button
          type="button"
          onClick={() => playSignal(recoveredSignal)}
          className="rounded-2xl border border-accent/20 bg-accent/10 px-4 py-4 text-left transition hover:bg-accent/15"
        >
          <div className="text-sm font-medium text-accent">Play Recovered Signal</div>
          <div className="mt-1 text-xs text-slate-300">Demodulated output after DSP recovery.</div>
        </button>
      </div>
    </div>
  );
}

