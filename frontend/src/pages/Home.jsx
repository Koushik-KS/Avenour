
import { useState } from 'react'
import {
  Flame, Beef, Wheat, Droplets, Moon, Plus
} from 'lucide-react'
import './Home.css'

function Home() {
  const [water, setWater] = useState(1500)
  const waterGoal = 2500

  const addWater = () => {
    setWater((prev) => Math.min(prev + 250, 5000))
  }

  const waterPercent = Math.min((water / waterGoal) * 100, 100)

  return (
    <main className="home-page">
      <header className="home-welcome">
        <div>
          <p className="home-eyebrow">SUNDAY, YOUR DAILY OVERVIEW</p>
          <h1>Good morning, <span>Koushik</span> 👋</h1>
          <p className="home-subtitle">Stay consistent. You're doing great.</p>
        </div>
      </header>

      {/* Calories & Macros */}
      <section className="nutrition-card">
        <div className="calorie-overview">
          <div className="calorie-ring">
            <div className="calorie-ring-inner">
              <Flame size={26} className="flame-icon" />
              <strong>1,420</strong>
              <span>kcal consumed</span>
            </div>
          </div>

          <div className="calorie-details">
            <p className="card-label">DAILY GOAL</p>
            <h2>2,200 <small>kcal</small></h2>
            <p className="remaining-calories">780 kcal remaining</p>
          </div>
        </div>

        <div className="macro-grid">
          <div className="macro-item protein">
            <Beef size={23} />
            <div>
              <span className="macro-name">Protein</span>
              <strong>72 <small>/ 130 g</small></strong>
              <span className="macro-percent">55%</span>
            </div>
            <div className="macro-track">
              <div style={{ width: '55%' }} />
            </div>
          </div>

          <div className="macro-item carbs">
            <Wheat size={23} />
            <div>
              <span className="macro-name">Carbs</span>
              <strong>155 <small>/ 250 g</small></strong>
              <span className="macro-percent">62%</span>
            </div>
            <div className="macro-track">
              <div style={{ width: '62%' }} />
            </div>
          </div>

          <div className="macro-item fat">
            <Droplets size={23} />
            <div>
              <span className="macro-name">Fat</span>
              <strong>42 <small>/ 70 g</small></strong>
              <span className="macro-percent">60%</span>
            </div>
            <div className="macro-track">
              <div style={{ width: '60%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Water & Sleep */}
      <section className="daily-habits-grid">
        <div className="habit-card water-card">
          <div className="habit-heading">
            <Droplets size={24} />
            <span>Water Intake</span>
          </div>

          <div className="habit-value">
            {(water / 1000).toFixed(2).replace(/\.?0+$/, '')}
            <small> / {(waterGoal / 1000).toFixed(1)} L</small>
          </div>

          <div className="habit-progress">
            <div style={{ width: `${waterPercent}%` }} />
          </div>

          <div className="water-card-bottom">
            <span className="water-percent">{Math.round(waterPercent)}% of daily goal</span>
            <button
              className="water-add-btn"
              onClick={addWater}
              disabled={water >= 5000}
              aria-label="Add 250 milliliters of water"
              title="Add 250 ml"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        <div className="habit-card sleep-card">
          <div className="habit-heading sleep-heading">
            <Moon size={25} />
            <span>Sleep (Last Night)</span>
          </div>

          <div className="sleep-value">7h 30m</div>
          <div className="sleep-caption">Sleep duration</div>
        </div>
      </section>
    </main>
  )
}

export default Home
