function NarrativeBox({ narrative, loading, onGenerate }) {
  return (
    <div className="panel p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold">AI Narrative</p>
          <h3 className="mt-2 font-display text-2xl text-maroon">Planner-ready summary</h3>
        </div>
        <button className="btn-primary" onClick={onGenerate} disabled={loading}>
          {loading ? "Generating..." : "Generate AI Analysis"}
        </button>
      </div>
      <p className="mt-4 leading-7 text-black/70">{narrative || "Generate the narrative to explain the major budget drivers and tradeoffs."}</p>
    </div>
  );
}

export default NarrativeBox;
