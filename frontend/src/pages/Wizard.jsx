import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { estimateBudget, getArtists } from "../api";
import WizardStep from "../components/WizardStep";

const cities = ["udaipur", "jaipur", "mumbai", "delhi", "goa", "jodhpur", "hyderabad"];
const hotelTiers = ["5star_palace", "5star_city", "4star", "resort", "farmhouse"];
const functionOptions = ["mehendi", "haldi", "sangeet", "baraat", "pheras", "reception"];

function Wizard() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    city: "udaipur",
    hotel_tier: "5star_palace",
    hotel_rooms: 80,
    total_guests: 400,
    outstation_pct: 60,
    num_functions: 5,
    functions: ["mehendi", "sangeet", "baraat", "pheras", "reception"],
    bride_hometown: "Delhi",
    groom_hometown: "Mumbai",
    decor_style: "premium",
    entertainment_preference: "standard",
    bar_type: "full_bar",
    selected_artists: [],
    include_photography: true,
    contingency_pct: 10
  });

  useEffect(() => {
    getArtists().then((response) => setArtists(response.data.artists.slice(0, 8))).catch(() => setArtists([]));
  }, []);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleFunction = (value) => {
    setForm((current) => {
      const functions = current.functions.includes(value) ? current.functions.filter((item) => item !== value) : [...current.functions, value];
      return { ...current, functions, num_functions: functions.length || 1 };
    });
  };
  const toggleArtist = (id) => {
    setForm((current) => ({
      ...current,
      selected_artists: current.selected_artists.includes(id) ? current.selected_artists.filter((item) => item !== id) : [...current.selected_artists, id]
    }));
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await estimateBudget(form);
      navigate(`/budget/${response.data.session_id}`);
    } catch {
      setError("Could not generate estimate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const controls = (
    <div className="mt-8 flex items-center justify-between">
      <button className="btn-secondary" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>
        Back
      </button>
      {step < 6 ? (
        <button className="btn-primary" onClick={() => setStep((value) => Math.min(6, value + 1))}>
          Continue
        </button>
      ) : (
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? "Generating..." : "Generate Budget"}
        </button>
      )}
    </div>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Estimate Wizard</p>
          <h1 className="mt-2 font-display text-4xl text-maroon">Step {step} of 6</h1>
        </div>
        <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-semibold">{Math.round((step / 6) * 100)}% complete</div>
      </div>

      {step === 1 && (
        <WizardStep title="Wedding Basics" subtitle="Step 1">
          <div className="grid gap-4 md:grid-cols-2">
            <select className="field" value={form.city} onChange={(event) => setField("city", event.target.value)}>{cities.map((city) => <option key={city}>{city}</option>)}</select>
            <select className="field" value={form.hotel_tier} onChange={(event) => setField("hotel_tier", event.target.value)}>{hotelTiers.map((tier) => <option key={tier}>{tier}</option>)}</select>
            <input className="field" type="number" value={form.num_functions} onChange={(event) => setField("num_functions", Number(event.target.value))} />
            <input className="field" value={form.bride_hometown} onChange={(event) => setField("bride_hometown", event.target.value)} placeholder="Bride hometown" />
            <input className="field md:col-span-2" value={form.groom_hometown} onChange={(event) => setField("groom_hometown", event.target.value)} placeholder="Groom hometown" />
          </div>
          {controls}
        </WizardStep>
      )}

      {step === 2 && (
        <WizardStep title="Guest Profile" subtitle="Step 2">
          <div className="grid gap-4 md:grid-cols-3">
            <input className="field" type="number" value={form.total_guests} onChange={(event) => setField("total_guests", Number(event.target.value))} placeholder="Guests" />
            <input className="field" type="number" value={form.outstation_pct} onChange={(event) => setField("outstation_pct", Number(event.target.value))} placeholder="Outstation %" />
            <input className="field" type="number" value={form.hotel_rooms} onChange={(event) => setField("hotel_rooms", Number(event.target.value))} placeholder="Hotel rooms" />
          </div>
          {controls}
        </WizardStep>
      )}

      {step === 3 && (
        <WizardStep title="Functions" subtitle="Step 3">
          <div className="grid gap-3 md:grid-cols-3">
            {functionOptions.map((item) => (
              <button key={item} className={`rounded-3xl border p-5 text-left ${form.functions.includes(item) ? "border-maroon bg-maroon text-white" : "border-black/10 bg-white"}`} onClick={() => toggleFunction(item)}>
                <p className="font-display text-2xl capitalize">{item}</p>
                <p className="mt-2 text-sm opacity-80">Included in the budget engine and breakdown.</p>
              </button>
            ))}
          </div>
          {controls}
        </WizardStep>
      )}

      {step === 4 && (
        <WizardStep title="Decor & Style" subtitle="Step 4">
          <div className="grid gap-3 md:grid-cols-4">
            {["budget", "mid", "premium", "ultra-premium"].map((item) => (
              <button key={item} className={`rounded-3xl border p-5 capitalize ${form.decor_style === item ? "border-gold bg-gold text-white" : "border-black/10 bg-white"}`} onClick={() => setField("decor_style", item)}>
                {item}
              </button>
            ))}
          </div>
          {controls}
        </WizardStep>
      )}

      {step === 5 && (
        <WizardStep title="Entertainment & Hospitality" subtitle="Step 5">
          <div className="grid gap-4 md:grid-cols-2">
            <select className="field" value={form.entertainment_preference} onChange={(event) => setField("entertainment_preference", event.target.value)}>
              <option value="minimal">minimal</option>
              <option value="standard">standard</option>
              <option value="premium">premium</option>
            </select>
            <select className="field" value={form.bar_type} onChange={(event) => setField("bar_type", event.target.value)}>
              <option value="dry">dry</option>
              <option value="beer_wine">beer_wine</option>
              <option value="full_bar">full_bar</option>
            </select>
          </div>
          <label className="mt-4 flex items-center gap-3">
            <input type="checkbox" checked={form.include_photography} onChange={(event) => setField("include_photography", event.target.checked)} />
            Include photography and cinematography
          </label>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {artists.map((artist) => (
              <button key={artist.id} className={`rounded-3xl border p-4 text-left ${form.selected_artists.includes(artist.id) ? "border-sage bg-sage text-white" : "border-black/10 bg-white"}`} onClick={() => toggleArtist(artist.id)}>
                <p className="font-semibold">{artist.name}</p>
                <p className="mt-1 text-sm opacity-80">Rs {artist.cost_min.toLocaleString()} - Rs {artist.cost_max.toLocaleString()}</p>
              </button>
            ))}
          </div>
          {controls}
        </WizardStep>
      )}

      {step === 6 && (
        <WizardStep title="Review & Estimate" subtitle="Step 6">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(form).map(([key, value]) => (
              <div key={key} className="rounded-3xl bg-white p-4">
                <p className="text-xs uppercase tracking-[0.25em] text-gold">{key.replaceAll("_", " ")}</p>
                <p className="mt-2 font-semibold text-maroon">{Array.isArray(value) ? value.join(", ") || "None selected" : String(value)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <label className="text-sm font-semibold">Contingency %</label>
            <input className="field mt-2 max-w-xs" type="number" value={form.contingency_pct} onChange={(event) => setField("contingency_pct", Number(event.target.value))} />
          </div>
          {error ? <p className="mt-4 text-sm font-semibold text-maroon">{error}</p> : null}
          {controls}
        </WizardStep>
      )}
    </main>
  );
}

export default Wizard;
