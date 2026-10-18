function nextPowerOfTwo(value) {
  let size = 1;
  while (size < value) {
    size <<= 1;
  }
  return size;
}

function reverseBits(value, bits) {
  let reversed = 0;
  for (let index = 0; index < bits; index += 1) {
    reversed = (reversed << 1) | (value & 1);
    value >>= 1;
  }
  return reversed;
}

function radix2Fft(real, imag) {
  const size = real.length;
  const bits = Math.log2(size);

  for (let index = 0; index < size; index += 1) {
    const reversedIndex = reverseBits(index, bits);
    if (reversedIndex > index) {
      [real[index], real[reversedIndex]] = [real[reversedIndex], real[index]];
      [imag[index], imag[reversedIndex]] = [imag[reversedIndex], imag[index]];
    }
  }

  for (let blockSize = 2; blockSize <= size; blockSize <<= 1) {
    const halfBlock = blockSize >> 1;
    const phaseStep = (-2 * Math.PI) / blockSize;

    for (let start = 0; start < size; start += blockSize) {
      for (let offset = 0; offset < halfBlock; offset += 1) {
        const angle = phaseStep * offset;
        const twiddleReal = Math.cos(angle);
        const twiddleImag = Math.sin(angle);
        const evenIndex = start + offset;
        const oddIndex = evenIndex + halfBlock;

        const tempReal = twiddleReal * real[oddIndex] - twiddleImag * imag[oddIndex];
        const tempImag = twiddleReal * imag[oddIndex] + twiddleImag * real[oddIndex];

        real[oddIndex] = real[evenIndex] - tempReal;
        imag[oddIndex] = imag[evenIndex] - tempImag;
        real[evenIndex] += tempReal;
        imag[evenIndex] += tempImag;
      }
    }
  }
}

export function computeFFT(signal, sampleRate) {
  const size = nextPowerOfTwo(signal.length);
  const real = new Array(size).fill(0);
  const imag = new Array(size).fill(0);

  for (let index = 0; index < signal.length; index += 1) {
    real[index] = signal[index];
  }

  radix2Fft(real, imag);

  const limit = Math.floor(size / 2);
  const frequencies = new Array(limit);
  const magnitudes = new Array(limit);

  for (let index = 0; index < limit; index += 1) {
    frequencies[index] = (index * sampleRate) / size;
    magnitudes[index] = Math.sqrt(real[index] ** 2 + imag[index] ** 2) / signal.length;
  }

  return { frequencies, magnitudes };
}
