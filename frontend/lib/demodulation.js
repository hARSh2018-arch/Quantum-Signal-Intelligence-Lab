function movingAverage(signal, windowSize) {
  const radius = Math.max(1, Math.floor(windowSize));
  const prefix = new Array(signal.length + 1).fill(0);

  for (let index = 0; index < signal.length; index += 1) {
    prefix[index + 1] = prefix[index] + signal[index];
  }

  return signal.map((_, index) => {
    const start = Math.max(0, index - radius);
    const end = Math.min(signal.length, index + radius + 1);
    return (prefix[end] - prefix[start]) / (end - start);
  });
}

function createOscillator(time, frequency, phaseDegrees, amplitude = 1) {
  const phaseRad = (phaseDegrees * Math.PI) / 180;
  const inPhase = time.map(
    (sampleTime) => amplitude * Math.cos(2 * Math.PI * frequency * sampleTime + phaseRad),
  );
  const quadrature = time.map(
    (sampleTime) => amplitude * Math.sin(2 * Math.PI * frequency * sampleTime + phaseRad),
  );

  return {
    inPhase,
    quadrature,
  };
}

export function demodulateSignal({
  signal,
  time,
  carrierFrequency,
  frequencyOffset = 0,
  phase,
  loFrequency,
  loPhase,
  loAmplitude,
  sampleRate,
  type,
}) {
  const oscillatorFrequency = loFrequency ?? carrierFrequency + frequencyOffset;
  const oscillatorPhase = loPhase ?? phase;
  const oscillator = createOscillator(time, oscillatorFrequency, oscillatorPhase, loAmplitude);

  const mixedInPhase = signal.map((value, index) => value * oscillator.inPhase[index]);
  const mixedQuadrature = signal.map((value, index) => value * oscillator.quadrature[index]);

  const smoothingWindow = Math.max(3, Math.floor(sampleRate * 0.025));
  const iSmooth = movingAverage(mixedInPhase, smoothingWindow);
  const qSmooth =
    type === "heterodyne"
      ? movingAverage(mixedQuadrature, smoothingWindow)
      : new Array(signal.length).fill(0);

  const recovered =
    type === "heterodyne"
      ? iSmooth.map((value, index) => Math.sqrt(value ** 2 + qSmooth[index] ** 2))
      : iSmooth;

  return {
    recovered,
    iComponent: iSmooth,
    qComponent: qSmooth,
    mixedInPhase,
    mixedQuadrature,
    localOscillator: oscillator.inPhase,
    localOscillatorQuadrature: oscillator.quadrature,
    oscillatorFrequency,
    oscillatorPhase,
  };
}
