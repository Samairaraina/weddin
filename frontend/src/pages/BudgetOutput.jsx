import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { downloadPDF, estimateBudget, getBudgetById, getNarrative } from "../api";
import BudgetChart from "../components/BudgetChart";
import ConfidenceMeter from "../components/ConfidenceMeter";
import NarrativeBox from "../components/NarrativeBox";
import ScenarioCompare from "../components/ScenarioCompare";

function BudgetOutput() {
  const { sessionId } = useParams();
  const [estimate, setEstimate] = useState(null);
  const [altEstimate, setAltEstimate] = useState(null);
  const [narrative, setNarrative] = useState("");
  const [tab, setTab] = useState("summary");
  const [loadingNarrative, setLoadingNarrative] = useState(false);

  useEffect(() => {
    getBudgetById(sessionId).then((response) => {
      setEstimate(response.data);
      setNarrative(response.data.ai_narrative || "");
    });
  }, [sessionId]);

  const chartData = useMemo(() => Object.values(estimate?.section_totals || {}), [estimate]);
  const summaryCards = useMemo(() => {
    if (!estimate) {
      return [];
    }
    return [
      { label: "Low estimate", value: `Rs ${estimate.grand_total_min.toLocaleString()}` },
      { label: "High estimate", value: `Rs ${estimate.grand_total_max.toLocaleString()}` },
      { label: "Functions", value: String(estimate.meta.functions_considered.length) },
      { label: "Outstation guests", value: String(estimate.meta.outstation_guests) }
    ];
  }, [estimate]);

  const loadScenario = async (hotelTier) => {
    if (!estimate?.inputs) return;
    const response = await estimateBudget({ ...estimate.inputs, hotel_tier: hotelTier });
    setAltEstimate(response.data);
  };

  const handleNarrative = async () => {
    setLoadingNarrative(true);
    try {
      const response = await getNarrative(sessionId);
      setNarrative(response.data.narrative);
    } finally {
      setLoadingNarrative(false);
    }
  };

  const handlePDF = async () => {
    const response = await downloadPDF(sessionId);
    const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    window.open(url, "_blank");
  };

  if (!estimate) {
    return <main className="mx-auto max-w-6xl px-4 py-20">Loading estimate...</main>;
  }

  return (
    <main className="section-shell">
      <div className="panel p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-gold">Budget Output</p>
        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-5xl text-maroon">
              Rs {(estimate.grand_total_min / 100000).toFixed(1)}L - Rs {(estimate.grand_total_max / 100000).toFixed(1)}L
            </h1>
            <p className="mt-3 max-w-2xl text-black/70">Every section is traceable to an explicit cost formula, seeded rate card, or selected artist/logistics rule.</p>
          </div>
          <button className="btn-secondary" onClick={handlePDF}>
            Download PDF
          </button>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className="metric-card">
              <p className="text-xs uppercase tracking-[0.28em] text-black/45">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-maroon">{card.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {["summary", "breakdown", "scenario", "ai"].map((item) => (
          <button key={item} className={`rounded-full px-5 py-3 font-semibold capitalize ${tab === item ? "bg-maroon text-white" : "bg-white text-maroon"}`} onClick={() => setTab(item)}>
            {item}
          </button>
        ))}
      </div>

      {tab === "summary" && (
        <section className="mt-8 grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="panel p-6">
            <ConfidenceMeter value={estimate.confidence} />
            <div className="soft-divider mt-4 pt-4 text-sm leading-7 text-black/65">
              Confidence rises when the event is more tightly specified. Named artists, guest logistics, and a stable decor tier narrow the range.
            </div>
          </div>
          <div className="panel p-6">
            <BudgetChart data={chartData} />
          </div>
        </section>
      )}

      {tab === "breakdown" && (
        <section className="mt-8 space-y-4">
          {Object.entries(estimate.breakdown).map(([key, section]) => (
            <details key={key} className="panel p-5" open={key === "venue"}>
              <summary className="cursor-pointer list-none font-display text-2xl text-maroon">
                {section.label}
                <span className="ml-3 text-base text-black/45">Rs {Math.round((section.total_min + section.total_max) / 2).toLocaleString()} mid</span>
              </summary>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left">
                  <thead>
                    <tr className="text-sm uppercase tracking-[0.2em] text-gold">
                      <th className="pb-3">Item</th>
                      <th className="pb-3">Low</th>
                      <th className="pb-3">Mid</th>
                      <th className="pb-3">High</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(section.items).map(([itemKey, item]) => (
                      <tr key={itemKey} className="border-t border-black/5">
                        <td className="py-3">{item.note || itemKey}</td>
                        <td>Rs {item.min.toLocaleString()}</td>
                        <td>Rs {Math.round((item.min + item.max) / 2).toLocaleString()}</td>
                        <td>Rs {item.max.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </section>
      )}

      {tab === "scenario" && (
        <section className="mt-8 panel p-6">
          <ScenarioCompare baseEstimate={estimate} altEstimate={altEstimate} onChangeTier={loadScenario} />
        </section>
      )}

      {tab === "ai" && (
        <section className="mt-8 space-y-6">
          <NarrativeBox narrative={narrative} loading={loadingNarrative} onGenerate={handleNarrative} />
          <div className="panel p-6">
            <pre className="whitespace-pre-wrap font-body text-base leading-8 text-black/70">{narrative || "No AI narrative generated yet."}</pre>
          </div>
        </section>
      )}
    </main>
  );
}

export default BudgetOutput;
