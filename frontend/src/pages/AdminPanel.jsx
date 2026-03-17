import { useEffect, useState } from "react";

import { getAdminArtists, getAdminDecor, getAdminFBRates, getAdminLogistics, scrapeDecor, trainDecorModel, updateArtist } from "../api";

function AdminPanel() {
  const [artists, setArtists] = useState([]);
  const [rates, setRates] = useState([]);
  const [rules, setRules] = useState([]);
  const [decor, setDecor] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    Promise.all([getAdminArtists(), getAdminFBRates(), getAdminLogistics(), getAdminDecor()])
      .then(([artistsResponse, ratesResponse, rulesResponse, decorResponse]) => {
        setArtists(artistsResponse.data.artists);
        setRates(ratesResponse.data.rates);
        setRules(rulesResponse.data.rules);
        setDecor(decorResponse.data.images);
      })
      .catch(() => setStatus("Could not load admin datasets."));
  }, []);

  const handleArtistBump = async (artist) => {
    await updateArtist(artist.id, { cost_min: artist.cost_min * 1.05, cost_max: artist.cost_max * 1.05, notes: artist.notes });
    setStatus(`Updated ${artist.name}`);
  };

  const handleScrape = async (functionType) => {
    const response = await scrapeDecor(functionType);
    setStatus(`Scrape complete for ${response.data.function_type}: ${response.data.added} added`);
  };

  const handleTrain = async () => {
    const response = await trainDecorModel();
    setStatus(JSON.stringify(response.data));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Admin Control Room</p>
          <h1 className="mt-2 font-display text-4xl text-maroon">Edit costs, trigger decor ingestion, train the model</h1>
        </div>
        <button className="btn-primary" onClick={handleTrain}>
          Train Decor Model
        </button>
      </div>
      {status ? <p className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-maroon">{status}</p> : null}

      <section className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="panel p-6">
          <h2 className="font-display text-3xl text-maroon">Artist Costs</h2>
          <div className="mt-4 space-y-3">
            {artists.slice(0, 8).map((artist) => (
              <div key={artist.id} className="flex items-center justify-between rounded-3xl bg-white p-4">
                <div>
                  <p className="font-semibold">{artist.name}</p>
                  <p className="text-sm text-black/60">Rs {artist.cost_min.toLocaleString()} - Rs {artist.cost_max.toLocaleString()}</p>
                </div>
                <button className="btn-secondary" onClick={() => handleArtistBump(artist)}>
                  +5%
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <h2 className="font-display text-3xl text-maroon">Decor Scrape</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {["mehendi", "haldi", "sangeet", "baraat", "pheras", "reception"].map((functionType) => (
              <button key={functionType} className="btn-secondary capitalize" onClick={() => handleScrape(functionType)}>
                {functionType}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-3 text-sm text-black/70">
            <p>F&B rows loaded: {rates.length}</p>
            <p>Logistics rules loaded: {rules.length}</p>
            <p>Decor images loaded: {decor.length}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminPanel;
