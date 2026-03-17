import { useEffect, useState } from "react";

import { getDecorLibrary, predictDecorCost } from "../api";
import DecorCard from "../components/DecorCard";

function DecorLibrary() {
  const [filters, setFilters] = useState({ function_type: "", style: "", complexity: "", page: 1, page_size: 12 });
  const [images, setImages] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [prediction, setPrediction] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      getDecorLibrary(filters).then((response) => setImages(response.data.images)).catch(() => setImages([]));
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
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="panel h-fit p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Filters</p>
          <div className="mt-4 space-y-4">
            <input className="field" placeholder="Function type" value={filters.function_type} onChange={(event) => setFilters((current) => ({ ...current, function_type: event.target.value }))} />
            <input className="field" placeholder="Style" value={filters.style} onChange={(event) => setFilters((current) => ({ ...current, style: event.target.value }))} />
            <input className="field" placeholder="Complexity" value={filters.complexity} onChange={(event) => setFilters((current) => ({ ...current, complexity: event.target.value }))} />
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
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <DecorCard key={image.id} image={image} selected={Boolean(shortlisted.find((item) => item.id === image.id))} onToggle={toggleShortlist} onPredict={handlePredict} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default DecorLibrary;
