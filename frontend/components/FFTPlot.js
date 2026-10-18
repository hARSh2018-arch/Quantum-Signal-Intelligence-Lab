import dynamic from "next/dynamic";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export default function FFTPlot({ title = "Frequency Spectrum", traces }) {
  return (
    <div className="glass-panel plot-shell flex h-full min-w-0 flex-col rounded-3xl p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">FFT</span>
      </div>
      <Plot
        data={traces.map((trace) => ({
          x: trace.frequencies,
          y: trace.magnitudes,
          type: "scatter",
          mode: "lines",
          name: trace.name,
          fill: "tozeroy",
          line: { color: trace.color, width: 2.2 },
          fillcolor: trace.fillColor,
        }))}
        layout={{
          autosize: true,
          height: 300,
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
          margin: { l: 40, r: 10, t: 10, b: 35 },
          font: { color: "#cbd5e1" },
          legend: { orientation: "h", x: 0, y: 1.15 },
          xaxis: { title: "Frequency (Hz)", gridcolor: "rgba(148,163,184,0.14)" },
          yaxis: { title: "Magnitude", gridcolor: "rgba(148,163,184,0.14)" },
        }}
        config={{ displayModeBar: false, responsive: true }}
        style={{ width: "100%", minWidth: 0 }}
      />
    </div>
  );
}
