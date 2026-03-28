import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export default function QuantumPanel({ enabled, snr, demodulationType }) {
  const [histogram, setHistogram] = useState({ "0": 0, "1": 0 });
  const [noisyHistogram, setNoisyHistogram] = useState({ "0": 0, "1": 0 });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;

    async function runSimulation() {
      try {
        const [cleanResponse, noisyResponse] = await Promise.all([
          fetch(`${API_BASE}/quantum/simulate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shots: 512 }),
          }),
          fetch(`${API_BASE}/quantum/noisy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ shots: 512, noise: Math.max(0.02, 1 / snr) }),
          }),
        ]);

        if (!cleanResponse.ok || !noisyResponse.ok) {
          throw new Error("Quantum service is unavailable.");
        }

        const cleanData = await cleanResponse.json();
        const noisyData = await noisyResponse.json();
        if (!cancelled) {
          setHistogram(cleanData.counts || { "0": 0, "1": 0 });
          setNoisyHistogram(noisyData.counts || { "0": 0, "1": 0 });
          setError("");
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError.message);
        }
      }
    }

    runSimulation();
    return () => {
      cancelled = true;
    };
  }, [enabled, snr, demodulationType]);

  const probabilities = useMemo(() => {
    const total = Object.values(histogram).reduce((sum, value) => sum + value, 0) || 1;
    return {
      zero: (histogram["0"] || 0) / total,
      one: (histogram["1"] || 0) / total,
    };
  }, [histogram]);

  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Quantum Twin</p>
          <h3 className="mt-2 text-xl font-semibold">Classical vs Quantum Readout</h3>
        </div>
        <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
          Hadamard |0&gt; ? H ? Measure
        </div>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Conceptual Mapping</div>
          <div className="mt-3 space-y-2 text-sm text-slate-200">
            <div>Amplitude ? probability amplitude</div>
            <div>Noise ? measurement uncertainty</div>
            <div>{demodulationType} lock-in ? basis alignment</div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">State Confidence</div>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-slate-950/60 p-3">
              <div className="text-slate-400">P(0)</div>
              <div className="mt-2 text-2xl font-semibold text-electric">{probabilities.zero.toFixed(2)}</div>
            </div>
            <div className="rounded-2xl bg-slate-950/60 p-3">
              <div className="text-slate-400">P(1)</div>
              <div className="mt-2 text-2xl font-semibold text-accent">{probabilities.one.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-rose-100">
          {error} Start the FastAPI backend to unlock the live histogram.
        </div>
      ) : (
        <Plot
          data={[
            {
              x: ["Clean |0>", "Clean |1>", "Noisy |0>", "Noisy |1>"],
              y: [histogram["0"] || 0, histogram["1"] || 0, noisyHistogram["0"] || 0, noisyHistogram["1"] || 0],
              type: "bar",
              marker: { color: ["#73a5ff", "#7cf7d4", "#4064b5", "#3dbf9f"] },
            },
          ]}
          layout={{
            autosize: true,
            height: 280,
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            margin: { l: 35, r: 10, t: 10, b: 35 },
            font: { color: "#cbd5e1" },
            yaxis: { title: "Counts", gridcolor: "rgba(148,163,184,0.14)" },
          }}
          config={{ displayModeBar: false, responsive: true }}
          style={{ width: "100%" }}
        />
      )}
    </div>
  );
}

