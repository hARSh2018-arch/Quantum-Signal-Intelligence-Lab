import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function FFTPlot({ frequencies, magnitudes, accent = "#73a5ff" }) {
  return (
    <div className="glass-panel plot-shell rounded-3xl p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Frequency Spectrum</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">FFT</span>
      </div>
      <Plot
        data={[
          {
            x: frequencies,
            y: magnitudes,
            type: "scatter",
            mode: "lines",
            fill: "tozeroy",
            line: { color: accent, width: 2.4 },
            fillcolor: "rgba(115,165,255,0.18)",
          },
        ]}
        layout={{
          autosize: true,
          height: 300,
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          margin: { l: 40, r: 10, t: 10, b: 35 },
          font: { color: "#cbd5e1" },
          xaxis: { title: "Hz", gridcolor: "rgba(148,163,184,0.14)" },
          yaxis: { title: "Magnitude", gridcolor: "rgba(148,163,184,0.14)" },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%" }}
      />
    </div>
  );
}

