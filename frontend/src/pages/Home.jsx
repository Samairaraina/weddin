import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16">
      <section className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr]">
        <div className="panel overflow-hidden p-8 md:p-12">
          <p className="text-sm uppercase tracking-[0.35em] text-gold">FrostHack 2025 • AI/ML Track</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-tight text-maroon md:text-7xl">
            Scientific wedding budgeting for luxury Indian celebrations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">
            Build an itemised INR estimate, explore decor inspiration, compare scenarios, generate an AI planner narrative, and export a client-ready PDF in minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/wizard" className="btn-primary">
              Start Estimate
            </Link>
            <Link to="/decor" className="btn-secondary">
              Explore Decor Library
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          {[
            "7 fully wired backend modules",
            "CLIP-based decor intelligence pipeline",
            "Gemini narrative with local fallback",
            "Scenario compare + PDF export"
          ].map((item) => (
            <div key={item} className="panel p-6">
              <p className="font-display text-2xl text-maroon">{item}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

export default Home;
