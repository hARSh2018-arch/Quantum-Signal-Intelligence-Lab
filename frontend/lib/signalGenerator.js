import { applyNoise, snrToNoiseAmplitude } from "./noise";

export const PRESETS = {
  radio: {
    label: "Radio Signal",
    frequency: 7,
    phase: 25,
    snr: 22,
    sampleRate: 256,
    duration: 1.4,
    messageFrequency: 2,
    carrierFrequency: 18,
    amplitude: 1,
    modulationIndex: 0.58,
    description: "Civilian broadcast drifting through urban RF clutter.",
  },
  deepSpace: {
    label: "Deep Space Signal",
    frequency: 3,
    phase: 110,
    snr: 8,
    sampleRate: 384,
    duration: 1.8,
    messageFrequency: 0.8,
    carrierFrequency: 30,
    amplitude: 1,
    modulationIndex: 0.8,
    description: "Weak telemetry whispering across interplanetary noise.",
  },
  quantum: {
    label: "Quantum Experiment",
    frequency: 10,
    phase: 60,
    snr: 14,
    sampleRate: 512,
    duration: 1.2,
    messageFrequency: 5,
    carrierFrequency: 42,
    amplitude: 0.9,
    modulationIndex: 0.42,
    description: "Lab-grade carrier with uncertainty injected into the readout.",
  },
};

export function generateSignalFrame(config) {
  const sampleCount = Math.max(128, Math.floor(config.sampleRate * config.duration));
  const t = Array.from({ length: sampleCount }, (_, index) => index / config.sampleRate);
  const phaseRad = (config.phase * Math.PI) / 180;

  const message = t.map(
    (time) =>
      config.amplitude *
      (0.75 * Math.sin(2 * Math.PI * config.messageFrequency * time + phaseRad) +
        0.25 * Math.cos(2 * Math.PI * config.messageFrequency * 0.5 * time)),
  );

  const carrier = t.map((time) => Math.cos(2 * Math.PI * config.carrierFrequency * time + phaseRad));
  const quadratureCarrier = t.map((time) =>
    Math.sin(2 * Math.PI * config.carrierFrequency * time + phaseRad),
  );

  const modulated = message.map(
    (value, index) => (1 + config.modulationIndex * value) * carrier[index],
  );

  const noisy = applyNoise(modulated, snrToNoiseAmplitude(config.snr));

  return {
    t,
    message,
    carrier,
    quadratureCarrier,
    modulated,
    noisy,
  };
}

