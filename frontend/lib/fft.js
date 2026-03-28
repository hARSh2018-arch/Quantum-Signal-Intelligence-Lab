export function computeFFT(signal, sampleRate) {
  const N = signal.length;
  const limit = Math.floor(N / 2);
  const frequencies = [];
  const magnitudes = [];

  for (let k = 0; k < limit; k += 1) {
    let real = 0;
    let imag = 0;
    for (let n = 0; n < N; n += 1) {
      const angle = (2 * Math.PI * k * n) / N;
      real += signal[n] * Math.cos(angle);
      imag -= signal[n] * Math.sin(angle);
    }
    frequencies.push((k * sampleRate) / N);
    magnitudes.push(Math.sqrt(real ** 2 + imag ** 2) / N);
  }

  return { frequencies, magnitudes };
}

