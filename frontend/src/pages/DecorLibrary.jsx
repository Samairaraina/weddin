import { useEffect, useState } from "react";

import { getDecorLibrary, predictDecorCost } from "../api";
import DecorCard from "../components/DecorCard";

function DecorLibrary() {
  const [filters, setFilters] = useState({ function_type: "", style: "", complexity: "", page: 1, page_size: 12 });
  const [images, setImages] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [prediction, setPrediction] = useState("");
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      getDecorLibrary(filters)
        .then((response) => {
          setImages(response.data.images);
          setTotal(response.data.total);
        })
        .catch(() => {
          setImages([]);
          setTotal(0);
        });
    }, 300);
    return () => clearTimeout(timeout);
  }, [filters]);

  const toggleShortlist = (image) => {
    setShortlisted((current) => (current.find((item) => item.id === image.id) ? current.filter((item) => item.id !== image.id) : [...current, image]));
  };

  const handlePredict = async (id) => {
    const response = await predictDecorCost(id);
    setPrediction(`Predicted range: Rs ${response.data.predicted_min.toLocaleString()} - Rs ${response.data.predicted_max.toLocaleString()} (${response.data.confidence})`);
  };

  return (
    <main className="section-shell">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="panel h-fit p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Filters</p>
          <div className="mt-4 space-y-4">
            <label>
              <span className="field-label">Function Type</span>
              <select className="field" value={filters.function_type} onChange={(event) => setFilters((current) => ({ ...current, function_type: event.target.value, page: 1 }))}>
                <option value="">All functions</option>
                {["mehendi", "haldi", "sangeet", "baraat", "pheras", "reception"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Style</span>
              <select className="field" value={filters.style} onChange={(event) => setFilters((current) => ({ ...current, style: event.target.value, page: 1 }))}>
                <option value="">All styles</option>
                {["royal", "rustic", "modern", "traditional", "floral", "minimal"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="field-label">Complexity</span>
              <select className="field" value={filters.complexity} onChange={(event) => setFilters((current) => ({ ...current, complexity: event.target.value, page: 1 }))}>
                <option value="">All tiers</option>
                {["budget", "mid", "premium", "ultra-premium"].map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-8 rounded-3xl bg-maroon p-5 text-white">
            <p className="font-semibold">Shortlisted decor</p>
            <p className="mt-2 text-sm">{shortlisted.length} images selected</p>
            <p className="mt-4 text-sm leading-6 text-white/80">{prediction || "Pick a decor card and run cost prediction to demo the ML layer."}</p>
          </div>
        </aside>
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Decor Intelligence</p>
              <h1 className="mt-2 font-display text-4xl text-maroon">Curated library for Indian wedding functions</h1>
            </div>
            <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-semibold text-maroon">{total} images</div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <DecorCard key={image.id} image={image} selected={Boolean(shortlisted.find((item) => item.id === image.id))} onToggle={toggleShortlist} onPredict={handlePredict} />
            ))}
          </div>
          {!images.length ? (
            <div className="panel mt-6 p-8 text-center">
              <p className="font-display text-3xl text-maroon">No decor matched these filters.</p>
              <p className="mt-3 text-black/60">Try broadening the style or complexity filter, or seed more images through the admin view.</p>
            </div>
          ) : null}
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn-ghost" disabled={filters.page === 1} onClick={() => setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}>
              Previous
            </button>
            <button className="btn-secondary" disabled={filters.page * filters.page_size >= total} onClick={() => setFilters((current) => ({ ...current, page: current.page + 1 }))}>
              Next Page
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

export default DecorLibrary;
