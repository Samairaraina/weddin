import { CalendarDays, Camera, Crown, Martini, MapPin, Music4, Sparkles, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { estimateBudget, getArtists } from "../api";
import WizardStep from "../components/WizardStep";

const cities = ["udaipur", "jaipur", "mumbai", "delhi", "goa", "jodhpur", "hyderabad"];
const hotelTiers = ["5star_palace", "5star_city", "4star", "resort", "farmhouse"];
const functionOptions = ["mehendi", "haldi", "sangeet", "baraat", "pheras", "reception"];
const stepMeta = [
  { title: "Wedding Basics", subtitle: "City, venue tier, and who the celebration is built for.", icon: MapPin },
  { title: "Guest Profile", subtitle: "Hospitality assumptions drive rooming, transfers, and service scale.", icon: Users },
  { title: "Functions", subtitle: "Choose the moments that shape decor, F&B, and logistics.", icon: CalendarDays },
  { title: "Decor & Style", subtitle: "Pick the design ambition and the visual temperature of the wedding.", icon: Crown },
  { title: "Entertainment & F&B", subtitle: "Artist choices, bar program, and photography change the budget sharply.", icon: Music4 },
  { title: "Review & Estimate", subtitle: "Review all parameters, add contingency, and run the full estimate.", icon: Sparkles }
];

const hotelTierDescriptions = {
  "5star_palace": "Palatial destination experience with premium ceremony-ready settings.",
  "5star_city": "Urban luxury hotel with polished banqueting and stronger operating efficiency.",
  "4star": "Value-conscious upscale hospitality for larger guest loads.",
  resort: "Destination resort format with leisure ambience and broad programming flexibility.",
  farmhouse: "Intimate event-led format with custom vendor orchestration."
};

const decorDescriptions = {
  budget: "Lean floral and fabric dressing with essential moments elevated.",
  mid: "Balanced styling with a few statement zones and thoughtful guest touchpoints.",
  premium: "High-impact stagecraft, floral density, and layered guest experiences.",
  "ultra-premium": "Immersive design language with hero installations and luxury finishes."
};

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

  const stepDetails = stepMeta[step - 1];
  const selectedArtistObjects = useMemo(
    () => artists.filter((artist) => form.selected_artists.includes(artist.id)),
    [artists, form.selected_artists]
  );

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

  const validateStep = () => {
    if (step === 1 && (!form.city || !form.hotel_tier || !form.bride_hometown || !form.groom_hometown)) {
      setError("Add the wedding city, venue tier, and both hometowns before continuing.");
      return false;
    }
    if (step === 2 && (form.total_guests < 20 || form.hotel_rooms < 1)) {
      setError("Guest count must be realistic and at least one hotel room should be blocked.");
      return false;
    }
    if (step === 3 && form.functions.length === 0) {
      setError("Select at least one function so the engine knows what to price.");
      return false;
    }
    setError("");
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) {
      return;
    }
    setStep((value) => Math.min(6, value + 1));
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
        <button className="btn-primary" onClick={nextStep}>
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
    <main className="section-shell">
      <div className="grid gap-6 lg:grid-cols-[0.38fr_0.62fr]">
        <aside className="panel h-fit p-6">
          <p className="text-xs uppercase tracking-[0.38em] text-gold">Estimate Wizard</p>
          <h1 className="mt-3 font-display text-4xl text-maroon">Design the wedding before you price it.</h1>
          <p className="mt-4 leading-7 text-black/68">
            Each step increases budget confidence by making the event profile sharper, from hospitality assumptions to styling and entertainment choices.
          </p>
          <div className="mt-8 space-y-3">
            {stepMeta.map((meta, index) => {
              const Icon = meta.icon;
              const active = index + 1 === step;
              const complete = index + 1 < step;
              return (
                <div
                  key={meta.title}
                  className={`rounded-[24px] border px-4 py-4 ${
                    active ? "border-maroon bg-maroon text-white" : complete ? "border-sage/20 bg-sage/10" : "border-black/8 bg-white/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`rounded-2xl p-2 ${active ? "bg-white/15" : "bg-white"}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] opacity-65">Step {index + 1}</p>
                      <p className="font-semibold">{meta.title}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.38em] text-gold">{stepDetails.subtitle}</p>
              <h2 className="mt-2 font-display text-5xl text-maroon">{stepDetails.title}</h2>
            </div>
            <div className="metric-card min-w-[180px]">
              <p className="text-xs uppercase tracking-[0.28em] text-black/45">Progress</p>
              <p className="mt-2 text-3xl font-semibold text-maroon">{Math.round((step / 6) * 100)}%</p>
            </div>
          </div>

          {error ? <p className="mb-4 rounded-2xl bg-maroon px-4 py-3 text-sm font-semibold text-white">{error}</p> : null}

          <div className="panel p-6 md:p-8">
            {step === 1 && (
              <WizardStep title="Wedding Basics" subtitle="Step 1">
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="field-label">City</span>
                    <select className="field" value={form.city} onChange={(event) => setField("city", event.target.value)}>
                      {cities.map((city) => (
                        <option key={city}>{city}</option>
                      ))}
                    </select>
                  </label>
                  <div className="md:col-span-2">
                    <span className="field-label">Hotel Tier</span>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {hotelTiers.map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          className={`rounded-[24px] border p-4 text-left transition ${
                            form.hotel_tier === tier ? "border-maroon bg-maroon text-white" : "border-black/10 bg-white"
                          }`}
                          onClick={() => setField("hotel_tier", tier)}
                        >
                          <p className="font-display text-2xl capitalize">{tier.replaceAll("_", " ")}</p>
                          <p className={`mt-2 text-sm leading-6 ${form.hotel_tier === tier ? "text-white/80" : "text-black/60"}`}>
                            {hotelTierDescriptions[tier]}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                  <label>
                    <span className="field-label">Number Of Functions</span>
                    <input className="field" type="range" min="2" max="8" value={form.num_functions} onChange={(event) => setField("num_functions", Number(event.target.value))} />
                    <p className="mt-2 text-sm text-black/60">{form.num_functions} functions planned</p>
                  </label>
                  <label>
                    <span className="field-label">Bride Hometown</span>
                    <input className="field" value={form.bride_hometown} onChange={(event) => setField("bride_hometown", event.target.value)} placeholder="Delhi" />
                  </label>
                  <label className="md:col-span-2">
                    <span className="field-label">Groom Hometown</span>
                    <input className="field" value={form.groom_hometown} onChange={(event) => setField("groom_hometown", event.target.value)} placeholder="Mumbai" />
                  </label>
                </div>
                {controls}
              </WizardStep>
            )}

            {step === 2 && (
              <WizardStep title="Guest Profile" subtitle="Step 2">
                <div className="grid gap-4 md:grid-cols-3">
                  <label>
                    <span className="field-label">Total Guests</span>
                    <input className="field" type="number" value={form.total_guests} onChange={(event) => setField("total_guests", Number(event.target.value))} />
                  </label>
                  <label>
                    <span className="field-label">Outstation Guests</span>
                    <input className="field" type="range" min="0" max="100" value={form.outstation_pct} onChange={(event) => setField("outstation_pct", Number(event.target.value))} />
                    <p className="mt-2 text-sm text-black/60">{form.outstation_pct}% of guests</p>
                  </label>
                  <label>
                    <span className="field-label">Hotel Rooms Blocked</span>
                    <input className="field" type="number" value={form.hotel_rooms} onChange={(event) => setField("hotel_rooms", Number(event.target.value))} />
                  </label>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="metric-card">
                    <Users className="text-maroon" size={18} />
                    <p className="mt-3 text-3xl font-semibold text-maroon">{form.total_guests}</p>
                    <p className="mt-1 text-sm text-black/60">guest touchpoints to service across the celebration</p>
                  </div>
                  <div className="metric-card">
                    <MapPin className="text-maroon" size={18} />
                    <p className="mt-3 text-3xl font-semibold text-maroon">{Math.round((form.total_guests * form.outstation_pct) / 100)}</p>
                    <p className="mt-1 text-sm text-black/60">outstation guests likely needing transfers and rooming support</p>
                  </div>
                  <div className="metric-card">
                    <CalendarDays className="text-maroon" size={18} />
                    <p className="mt-3 text-3xl font-semibold text-maroon">{form.hotel_rooms}</p>
                    <p className="mt-1 text-sm text-black/60">rooms blocked for the stay package</p>
                  </div>
                </div>
                {controls}
              </WizardStep>
            )}

            {step === 3 && (
              <WizardStep title="Functions" subtitle="Step 3">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {functionOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`rounded-[24px] border p-5 text-left ${form.functions.includes(item) ? "border-maroon bg-maroon text-white" : "border-black/10 bg-white"}`}
                      onClick={() => toggleFunction(item)}
                    >
                      <p className="font-display text-2xl capitalize">{item}</p>
                      <p className={`mt-2 text-sm ${form.functions.includes(item) ? "text-white/80" : "text-black/60"}`}>
                        Included in decor, hospitality, and logistics calculations.
                      </p>
                    </button>
                  ))}
                </div>
                {controls}
              </WizardStep>
            )}

            {step === 4 && (
              <WizardStep title="Decor & Style" subtitle="Step 4">
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(decorDescriptions).map(([key, description]) => (
                    <button
                      key={key}
                      type="button"
                      className={`rounded-[28px] border p-6 text-left transition ${
                        form.decor_style === key ? "border-gold bg-gradient-to-br from-gold to-maroon text-white" : "border-black/10 bg-white"
                      }`}
                      onClick={() => setField("decor_style", key)}
                    >
                      <p className="font-display text-3xl capitalize">{key.replace("-", " ")}</p>
                      <p className={`mt-3 leading-7 ${form.decor_style === key ? "text-white/85" : "text-black/65"}`}>{description}</p>
                    </button>
                  ))}
                </div>
                {controls}
              </WizardStep>
            )}

            {step === 5 && (
              <WizardStep title="Entertainment & Hospitality" subtitle="Step 5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-[24px] border border-black/10 bg-white p-5">
                    <p className="field-label">Entertainment Preference</p>
                    <div className="space-y-3">
                      {["minimal", "standard", "premium"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left ${
                            form.entertainment_preference === item ? "bg-maroon text-white" : "bg-parchment"
                          }`}
                          onClick={() => setField("entertainment_preference", item)}
                        >
                          <span className="font-semibold capitalize">{item}</span>
                          <Music4 size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-black/10 bg-white p-5">
                    <p className="field-label">Bar Program</p>
                    <div className="space-y-3">
                      {["dry", "beer_wine", "full_bar"].map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left ${
                            form.bar_type === item ? "bg-sage text-white" : "bg-parchment"
                          }`}
                          onClick={() => setField("bar_type", item)}
                        >
                          <span className="font-semibold capitalize">{item.replace("_", " + ")}</span>
                          <Martini size={18} />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  className={`mt-5 flex w-full items-center justify-between rounded-[24px] px-5 py-4 text-left ${
                    form.include_photography ? "bg-maroon text-white" : "bg-white"
                  }`}
                  onClick={() => setField("include_photography", !form.include_photography)}
                >
                  <div>
                    <p className="font-semibold">Photography & cinematography</p>
                    <p className={`mt-1 text-sm ${form.include_photography ? "text-white/80" : "text-black/60"}`}>
                      Toggle full coverage for wedding documentation and films.
                    </p>
                  </div>
                  <Camera size={18} />
                </button>
                <div className="mt-6">
                  <p className="field-label">Optional Artists</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    {artists.map((artist) => (
                      <button
                        key={artist.id}
                        type="button"
                        className={`rounded-[24px] border p-4 text-left ${
                          form.selected_artists.includes(artist.id) ? "border-sage bg-sage text-white" : "border-black/10 bg-white"
                        }`}
                        onClick={() => toggleArtist(artist.id)}
                      >
                        <p className="font-semibold">{artist.name}</p>
                        <p className={`mt-1 text-sm ${form.selected_artists.includes(artist.id) ? "text-white/80" : "text-black/60"}`}>
                          Rs {artist.cost_min.toLocaleString()} - Rs {artist.cost_max.toLocaleString()}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
                {controls}
              </WizardStep>
            )}

            {step === 6 && (
              <WizardStep title="Review & Estimate" subtitle="Step 6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="metric-card">
                    <p className="field-label">Celebration Profile</p>
                    <p className="font-semibold text-maroon">
                      {form.city} · {form.hotel_tier.replaceAll("_", " ")} · {form.num_functions} functions
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/60">{form.functions.join(", ")}</p>
                  </div>
                  <div className="metric-card">
                    <p className="field-label">Hospitality</p>
                    <p className="font-semibold text-maroon">
                      {form.total_guests} guests · {form.hotel_rooms} rooms · {form.outstation_pct}% outstation
                    </p>
                    <p className="mt-2 text-sm leading-6 text-black/60">
                      {form.include_photography ? "Photography included" : "Photography excluded"} · {form.bar_type.replace("_", " + ")} bar
                    </p>
                  </div>
                  <div className="metric-card">
                    <p className="field-label">Design Direction</p>
                    <p className="font-semibold text-maroon capitalize">{form.decor_style.replace("-", " ")} decor with {form.entertainment_preference} entertainment</p>
                    <p className="mt-2 text-sm leading-6 text-black/60">{selectedArtistObjects.length ? `${selectedArtistObjects.length} named artists selected` : "No named artists selected"}</p>
                  </div>
                  <div className="rounded-[28px] border border-maroon/10 bg-maroon p-5 text-white">
                    <p className="field-label !text-white/60">Contingency Reserve</p>
                    <input className="w-full accent-gold" type="range" min="5" max="20" value={form.contingency_pct} onChange={(event) => setField("contingency_pct", Number(event.target.value))} />
                    <p className="mt-3 text-3xl font-semibold">{form.contingency_pct}% contingency</p>
                    <p className="mt-2 text-sm text-white/80">Recommended for changing guest counts, hospitality upgrades, and decor refinements.</p>
                  </div>
                </div>
                {controls}
              </WizardStep>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Wizard;
