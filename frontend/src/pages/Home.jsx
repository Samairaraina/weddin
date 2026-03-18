import { ArrowRight, Bot, FileText, GalleryVerticalEnd, Sparkles, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";

const featureCards = [
  {
    title: "Budget intelligence",
    copy: "Trace every rupee across venue, stay, decor, hospitality, logistics, artists, and contingency.",
    icon: Sparkles
  },
  {
    title: "Decor intelligence",
    copy: "Browse inspiration by function, style, and complexity, then demo image-based cost prediction live.",
    icon: GalleryVerticalEnd
  },
  {
    title: "Planner narrative",
    copy: "Generate a crisp AI explanation of where the money is going and what tradeoffs matter most.",
    icon: Bot
  },
  {
    title: "Client-ready export",
    copy: "Open the estimate dashboard, compare scenarios, and export a polished PDF in one click.",
    icon: FileText
  }
];

const metrics = [
  { value: "7", label: "Core modules mapped to the brief" },
  { value: "6", label: "Indian wedding functions handled" },
  { value: "95%", label: "Upper confidence ceiling in the engine" }
];

function Home() {
  return (
    <main>
      <section className="section-shell relative overflow-hidden">
        <div className="hero-orb left-[8%] top-[14%] h-32 w-32 bg-gold/40" />
        <div className="hero-orb right-[10%] top-[18%] h-36 w-36 bg-maroon/20" />
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="panel luxury-grid relative overflow-hidden p-8 md:p-12">
            <p className="text-xs uppercase tracking-[0.4em] text-gold">FrostHack 2025 · IIT Mandi · AI/ML Track</p>
            <h1 className="mt-5 max-w-4xl font-display text-5xl leading-[1.05] text-maroon md:text-7xl">
              Scientific wedding budgeting for Indian luxury celebrations.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-black/70">
              WeddingBudget.ai turns planning intuition into an explainable estimate engine with decor discovery,
              scenario comparison, AI rationale, and a client-ready PDF output.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/wizard" className="btn-primary">
                Start Estimate
                <ArrowRight size={18} />
              </Link>
              <Link to="/decor" className="btn-secondary">
                Explore Decor
                <Wand2 size={18} />
              </Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="metric-card">
                  <p className="stat-value">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-black/60">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            {featureCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className="panel p-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-maroon/8 p-3 text-maroon">
                      <Icon size={20} />
                    </div>
                    <h2 className="font-display text-2xl text-maroon">{card.title}</h2>
                  </div>
                  <p className="mt-4 leading-7 text-black/68">{card.copy}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-shell pt-0">
        <div className="glass-band grid gap-6 p-6 md:grid-cols-[0.95fr_1.05fr] md:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.38em] text-gold">Demo flow</p>
            <h2 className="mt-3 font-display text-4xl text-maroon">Built for a fast, unforgettable live walkthrough.</h2>
            <p className="mt-4 max-w-xl leading-7 text-black/68">
              Open the wizard, parameterise a Udaipur wedding, compare venue tiers, generate the planner narrative,
              browse decor, and finish with the PDF export. The product is structured to create a clean wow moment.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              "Landing and wizard entry",
              "Six-step estimate capture",
              "Traceable output dashboard",
              "Scenario compare and AI narrative",
              "Decor discovery and ML prediction",
              "RSVP bonus workflow"
            ].map((item, index) => (
              <div key={item} className="metric-card">
                <p className="text-xs uppercase tracking-[0.32em] text-gold">0{index + 1}</p>
                <p className="mt-3 font-semibold text-maroon">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Home;
