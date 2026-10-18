import { applyAwgn } from "./noise";

export const PRESETS = {
  radio: {
    label: "Radio Signal",
    frequency: 18,
    phase: 25,
    snr: 22,
    sampleRate: 256,
    duration: 1.4,
    messageFrequency: 2,
    carrierFrequency: 18,
    amplitude: 1,
    modulationIndex: 0.58,
    frequencyOffset: 0,
    loFrequency: 18,
    loPhase: 25,
    loAmplitude: 1,
    driftRate: 0.15,
    distortionDeviation: 0.7,
    distortionRandomness: 0.18,
    enableNoise: true,
    enableDrift: true,
    enableOffset: true,
    enableComparison: false,
    description: "Civilian broadcast drifting through urban RF clutter.",
  },
  deepSpace: {
    label: "Deep Space Signal",
    frequency: 30,
    phase: 110,
    snr: 8,
    sampleRate: 384,
    duration: 1.8,
    messageFrequency: 0.8,
    carrierFrequency: 30,
    amplitude: 1,
    modulationIndex: 0.8,
    frequencyOffset: 1.8,
    loFrequency: 30,
    loPhase: 100,
    loAmplitude: 1,
    driftRate: 0.45,
    distortionDeviation: 1.4,
    distortionRandomness: 0.45,
    enableNoise: true,
    enableDrift: true,
    enableOffset: true,
    enableComparison: true,
    description: "Weak telemetry whispering across interplanetary noise.",
  },
  quantum: {
    label: "Quantum Experiment",
    frequency: 42,
    phase: 60,
    snr: 14,
    sampleRate: 512,
    duration: 1.2,
    messageFrequency: 5,
    carrierFrequency: 42,
    amplitude: 0.9,
    modulationIndex: 0.42,
    frequencyOffset: 0.9,
    loFrequency: 42,
    loPhase: 60,
    loAmplitude: 1,
    driftRate: 0.2,
    distortionDeviation: 0.9,
    distortionRandomness: 0.22,
    enableNoise: true,
    enableDrift: true,
    enableOffset: true,
    enableComparison: true,
    description: "Lab-grade carrier with uncertainty injected into the readout.",
  },
};

function cumulativeSum(values, scale) {
  let total = 0;
  return values.map((value) => {
    total += value * scale;
    return total;
  });
}

function createFrequencyInstability(config, time) {
  const driftRate = config.enableDrift ? config.driftRate : 0;
  const deviation = config.enableDrift ? config.distortionDeviation : 0;
  const randomness = config.enableDrift ? config.distortionRandomness : 0;
  const offset = config.enableOffset ? config.frequencyOffset : 0;

  let randomWalk = 0;

  return time.map((sampleTime) => {
    randomWalk = 0.94 * randomWalk + (Math.random() * 2 - 1) * randomness;
    const drift = driftRate * sampleTime;
    const wobble = deviation * Math.sin(2 * Math.PI * (0.35 + driftRate) * sampleTime);
    return offset + drift + wobble + randomWalk;
  });
}

function integrateFrequencyWithSampleRate(baseFrequency, frequencyError, sampleRate, phaseDegrees) {
  const phaseOffset = (phaseDegrees * Math.PI) / 180;
  const instantaneousFrequency = frequencyError.map((value) => baseFrequency + value);
  const phase = cumulativeSum(instantaneousFrequency, (2 * Math.PI) / sampleRate);
  return phase.map((value) => value + phaseOffset);
}

export function generateSignalFrame(config) {
  const sampleCount = Math.max(128, Math.floor(config.sampleRate * config.duration));
  const t = Array.from({ length: sampleCount }, (_, index) => index / config.sampleRate);
  const phaseRad = (config.phase * Math.PI) / 180;

  // Build the original baseband message that we want to recover after demodulation.
  const message = t.map(
    (time) =>
      config.amplitude *
      (0.75 * Math.sin(2 * Math.PI * config.messageFrequency * time + phaseRad) +
        0.25 * Math.cos(2 * Math.PI * config.messageFrequency * 0.5 * time)),
  );

  const txCarrier = t.map((time) => Math.cos(2 * Math.PI * config.carrierFrequency * time + phaseRad));
  const idealReceived = message.map(
    (value, index) => (1 + config.modulationIndex * value) * txCarrier[index],
  );

  // Simulate oscillator instability as a mix of deterministic drift and random FM-like wander.
  const frequencyError = createFrequencyInstability(config, t);
  const receivedPhase = integrateFrequencyWithSampleRate(
    config.carrierFrequency,
    frequencyError,
    config.sampleRate,
    config.phase,
  );
  const distortedCarrier = receivedPhase.map((phase) => Math.cos(phase));
  const distortedReceived = message.map(
    (value, index) => (1 + config.modulationIndex * value) * distortedCarrier[index],
  );

  // Inject AWGN using an SNR control so degradation is easy to reason about.
  const noisy = config.enableNoise
    ? applyAwgn(distortedReceived, config.snr)
    : [...distortedReceived];

  return {
    t,
    message,
    txCarrier,
    idealReceived,
    distortedReceived,
    noisy,
    frequencyError,
    instantaneousFrequency: frequencyError.map(
      (value) => config.carrierFrequency + value,
    ),
  };
}
