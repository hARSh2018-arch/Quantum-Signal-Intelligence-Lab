import clsx from "clsx";

function Slider({ label, value, min, max, step, onChange, suffix = "", accent = "accent" }) {
  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span className={clsx("font-semibold", accent === "warning" ? "text-warning" : "text-accent")}>
          {value}
          {suffix}
        </span>
      </div>
      <input
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function Toggle({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-slate-300">{label}</div>
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-950/50 p-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              "rounded-xl px-3 py-2 text-sm transition",
              value === option.value
                ? "bg-accent/20 text-accent"
                : "text-slate-400 hover:bg-white/5 hover:text-white",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Switch({ label, checked, onChange }) {
  return (
    <label className="flex min-h-[60px] items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
      <span className="pr-2">{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

export default function ControlPanel({ controls, setControls, presetKey, applyPreset }) {
  const loOffset = (controls.loFrequency - controls.frequency).toFixed(1);

  return (
    <div className="glass-panel h-full rounded-3xl p-5 shadow-glow lg:p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-accent/80">Mission Controls</p>
          <h2 className="mt-2 text-2xl font-semibold">Adaptive Demodulation Deck</h2>
        </div>
        <div className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
          Live DSP
        </div>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {[
          { key: "radio", label: "Radio Signal" },
          { key: "deepSpace", label: "Deep Space Signal" },
          { key: "quantum", label: "Quantum Experiment" },
        ].map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => applyPreset(preset.key)}
            className={clsx(
              "flex h-full min-h-[88px] flex-col justify-between rounded-2xl border px-4 py-3 text-left transition",
              presetKey === preset.key
                ? "border-accent/60 bg-accent/10 text-white"
                : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10",
            )}
          >
            <div className="text-sm font-medium">{preset.label}</div>
            <div className="mt-1 text-xs text-slate-400">Load scenario profile</div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Slider
          label="Received Carrier"
          value={controls.frequency}
          min={4}
          max={64}
          step={1}
          suffix=" Hz"
          onChange={(value) =>
            setControls((prev) => ({
              ...prev,
              frequency: value,
              carrierFrequency: value,
            }))
          }
        />
        <Slider
          label="Received Phase"
          value={controls.phase}
          min={0}
          max={180}
          step={1}
          suffix=" deg"
          onChange={(value) => setControls((prev) => ({ ...prev, phase: value }))}
        />
        <Slider
          label="Noise Level (SNR)"
          value={controls.snr}
          min={0}
          max={35}
          step={1}
          suffix=" dB"
          accent="warning"
          onChange={(value) => setControls((prev) => ({ ...prev, snr: value }))}
        />
        <Slider
          label="Sampling Rate"
          value={controls.sampleRate}
          min={128}
          max={1024}
          step={32}
          suffix=" Hz"
          onChange={(value) => setControls((prev) => ({ ...prev, sampleRate: value }))}
        />
      </div>

      <div className="mt-5">
        <div className="h-full rounded-3xl border border-white/10 bg-slate-950/30 p-4">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Local Oscillator</div>
          <div className="mt-4 grid gap-4">
            <Slider
              label="LO Frequency"
              value={controls.loFrequency}
              min={4}
              max={64}
              step={0.1}
              suffix=" Hz"
              onChange={(value) => setControls((prev) => ({ ...prev, loFrequency: value }))}
            />
            <Slider
              label="LO Phase"
              value={controls.loPhase}
              min={0}
              max={180}
              step={1}
              suffix=" deg"
              onChange={(value) => setControls((prev) => ({ ...prev, loPhase: value }))}
            />
            <Slider
              label="LO Amplitude"
              value={controls.loAmplitude}
              min={0.1}
              max={2}
              step={0.05}
              onChange={(value) => setControls((prev) => ({ ...prev, loAmplitude: value }))}
            />
            <Slider
              label="LO Offset"
              value={Number(loOffset)}
              min={-8}
              max={8}
              step={0.1}
              suffix=" Hz"
              onChange={(value) =>
                setControls((prev) => ({
                  ...prev,
                  loFrequency: Number((prev.frequency + value).toFixed(1)),
                }))
              }
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        <Toggle
          label="Demodulation"
          value={controls.demodulationType}
          onChange={(value) => setControls((prev) => ({ ...prev, demodulationType: value }))}
          options={[
            { label: "Homodyne", value: "homodyne" },
            { label: "Heterodyne", value: "heterodyne" },
          ]}
        />
        <Toggle
          label="Analysis Mode"
          value={controls.mode}
          onChange={(value) => setControls((prev) => ({ ...prev, mode: value }))}
          options={[
            { label: "Classical", value: "classical" },
            { label: "Quantum", value: "quantum" },
          ]}
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <Switch
          label="Drift + Distortion"
          checked={controls.enableDrift}
          onChange={(checked) => setControls((prev) => ({ ...prev, enableDrift: checked }))}
        />
        <Switch
          label="Frequency Offset"
          checked={controls.enableOffset}
          onChange={(checked) => setControls((prev) => ({ ...prev, enableOffset: checked }))}
        />
        <Switch
          label="Comparison Mode"
          checked={controls.enableComparison}
          onChange={(checked) => setControls((prev) => ({ ...prev, enableComparison: checked }))}
        />
        <Switch
          label="Game Mode"
          checked={controls.gameMode}
          onChange={(checked) => setControls((prev) => ({ ...prev, gameMode: checked }))}
        />
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/30 p-4">
        <div className="text-xs uppercase tracking-[0.3em] text-slate-400">Frequency Offset</div>
        <div className="mt-4 grid gap-4">
          <Slider
            label="Frequency Offset"
            value={controls.frequencyOffset}
            min={-8}
            max={8}
            step={0.1}
            suffix=" Hz"
            onChange={(value) => setControls((prev) => ({ ...prev, frequencyOffset: value }))}
          />
        </div>
      </div>
    </div>
  );
}
