export function gaussianRandom() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export function applyNoise(signal, noiseLevel) {
  const level = Math.max(0, noiseLevel);
  return signal.map((value) => value + gaussianRandom() * level);
}

export function snrToNoiseAmplitude(snrDb) {
  return Math.pow(10, -snrDb / 20);
}

