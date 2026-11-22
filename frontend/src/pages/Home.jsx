
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame, Beef, Wheat, Droplets, Moon, Plus, Minus,
  Lightbulb, Camera, CalendarDays, Dumbbell,
  TrendingUp, ArrowRight, Clock
} from 'lucide-react'
import './Home.css'

const meals = [
  { name: 'Breakfast', kcal: 450, emoji: '🥣', food: 'Oats & fruits' },
  { name: 'Lunch', kcal: 620, emoji: '🍛', food: 'Rice & curry' },
  { name: 'Dinner', kcal: 350, emoji: '🥗', food: 'Salad & protein' },
]

function calculateSleepDuration(sleepTime, wakeTime) {
  if (!sleepTime || !wakeTime) return null

  const [sleepHours, sleepMinutes] = sleepTime.split(':').map(Number)
  const [wakeHours, wakeMinutes] = wakeTime.split(':').map(Number)

  let start = sleepHours * 60 + sleepMinutes
  let end = wakeHours * 60 + wakeMinutes

  // Handles sleep crossing midnight
  if (end <= start) end += 24 * 60

  const duration = end - start
  const hours = Math.floor(duration / 60)
  const minutes = duration % 60

  return `${hours}h ${minutes}m`
}

function Home() {
  const navigate = useNavigate()

  // Water tracker
  const [water, setWater] = useState(1500)
  const waterGoal = 2500
  const waterPercent = Math.min((water / waterGoal) * 100, 100)

  // Sleep tracker
  const [sleepTime, setSleepTime] = useState('')
  const [wakeTime, setWakeTime] = useState('')
  const sleepDuration = calculateSleepDuration(sleepTime, wakeTime)

  return (
    <main className="home-page">
      {/* Greeting */}
      <header className="home-welcome">
        <div>
          <p className="home-eyebrow">YOUR DAILY OVERVIEW</p>
          <h1>
            Good morning, <span>Koushik</span> 👋
          </h1>
          <p className="home-subtitle">
            Stay consistent. You're doing great.
          </p>
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

        {/* Water Tracker */}
        <div className="habit-card water-card">
          <div className="habit-heading">
            <Droplets size={24} />
            <span>Water Intake</span>
          </div>

          <div className="habit-value">
            {(water / 1000).toFixed(2).replace(/\.?0+$/, '')}
            <small> / 2.5 L</small>
          </div>

          <div className="habit-progress">
            <div style={{ width: `${waterPercent}%` }} />
          </div>

          <div className="water-card-bottom">
            <span className="water-percent">
              {Math.round(waterPercent)}% of daily goal
            </span>

            <div className="water-controls">
              <button
                className="water-control-btn water-minus-btn"
                onClick={() => setWater((prev) => Math.max(prev - 250, 0))}
                disabled={water === 0}
                aria-label="Remove 250 milliliters of water"
                title="Remove 250 ml"
              >
                <Minus size={18} />
              </button>

              <button
                className="water-control-btn water-add-btn"
                onClick={() => setWater((prev) => Math.min(prev + 250, 5000))}
                disabled={water >= 5000}
                aria-label="Add 250 milliliters of water"
                title="Add 250 ml"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Sleep Tracker */}
        <div className="habit-card sleep-card">
          <div className="habit-heading sleep-heading">
            <Moon size={25} />
            <span>Sleep (Last Night)</span>
          </div>

          {sleepDuration ? (
            <div className="sleep-result">
              <div className="sleep-value">{sleepDuration}</div>
              <div className="sleep-caption">Total sleep duration</div>
            </div>
          ) : (
            <div className="sleep-empty">
              <Clock size={20} />
              <span>Track last night's sleep</span>
            </div>
          )}

          <div className="sleep-inputs">
            <label>
              <span>Bedtime</span>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
              />
            </label>

            <label>
              <span>Wake up</span>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      {/* AI Insight */}
      <section className="ai-insight-card">
        <div className="insight-icon">
          <Lightbulb size={27} />
        </div>

        <div className="insight-content">
          <span className="insight-label">AI INSIGHT</span>
          <h3>Your protein intake is slightly low today.</h3>
          <p>
            Consider adding a protein-rich snack to help meet your daily target.
          </p>
        </div>

        <button
          className="insight-action"
          onClick={() => navigate('/coach')}
          aria-label="Open AI Coach"
        >
          <ArrowRight size={21} />
        </button>
      </section>

      {/* Today's Meals */}
      <section className="home-section">
        <div className="section-heading">
          <h2>Today's Meals</h2>
          <button className="section-link" onClick={() => navigate('/diary')}>
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div className="meals-grid">
          {meals.map((meal) => (
            <button
              className="meal-card"
              key={meal.name}
              onClick={() => navigate('/diary')}
            >
              <div className={`meal-visual meal-${meal.name.toLowerCase()}`}>
                <span>{meal.emoji}</span>
              </div>

              <span className="meal-name">{meal.name}</span>
              <span className="meal-calories">{meal.kcal} kcal</span>
              <span className="meal-food">{meal.food}</span>
            </button>
          ))}

          <button
            className="add-meal-card"
            onClick={() => navigate('/diary')}
          >
            <Plus size={28} />
            <span>Add Meal</span>
          </button>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="home-section quick-actions-section">
        <div className="section-heading">
          <h2>Quick Actions</h2>
        </div>

        <div className="quick-actions-grid">
          <button className="quick-action" onClick={() => navigate('/scanner')}>
            <Camera size={23} />
            <span>Scan Food</span>
          </button>

          <button className="quick-action" onClick={() => navigate('/diary')}>
            <CalendarDays size={23} />
            <span>Plan Diet</span>
          </button>

          <button className="quick-action" onClick={() => navigate('/profile')}>
            <Dumbbell size={23} />
            <span>Track Workout</span>
          </button>

          <button className="quick-action" onClick={() => navigate('/profile')}>
            <TrendingUp size={23} />
            <span>View Progress</span>
          </button>
        </div>
      </section>
    </main>
  )
}

export default Home
