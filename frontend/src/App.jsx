import { Link, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Wizard from "./pages/Wizard";
import DecorLibrary from "./pages/DecorLibrary";
import BudgetOutput from "./pages/BudgetOutput";
import AdminPanel from "./pages/AdminPanel";
import RSVPPage from "./pages/RSVPPage";

function App() {
  return (
    <div className="min-h-screen bg-parchment text-ink">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-parchment/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="font-display text-2xl text-maroon">
            WeddingBudget.ai
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/wizard">Wizard</Link>
            <Link to="/decor">Decor</Link>
            <Link to="/admin">Admin</Link>
            <Link to="/rsvp">RSVP</Link>
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
