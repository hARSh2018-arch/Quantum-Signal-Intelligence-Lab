export function gaussianRandom() {
  let u = 0;
  let v = 0;

  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();

  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function signalPower(signal) {
  return signal.reduce((sum, value) => sum + value * value, 0) / Math.max(signal.length, 1);
}

export function snrToNoiseAmplitude(signal, snrDb) {
  const power = signalPower(signal);
  const noisePower = power / Math.pow(10, snrDb / 10);
  return Math.sqrt(Math.max(noisePower, 0));
}

export function applyNoise(signal, noiseLevel) {
  const level = Math.max(0, noiseLevel);
  return signal.map((value) => value + gaussianRandom() * level);
}

export function applyAwgn(signal, snrDb) {
  return applyNoise(signal, snrToNoiseAmplitude(signal, snrDb));
}
