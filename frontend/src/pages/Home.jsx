
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Flame, Beef, Wheat, Droplets, Moon, Plus, Minus,
  Lightbulb, Camera, CalendarDays, Dumbbell,
  TrendingUp, ArrowRight, Clock, Footprints,
  Play, Pause, RotateCcw
} from 'lucide-react'
import './Home.css'

const meals = [
  { name: 'Breakfast', kcal: 450, image: '/breakfast.jpg', food: 'Oats & fruits' },
  { name: 'Lunch', kcal: 620, image: '/lunch.jpg', food: 'Rice & curry' },
  { name: 'Evening Snack', kcal: 200, image: '/snacks.jpg', food: 'Healthy snacks' },
  { name: 'Dinner', kcal: 350, image: '/dinner.jpg', food: 'Salad & protein' },
]

const STEP_GOAL = 10000
const STEP_LENGTH_METERS = 0.7

function getTodayKey() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function loadSavedSteps() {
  try {
    const saved = JSON.parse(localStorage.getItem('avenour_steps') || '{}')
    if (saved.date === getTodayKey()) return saved.steps || 0
  } catch {
    // Ignore invalid saved data
  }
  return 0
}

function calculateSleepDuration(sleepTime, wakeTime) {
  if (!sleepTime || !wakeTime) return null

  const [sleepHours, sleepMinutes] = sleepTime.split(':').map(Number)
  const [wakeHours, wakeMinutes] = wakeTime.split(':').map(Number)

  let start = sleepHours * 60 + sleepMinutes
  let end = wakeHours * 60 + wakeMinutes

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

  // Step tracker
  const [steps, setSteps] = useState(loadSavedSteps)
  const [tracking, setTracking] = useState(false)
  const [sensorStatus, setSensorStatus] = useState('Ready to track')
  const [manualSteps, setManualSteps] = useState('')
  const lastMotionRef = useRef(null)
  const lastStepTimeRef = useRef(0)
  const stepGoal = STEP_GOAL

  const stepPercent = Math.min((steps / stepGoal) * 100, 100)
  const distanceKm = (steps * STEP_LENGTH_METERS / 1000).toFixed(2)
  const activityCalories = Math.round(steps * 0.04)

  // Save today's steps
  useEffect(() => {
    localStorage.setItem('avenour_steps', JSON.stringify({
      date: getTodayKey(),
      steps
    }))
  }, [steps])

  // Reset steps when the day changes
  useEffect(() => {
    const checkDate = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('avenour_steps') || '{}')
        if (saved.date !== getTodayKey()) {
          setSteps(0)
          setTracking(false)
          setSensorStatus('New day — ready to track')
          lastMotionRef.current = null
        }
      } catch {
        setSteps(0)
      }
    }

    const interval = setInterval(checkDate, 60000)
    return () => clearInterval(interval)
  }, [])

  // Motion sensor step detection
  useEffect(() => {
    if (!tracking) return

    const handleMotion = (event) => {
      const acceleration = event.accelerationIncludingGravity || event.acceleration
      if (!acceleration) return

      const x = acceleration.x ?? 0
      const y = acceleration.y ?? 0
      const z = acceleration.z ?? 0

      const current = { x, y, z }

      if (lastMotionRef.current) {
        const previous = lastMotionRef.current

        const changeX = current.x - previous.x
        const changeY = current.y - previous.y
        const changeZ = current.z - previous.z

        const magnitude = Math.sqrt(
          changeX * changeX + changeY * changeY + changeZ * changeZ
        )

        const now = Date.now()

        // Movement threshold + debounce to reduce false step counts
        if (magnitude > 2.2 && now - lastStepTimeRef.current > 350) {
          setSteps((prev) => prev + 1)
          lastStepTimeRef.current = now
        }
      }

      lastMotionRef.current = current
    }

    window.addEventListener('devicemotion', handleMotion)

    return () => {
      window.removeEventListener('devicemotion', handleMotion)
    }
  }, [tracking])

  // Start sensor tracking
  const startTracking = async () => {
    if (!('DeviceMotionEvent' in window)) {
      setSensorStatus('Motion sensor unavailable. Use manual entry.')
      return
    }

    try {
      // iOS permission request, when required
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        const permission = await DeviceMotionEvent.requestPermission()

        if (permission !== 'granted') {
          setSensorStatus('Motion permission denied. Use manual entry.')
          return
        }
      }

      lastMotionRef.current = null
      lastStepTimeRef.current = 0
      setTracking(true)
      setSensorStatus('Move with your phone to count steps')
    } catch {
      setSensorStatus('Sensor permission unavailable. Use manual entry.')
    }
  }

  const pauseTracking = () => {
    setTracking(false)
    lastMotionRef.current = null
    setSensorStatus('Tracking paused')
  }

  const resetSteps = () => {
    setTracking(false)
    setSteps(0)
    lastMotionRef.current = null
    lastStepTimeRef.current = 0
    setSensorStatus('Steps reset')
  }

  const addManualSteps = () => {
    const amount = Number(manualSteps)
    if (!Number.isFinite(amount) || amount <= 0) return

    setSteps((prev) => prev + Math.floor(amount))
    setManualSteps('')
    setSensorStatus(`${Math.floor(amount).toLocaleString()} steps added manually`)
  }

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

      {/* Water, Sleep & Steps */}
      <section className="daily-habits-grid">

        {/* Water Tracker */}
        <div className="habit-card water-card">
          <div className="habit-heading">
            <Droplets size={24} />
            <span>Water Intake</span>
          </div>

          <div className="habit-value">
            {(water / 1000).toFixed(2)}
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

        {/* Step Tracker */}
        <div className="habit-card step-card">
          <div className="step-card-heading">
            <div className="habit-heading step-heading">
              <Footprints size={24} />
              <span>Steps Today</span>
            </div>

            <button
              className="step-reset-btn"
              onClick={resetSteps}
              title="Reset steps"
              aria-label="Reset steps"
            >
              <RotateCcw size={16} />
            </button>
          </div>

          <div className="step-count-row">
            <strong>{steps.toLocaleString()}</strong>
            <span>/ {stepGoal.toLocaleString()}</span>
          </div>

          <div className="step-progress-track">
            <div
              className="step-progress-fill"
              style={{ width: `${stepPercent}%` }}
            />
          </div>

          <div className="step-progress-label">
            <span>{Math.round(stepPercent)}% of daily goal</span>
            <span>{Math.max(stepGoal - steps, 0).toLocaleString()} left</span>
          </div>

          <div className="step-stats">
            <div>
              <span>Distance</span>
              <strong>{distanceKm} km</strong>
            </div>
            <div>
              <span>Activity calories</span>
              <strong>~{activityCalories} kcal</strong>
            </div>
          </div>

          <div className="step-tracking-status">
            <span className={`step-status-dot ${tracking ? 'active' : ''}`} />
            {sensorStatus}
          </div>

          <button
            className={`step-start-btn ${tracking ? 'is-tracking' : ''}`}
            onClick={tracking ? pauseTracking : startTracking}
          >
            {tracking ? <Pause size={17} /> : <Play size={17} />}
            {tracking ? 'Pause Tracking' : 'Start Walking'}
          </button>

          <div className="step-manual-entry">
            <input
              type="number"
              min="1"
              step="1"
              placeholder="Enter steps manually"
              value={manualSteps}
              onChange={(e) => setManualSteps(e.target.value)}
            />
            <button
              onClick={addManualSteps}
              disabled={!manualSteps || Number(manualSteps) <= 0}
              title="Add manual steps"
            >
              <Plus size={18} />
            </button>
          </div>

          <p className="step-disclaimer">
            Sensor tracking works while this page is active. Background counting
            may stop when your phone locks.
          </p>
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
              <div className={`meal-visual meal-${meal.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <img src={meal.image} alt={meal.name} />
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
