import { ArrowRight, CalendarHeart, LayoutDashboard, LibraryBig, Settings } from "lucide-react";
import { Link, Route, Routes, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Wizard from "./pages/Wizard";
import DecorLibrary from "./pages/DecorLibrary";
import BudgetOutput from "./pages/BudgetOutput";
import AdminPanel from "./pages/AdminPanel";
import RSVPPage from "./pages/RSVPPage";

const navItems = [
  { to: "/wizard", label: "Estimate", icon: ArrowRight },
  { to: "/decor", label: "Decor", icon: LibraryBig },
  { to: "/admin", label: "Admin", icon: Settings },
  { to: "/rsvp", label: "RSVP", icon: CalendarHeart }
];

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-parchment text-ink">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-parchment/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-2xl bg-maroon px-3 py-2 text-white">
              <LayoutDashboard size={18} />
            </div>
            <div>
              <p className="font-display text-2xl leading-none text-maroon">WeddingBudget.ai</p>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-black/45">Events by Athea Prototype</p>
            </div>
          </Link>
          <nav className="hidden gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                    active ? "bg-maroon text-white" : "bg-white/75 text-maroon hover:bg-white"
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wizard" element={<Wizard />} />
        <Route path="/decor" element={<DecorLibrary />} />
        <Route path="/budget/:sessionId" element={<BudgetOutput />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/rsvp" element={<RSVPPage />} />
      </Routes>
    </div>
  );
}

export default App;
