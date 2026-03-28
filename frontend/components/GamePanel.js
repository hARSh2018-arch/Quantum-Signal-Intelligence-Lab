export default function GamePanel({ score, mse, targetType, liveHint, gameMode }) {
  return (
    <div className="glass-panel rounded-3xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-warning/90">Recovery Game</p>
          <h3 className="mt-2 text-lg font-semibold">Decode the hidden transmission</h3>
        </div>
        <div className="rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-sm text-warning">
          {gameMode ? "Active" : "Preview"}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Similarity</div>
          <div className="mt-3 text-3xl font-semibold text-accent">{score}%</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Residual Error</div>
          <div className="mt-3 text-3xl font-semibold text-electric">{mse.toFixed(4)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Target Mode</div>
          <div className="mt-3 text-2xl font-semibold text-white">{targetType}</div>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-accent/20 bg-accent/10 p-4 text-sm text-slate-200">
        {liveHint}
      </div>
    </div>
  );
}

