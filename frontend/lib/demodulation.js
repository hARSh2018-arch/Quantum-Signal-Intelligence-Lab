function movingAverage(signal, windowSize) {
  const size = Math.max(3, windowSize);
  return signal.map((_, index) => {
    const start = Math.max(0, index - size);
    const end = Math.min(signal.length, index + size);
    const slice = signal.slice(start, end);
    return slice.reduce((sum, value) => sum + value, 0) / slice.length;
  });
}

export function demodulateSignal({
  signal,
  time,
  carrierFrequency,
  phase,
  sampleRate,
  type,
}) {
  const phaseRad = (phase * Math.PI) / 180;
  const inPhase = signal.map(
    (value, index) =>
      value * Math.cos(2 * Math.PI * carrierFrequency * time[index] + phaseRad),
  );

  if (type === "homodyne") {
    return {
      recovered: movingAverage(inPhase, Math.floor(sampleRate * 0.025)),
      iComponent: inPhase,
      qComponent: new Array(signal.length).fill(0),
    };
  }

  const quadrature = signal.map(
    (value, index) =>
      value * Math.sin(2 * Math.PI * carrierFrequency * time[index] + phaseRad),
  );

  const iSmooth = movingAverage(inPhase, Math.floor(sampleRate * 0.02));
  const qSmooth = movingAverage(quadrature, Math.floor(sampleRate * 0.02));
  const recovered = iSmooth.map((value, index) => Math.sqrt(value ** 2 + qSmooth[index] ** 2));

  return {
    recovered,
    iComponent: iSmooth,
    qComponent: qSmooth,
  };
}

