function normalize(signal) {
  const max = Math.max(...signal.map((value) => Math.abs(value)), 1e-6);
  return signal.map((value) => value / max);
}

export function scoreRecovery(reference, recovered) {
  const ref = normalize(reference);
  const out = normalize(recovered);
  const error = ref.map((value, index) => value - out[index]);
  const mse = error.reduce((sum, value) => sum + value * value, 0) / error.length;
  const similarity = Math.max(0, 100 - mse * 100);
  return {
    similarity: Number(similarity.toFixed(1)),
    error,
    mse,
  };
}

