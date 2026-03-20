import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { calculateBudget, generateNarrative } from "../budgetEngine";
import { describeApiError, getBudgetById } from "../api";
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
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadEstimate = async () => {
      try {
        const stored = localStorage.getItem(`budget_${sessionId}`);
        if (stored) {
          const data = JSON.parse(stored);
          if (!cancelled) {
            setEstimate(data);
            setNarrative(data.ai_narrative || "");
            setError("");
          }
          return;
        }
      } catch {
        localStorage.removeItem(`budget_${sessionId}`);
      }

      try {
        const response = await getBudgetById(sessionId);
        localStorage.setItem(`budget_${sessionId}`, JSON.stringify(response.data));
        if (!cancelled) {
          setEstimate(response.data);
          setNarrative(response.data.ai_narrative || "");
          setError("");
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(describeApiError(loadError) || "Budget not found. Please go back and generate a new estimate.");
        }
      }
    };

    loadEstimate();

    return () => {
      cancelled = true;
    };
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

  const loadScenario = (hotelTier) => {
    if (!estimate?.inputs) return;
    try {
      const result = calculateBudget({ ...estimate.inputs, hotel_tier: hotelTier });
      setAltEstimate(result);
    } catch {
      /* ignore */
    }
  };

  const handleNarrative = () => {
    setLoadingNarrative(true);
    try {
      const text = generateNarrative(estimate);
      setNarrative(text);
    } finally {
      setLoadingNarrative(false);
    }
  };

  const handlePDF = () => {
    // Build a simple printable view and trigger browser print
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const minL = (estimate.grand_total_min / 100000).toFixed(1);
    const maxL = (estimate.grand_total_max / 100000).toFixed(1);
    let rows = "";
    for (const [, section] of Object.entries(estimate.breakdown)) {
      rows += `<tr style="background:#f9f4ef"><td colspan="4" style="padding:10px;font-weight:bold;font-size:16px">${section.label}</td></tr>`;
      for (const [itemKey, item] of Object.entries(section.items)) {
        rows += `<tr><td style="padding:6px 10px">${item.note || itemKey}</td><td style="padding:6px 10px">Rs ${item.min.toLocaleString()}</td><td style="padding:6px 10px">Rs ${Math.round((item.min + item.max) / 2).toLocaleString()}</td><td style="padding:6px 10px">Rs ${item.max.toLocaleString()}</td></tr>`;
      }
    }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>Wedding Budget</title><style>body{font-family:Georgia,serif;max-width:800px;margin:auto;padding:40px}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #eee;text-align:left}h1{color:#6b1d2a}</style></head><body><h1>Wedding Budget Estimate</h1><p>Range: Rs ${minL}L – Rs ${maxL}L | Confidence: ${estimate.confidence}%</p><table><thead><tr><th>Item</th><th>Low</th><th>Mid</th><th>High</th></tr></thead><tbody>${rows}</tbody></table><script>setTimeout(()=>window.print(),400)<\/script></body></html>`);
    printWindow.document.close();
  };

  if (!estimate) {
    return <main className="mx-auto max-w-6xl px-4 py-20">{error || "Loading estimate..."}</main>;
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
