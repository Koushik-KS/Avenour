
import { Leaf, Sparkles } from 'lucide-react'

function App() {
  return (
    <main className="foundation-page">
      <div className="brand-mark">
        <Leaf size={22} />
      </div>

      <span className="foundation-label">
        <Sparkles size={14} />
        YOUR HEALTH, REIMAGINED
      </span>

      <h1>
        Welcome to <span>Avenour.</span>
      </h1>

      <p className="foundation-description">
        Intelligence for a healthier you.
      </p>

      <div className="foundation-card">
        <div className="foundation-status">
          <span className="status-dot" />
          FOUNDATION INITIALIZED
        </div>

        <h2>Your wellness journey starts here.</h2>

        <p>
          Avenour is being built to bring nutrition, daily habits,
          and intelligent health insights together in one place.
        </p>

        <div className="foundation-divider" />

        <div className="foundation-footer">
          <span>AVENOUR</span>
          <span>01 — BUILDING YOUR FOUNDATION</span>
        </div>
      </div>

      <span className="foundation-bottom">
        DESIGNED FOR A HEALTHIER EVERYDAY
      </span>
    </main>
  )
}

export default App
