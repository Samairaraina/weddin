function ScenarioCompare({ baseEstimate, altEstimate, onChangeTier }) {
  const rows = Object.entries(baseEstimate?.section_totals || {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Scenario Compare</p>
          <h3 className="mt-2 font-display text-2xl text-maroon">Swap the hotel tier instantly</h3>
        </div>
        <select className="field max-w-xs" onChange={(event) => onChangeTier(event.target.value)} defaultValue="">
          <option value="" disabled>
            Choose alternate tier
          </option>
          <option value="5star_city">5-Star City</option>
          <option value="4star">4-Star</option>
          <option value="resort">Resort</option>
          <option value="farmhouse">Farmhouse</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {rows.map(([key, section]) => {
          const baseMid = section.mid;
          const altMid = altEstimate?.section_totals?.[key]?.mid ?? 0;
          const delta = altEstimate ? altMid - baseMid : null;
          return (
            <div key={key} className="panel p-5">
              <p className="font-semibold text-maroon">{section.label}</p>
              <p className="mt-2 text-sm text-black/60">Current: Rs {baseMid.toLocaleString()}</p>
              <p className="text-sm text-black/60">Alternate: Rs {altMid.toLocaleString()}</p>
              <p className={`mt-3 font-semibold ${delta > 0 ? "text-maroon" : "text-sage"}`}>
                {delta === null ? "Awaiting alternate" : `${delta > 0 ? "+" : ""}Rs ${delta.toLocaleString()}`}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScenarioCompare;
