import { useEffect, useMemo, useState } from "react";
import "./Diary.css";

const FOOD_DATABASE = [
  { id: 1, name: "Boiled Egg", serving: "1 large (50g)", calories: 78, protein: 6.3, carbs: 0.6, fat: 5.3 },
  { id: 2, name: "Banana", serving: "1 medium (118g)", calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
  { id: 3, name: "Rice", serving: "1 bowl (150g cooked)", calories: 195, protein: 4, carbs: 43, fat: 0.4 },
  { id: 4, name: "Chicken Breast", serving: "100g cooked", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 5, name: "Apple", serving: "1 medium (182g)", calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
  { id: 6, name: "Oats", serving: "40g", calories: 150, protein: 5, carbs: 27, fat: 3 },
  { id: 7, name: "Milk", serving: "250ml", calories: 150, protein: 8, carbs: 12, fat: 8 },
  { id: 8, name: "Almonds", serving: "15g", calories: 87, protein: 3.2, carbs: 3.2, fat: 7.5 },
  { id: 9, name: "Curd", serving: "100g", calories: 98, protein: 3.5, carbs: 4.7, fat: 5 },
  { id: 10, name: "Chapati", serving: "1 medium", calories: 120, protein: 3.5, carbs: 20, fat: 3 },
  { id: 11, name: "Paneer", serving: "100g", calories: 265, protein: 18, carbs: 1.2, fat: 21 },
  { id: 12, name: "Idli", serving: "2 pieces", calories: 130, protein: 4, carbs: 26, fat: 1 },
  { id: 13, name: "Dosa", serving: "1 medium", calories: 168, protein: 4, carbs: 27, fat: 5 },
  { id: 14, name: "Peanuts", serving: "30g", calories: 170, protein: 7.5, carbs: 5, fat: 14 },
  { id: 15, name: "Dal", serving: "1 bowl (150g)", calories: 180, protein: 10, carbs: 27, fat: 4 },
];

const MEALS = [
  { id: "breakfast", name: "Breakfast", time: "7:00 – 10:00 AM", icon: "☀" },
  { id: "lunch", name: "Lunch", time: "12:00 – 2:30 PM", icon: "◉" },
  { id: "snack", name: "Evening Snack", time: "4:00 – 6:00 PM", icon: "☕" },
  { id: "dinner", name: "Dinner", time: "7:00 – 9:30 PM", icon: "☾" },
];

const EMPTY_MEALS = () => ({
  breakfast: [],
  lunch: [],
  snack: [],
  dinner: [],
});

const getDateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatMonth = (date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric" });

const formatDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

function MacroBar({ label, value, target, color }) {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div className="diary-macro">
      <div className="diary-macro-top">
        <span className="diary-macro-label">
          <i style={{ background: color }} />
          {label}
        </span>
        <span className="diary-macro-value">
          {Math.round(value)} <span>/ {target}g</span>
        </span>
      </div>

      <div className="diary-macro-track">
        <div
          className="diary-macro-fill"
          style={{ width: `${percentage}%`, background: color }}
        />
      </div>
    </div>
  );
}

function ExtraNutrient({ label, value, unit, incomplete }) {
  return (
    <div className="diary-extra-nutrient">
      <span className="diary-extra-label">{label}</span>
      <strong>
        {value === null ? "—" : `${Number(value).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`}
      </strong>
      {incomplete && value !== null && (
        <small>Partial data</small>
      )}
    </div>
  );
}

export default function Diary() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealData, setMealData] = useState(() => {
    try { return JSON.parse(localStorage.getItem("avenour_diary_meals") || "{}"); }
    catch { return {}; }
  });
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [showCalendar, setShowCalendar] = useState(true);

  // Persist date-wise food logs so diary history survives refreshes and deployments.
  useEffect(() => {
    localStorage.setItem("avenour_diary_meals", JSON.stringify(mealData));
  }, [mealData]);
  const [activeMeal, setActiveMeal] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [customFood, setCustomFood] = useState(false);

  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");

  // Optional nutrients
  const [customFiber, setCustomFiber] = useState("");
  const [customSugar, setCustomSugar] = useState("");
  const [customCholesterol, setCustomCholesterol] = useState("");
  const [customVitamins, setCustomVitamins] = useState("");

  // Editable calorie target
  const [calorieTarget, setCalorieTarget] = useState(() => {
    const saved = Number(localStorage.getItem("avenour_calorie_target"));
    return Number.isFinite(saved) && saved > 0 ? saved : 2200;
  });
  useEffect(() => {
    localStorage.setItem("avenour_calorie_target", String(calorieTarget));
  }, [calorieTarget]);
  const [editingTarget, setEditingTarget] = useState(false);
  const [targetInput, setTargetInput] = useState("2200");

  // Local date key (avoids UTC timezone date shifting)
  const dateKey = `${selectedDate.getFullYear()}-${String(
    selectedDate.getMonth() + 1
  ).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const isToday = dateKey === todayKey;
  const currentMeals = mealData[dateKey] || EMPTY_MEALS();

  const allFoods = Object.values(currentMeals).flat();

  const totals = useMemo(() => {
    const sumNutrient = (field) => {
      const foodsWithData = allFoods.filter(
        (food) => food[field] !== null && food[field] !== undefined && food[field] !== ""
      );

      const value = foodsWithData.reduce(
        (sum, food) => sum + Number(food[field]) * food.quantity,
        0
      );

      return {
        value: foodsWithData.length > 0 ? value : null,
        incomplete: foodsWithData.length !== allFoods.length,
      };
    };

    return {
      calories: allFoods.reduce(
        (sum, food) => sum + (Number(food.calories) || 0) * food.quantity,
        0
      ),
      protein: allFoods.reduce(
        (sum, food) => sum + (Number(food.protein) || 0) * food.quantity,
        0
      ),
      carbs: allFoods.reduce(
        (sum, food) => sum + (Number(food.carbs) || 0) * food.quantity,
        0
      ),
      fat: allFoods.reduce(
        (sum, food) => sum + (Number(food.fat) || 0) * food.quantity,
        0
      ),
      fiber: sumNutrient("fiber"),
      sugar: sumNutrient("sugar"),
      cholesterol: sumNutrient("cholesterol"),
      vitamins: [
        ...new Set(
          allFoods
            .flatMap((food) => {
              if (!food.vitamins) return [];
              return String(food.vitamins)
                .split(",")
                .map((v) => v.trim())
                .filter(Boolean);
            })
        ),
      ],
    };
  }, [currentMeals]);

  const calorieRemaining = calorieTarget - totals.calories;
  const caloriePercentage =
    calorieTarget > 0
      ? Math.min((totals.calories / calorieTarget) * 100, 100)
      : 0;

  const filteredFoods = FOOD_DATABASE.filter((food) =>
    food.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const changeDate = (offset) => {
    setSelectedDate((previous) => {
      const next = new Date(previous);
      next.setDate(next.getDate() + offset);
      setCalendarMonth(new Date(next.getFullYear(), next.getMonth(), 1));
      return next;
    });
  };

  const resetFoodForm = () => {
    setSearch("");
    setSelectedFood(null);
    setQuantity(1);
    setCustomFood(false);
    setCustomName("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomCarbs("");
    setCustomFat("");
    setCustomFiber("");
    setCustomSugar("");
    setCustomCholesterol("");
    setCustomVitamins("");
  };

  const openAddFood = (mealId) => {
    resetFoodForm();
    setActiveMeal(mealId);
  };

  const saveCalorieTarget = () => {
    const parsed = Number(targetInput);

    if (!Number.isFinite(parsed) || parsed <= 0) return;

    const savedTarget = Math.round(parsed);
    setCalorieTarget(savedTarget);
    localStorage.setItem("avenour_calorie_target", String(savedTarget));
    setEditingTarget(false);
  };

  const addFood = () => {
    if (!activeMeal) return;

    let food = selectedFood;

    if (customFood) {
      if (!customName.trim() || customCalories === "") return;

      food = {
        id: Date.now(),
        name: customName.trim(),
        serving: "Custom serving",
        calories: Number(customCalories) || 0,
        protein: Number(customProtein) || 0,
        carbs: Number(customCarbs) || 0,
        fat: Number(customFat) || 0,
        fiber: customFiber === "" ? null : Number(customFiber),
        sugar: customSugar === "" ? null : Number(customSugar),
        cholesterol: customCholesterol === "" ? null : Number(customCholesterol),
        vitamins: customVitamins.trim() || null,
      };
    }

    if (!food || quantity <= 0) return;

    const newEntry = {
      ...food,
      quantity: Number(quantity),
      entryId: `${Date.now()}-${Math.random()}`,
    };

    setMealData((previous) => {
      const day = previous[dateKey] || EMPTY_MEALS();

      return {
        ...previous,
        [dateKey]: {
          ...day,
          [activeMeal]: [...day[activeMeal], newEntry],
        },
      };
    });

    setActiveMeal(null);
  };

  const removeFood = (mealId, entryId) => {
    setMealData((previous) => {
      const day = previous[dateKey] || EMPTY_MEALS();

      return {
        ...previous,
        [dateKey]: {
          ...day,
          [mealId]: day[mealId].filter(
            (food) => food.entryId !== entryId
          ),
        },
      };
    });
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1);
    const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
    const offset = firstDay.getDay();
    return [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  }, [calendarMonth]);

  const calendarDate = (day) => new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
  const loggedDaySummary = (day) => {
    if (!day) return null;
    const key = getDateKey(calendarDate(day));
    const foods = Object.values(mealData[key] || EMPTY_MEALS()).flat();
    if (!foods.length) return null;
    return foods.reduce((sum, food) => sum + (Number(food.calories) || 0) * (Number(food.quantity) || 1), 0);
  };
  const changeCalendarMonth = (offset) => setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));

  return (
    <div className="diary-page">
      {/* Header */}
      <header className="diary-header">
        <div>
          <div className="diary-eyebrow">YOUR NUTRITION JOURNEY</div>
          <h1>
            Food <span>Diary</span>
          </h1>
          <p>Every choice counts. Keep track of what fuels you.</p>
        </div>

        <button
          className="diary-add-main"
          onClick={() => openAddFood("breakfast")}
        >
          <span>＋</span> Log food
        </button>
      </header>

      {/* Date Navigation */}
      <div className="diary-date-row">
        <div className="diary-date-navigation">
          <button onClick={() => changeDate(-1)} aria-label="Previous day">
            ‹
          </button>

          <div className="diary-date-display">
            <span className="diary-date-icon">▦</span>
            <span>{formatDate(selectedDate)}</span>
          </div>

          <button
            onClick={() => changeDate(1)}
            disabled={isToday}
            aria-label="Next day"
          >
            ›
          </button>
        </div>

        {!isToday && (
          <button
            className="diary-today-btn"
            onClick={() => setSelectedDate(new Date())}
          >
            Go to today
          </button>
        )}
      </div>


      {/* Daily history calendar */}
      <section className="diary-history-calendar">
        <div className="diary-history-heading">
          <div>
            <h3>Daily history</h3>
            <p>Saved meals and calorie progress by date</p>
          </div>
          <button className="diary-calendar-toggle" onClick={() => setShowCalendar((v) => !v)}>{showCalendar ? "Hide calendar" : "Show calendar"}</button>
        </div>
        {showCalendar && (
          <div className="diary-calendar-body">
            <div className="diary-calendar-month-nav">
              <button onClick={() => changeCalendarMonth(-1)} aria-label="Previous month">‹</button>
              <strong>{formatMonth(calendarMonth)}</strong>
              <button onClick={() => changeCalendarMonth(1)} aria-label="Next month" disabled={calendarMonth.getFullYear() === new Date().getFullYear() && calendarMonth.getMonth() >= new Date().getMonth()}>›</button>
            </div>
            <div className="diary-calendar-grid">
              { ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => <span className="diary-calendar-weekday" key={label}>{label}</span>) }
              {calendarDays.map((day, index) => {
                if (!day) return <span className="diary-calendar-blank" key={`blank-${index}`} />;
                const date = calendarDate(day);
                const key = getDateKey(date);
                const summary = loggedDaySummary(day);
                const isSelected = key === dateKey;
                const isFuture = date > new Date(new Date().setHours(23, 59, 59, 999));
                return (
                  <button key={key} className={`diary-calendar-day ${isSelected ? "selected" : ""} ${summary !== null ? "has-log" : ""}`} disabled={isFuture} onClick={() => { setSelectedDate(date); setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1)); }} title={summary !== null ? `${Math.round(summary)} kcal logged` : "No foods logged"}>
                    <span>{day}</span>
                    {summary !== null ? <small>{Math.round(summary)} kcal</small> : <i />}
                  </button>
                );
              })}
            </div>
            <div className="diary-calendar-legend"><span className="diary-calendar-dot" /> Day with saved food logs</div>
          </div>
        )}
      </section>

      {/* Nutrition Overview */}
      <section className="diary-overview">
        {/* Calories */}
        <div className="diary-calorie-card">
          <div className="diary-card-heading">
            <span>CALORIES</span>
            <span className="diary-status-pill">Daily overview</span>
          </div>

          <div className="diary-calorie-content">
            <div
              className="diary-calorie-ring"
              style={{
                background: `conic-gradient(#69d5a0 ${
                  caloriePercentage * 3.6
                }deg, rgba(255,255,255,0.09) 0deg)`,
              }}
            >
              <div className="diary-calorie-ring-inner">
                <span className="diary-ring-caption">Consumed</span>
                <strong>{Math.round(totals.calories).toLocaleString()}</strong>
                <span className="diary-ring-unit">kcal</span>
              </div>
            </div>

            <div className="diary-calorie-stats">
              <div className="diary-stat-row diary-target-row">
                <span>Daily target</span>

                {!editingTarget ? (
                  <div className="diary-target-value">
                    <strong>{calorieTarget.toLocaleString()} kcal</strong>
                    <button
                      className="diary-target-edit"
                      onClick={() => {
                        setTargetInput(String(calorieTarget));
                        setEditingTarget(true);
                      }}
                      aria-label="Edit daily calorie target"
                      title="Edit calorie target"
                    >
                      ✎
                    </button>
                  </div>
                ) : (
                  <div className="diary-target-edit-form">
                    <input
                      type="number"
                      min="1"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      autoFocus
                    />
                    <button onClick={saveCalorieTarget}>Save</button>
                    <button onClick={() => setEditingTarget(false)}>Cancel</button>
                  </div>
                )}
              </div>

              <div className="diary-stat-row">
                <span>Consumed</span>
                <strong>{Math.round(totals.calories).toLocaleString()} kcal</strong>
              </div>

              <div className="diary-stat-row diary-remaining">
                <span>{calorieRemaining >= 0 ? "Remaining" : "Over target"}</span>
                <strong>
                  {Math.abs(Math.round(calorieRemaining)).toLocaleString()} kcal
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Macronutrients and extras */}
        <div className="diary-macros-card">
          <div className="diary-card-heading">
            <span>MACRONUTRIENTS</span>
            <span className="diary-status-pill">Daily intake</span>
          </div>

          <div className="diary-macros-list">
            <MacroBar
              label="Protein"
              value={totals.protein}
              target={120}
              color="#6CB8F4"
            />
            <MacroBar
              label="Carbs"
              value={totals.carbs}
              target={250}
              color="#E8B76A"
            />
            <MacroBar
              label="Fat"
              value={totals.fat}
              target={70}
              color="#B49BF3"
            />
          </div>

          <div className="diary-macros-footer">
            <span>Calculated from logged food</span>
            <span className="diary-green-dot" />
          </div>
        </div>
      </section>

      {/* Additional nutrients */}
      <section className="diary-extra-nutrients-section">
        <div className="diary-extra-heading">
          <div>
            <h3>Additional nutrients</h3>
            <p>Optional nutrition information from logged foods</p>
          </div>
          <span className="diary-status-pill">Optional data</span>
        </div>

        <div className="diary-extra-nutrients-grid">
          <ExtraNutrient
            label="Fiber"
            value={totals.fiber.value}
            unit="g"
            incomplete={totals.fiber.incomplete}
          />
          <ExtraNutrient
            label="Sugar"
            value={totals.sugar.value}
            unit="g"
            incomplete={totals.sugar.incomplete}
          />
          <ExtraNutrient
            label="Cholesterol"
            value={totals.cholesterol.value}
            unit="mg"
            incomplete={totals.cholesterol.incomplete}
          />

          <div className="diary-extra-nutrient diary-vitamins">
            <span className="diary-extra-label">Vitamins</span>
            <strong>
              {totals.vitamins.length ? totals.vitamins.join(", ") : "—"}
            </strong>
            <small>
              {totals.vitamins.length ? "From logged food" : "No information added"}
            </small>
          </div>
        </div>

        <div className="diary-extra-note">
          — means nutrition information hasn't been provided. Partial data is shown
          when some logged foods have nutrient values and others don't.
        </div>
      </section>

      {/* Meal List */}
      <div className="diary-meals-heading">
        <div>
          <h2>{isToday ? "Today's meals" : "Meals"}</h2>
          <p>Fuel your day, one meal at a time.</p>
        </div>

        <span className="diary-meal-count">
          {Object.values(currentMeals).flat().length} items logged
        </span>
      </div>

      <div className="diary-meals-list">
        {MEALS.map((meal) => {
          const foods = currentMeals[meal.id] || [];

          const mealCalories = foods.reduce(
            (sum, food) => sum + food.calories * food.quantity,
            0
          );

          return (
            <section className="diary-meal-card" key={meal.id}>
              <div className="diary-meal-header">
                <div className="diary-meal-title-wrap">
                  <div className="diary-meal-icon">
                  <img
                    src={
                      meal.id === "breakfast"
                        ? "/breakfast.jpg"
                        : meal.id === "lunch"
                        ? "/lunch.jpg"
                        : meal.id === "snack"
                        ? "/snacks.jpg"
                        : "/dinner.jpg"
                    }
                    alt={`${meal.name} image`}
                  />
                </div>
                  <div>
                    <h3>{meal.name}</h3>
                    <span>{meal.time}</span>
                  </div>
                </div>

                <div className="diary-meal-right">
                  <div className="diary-meal-calories">
                    <strong>{Math.round(mealCalories)}</strong>
                    <span>kcal</span>
                  </div>

                  <button
                    className="diary-meal-add"
                    onClick={() => openAddFood(meal.id)}
                    aria-label={`Add food to ${meal.name}`}
                  >
                    +
                  </button>
                </div>
              </div>

              {foods.length === 0 ? (
                <button
                  className="diary-empty-meal"
                  onClick={() => openAddFood(meal.id)}
                >
                  <span className="diary-empty-plus">＋</span>
                  <span>Add what you ate</span>
                </button>
              ) : (
                <div className="diary-food-list">
                  {foods.map((food) => (
                    <div className="diary-food-item" key={food.entryId}>
                      <div className="diary-food-visual">✳</div>

                      <div className="diary-food-info">
                        <strong>{food.name}</strong>
                        <span>
                          {food.serving} · {food.quantity} serving
                          {food.quantity !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="diary-food-nutrition">
                        <strong>
                          {Math.round(food.calories * food.quantity)} kcal
                        </strong>
                        <span>
                          P {Math.round(food.protein * food.quantity)}g · C{" "}
                          {Math.round(food.carbs * food.quantity)}g · F{" "}
                          {Math.round(food.fat * food.quantity)}g
                        </span>
                      </div>

                      <button
                        className="diary-food-remove"
                        onClick={() => removeFood(meal.id, food.entryId)}
                        aria-label={`Remove ${food.name}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <button
                    className="diary-add-another"
                    onClick={() => openAddFood(meal.id)}
                  >
                    + Add another food
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Tip */}
      <section className="diary-bottom-tip">
        <div className="diary-tip-icon">✦</div>
        <div>
          <strong>Consistency over perfection.</strong>
          <p>
            Every meal you log helps you understand your habits and build a
            healthier relationship with food.
          </p>
        </div>
      </section>

      {/* Add Food Modal */}
      {activeMeal && (
        <div
          className="diary-modal-overlay"
          onClick={() => setActiveMeal(null)}
        >
          <div className="diary-food-modal" onClick={(e) => e.stopPropagation()}>
            <div className="diary-modal-top">
              <div>
                <div className="diary-modal-meal-select">
                  <label htmlFor="diary-meal-select">ADD TO</label>
                  <select
                    id="diary-meal-select"
                    value={activeMeal}
                    onChange={(e) => setActiveMeal(e.target.value)}
                    aria-label="Choose meal to add food to"
                  >
                    {MEALS.map((meal) => (
                      <option key={meal.id} value={meal.id}>
                        {meal.name}
                      </option>
                    ))}
                  </select>
                  <span className="diary-meal-select-chevron">⌄</span>
                </div>
                <h2>Log your food</h2>
              </div>

              <button
                className="diary-modal-close"
                onClick={() => setActiveMeal(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Tabs */}
            <div className="diary-modal-tabs">
              <button
                className={!customFood ? "active" : ""}
                onClick={() => {
                  setCustomFood(false);
                  setSelectedFood(null);
                }}
              >
                Search food
              </button>

              <button
                className={customFood ? "active" : ""}
                onClick={() => {
                  setCustomFood(true);
                  setSelectedFood(null);
                }}
              >
                Custom food
              </button>
            </div>

            {!customFood ? (
              <>
                <div className="diary-search-box">
                  <span>⌕</span>
                  <input
                    autoFocus
                    placeholder="Search food..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setSelectedFood(null);
                    }}
                  />

                  {search && (
                    <button onClick={() => setSearch("")}>×</button>
                  )}
                </div>

                <div className="diary-search-results">
                  {filteredFoods.map((food) => (
                    <button
                      className={`diary-search-item ${
                        selectedFood?.id === food.id ? "selected" : ""
                      }`}
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                    >
                      <div className="diary-food-visual">✳</div>

                      <div className="diary-food-info">
                        <strong>{food.name}</strong>
                        <span>{food.serving}</span>
                      </div>

                      <span className="diary-search-cal">{food.calories} kcal</span>

                      <span className="diary-select-check">
                        {selectedFood?.id === food.id ? "✓" : "＋"}
                      </span>
                    </button>
                  ))}

                  {filteredFoods.length === 0 && (
                    <div className="diary-no-results">
                      No matching foods found. Try another search or use Custom food.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="diary-custom-form">
                <label>
                  Food name
                  <input
                    placeholder="e.g. Vegetable pulao"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                  />
                </label>

                <label>
                  Calories (kcal)
                  <input
                    type="number"
                    min="0"
                    placeholder="Calories"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                  />
                </label>

                <div className="diary-custom-macros">
                  <label>
                    Protein (g)
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={customProtein}
                      onChange={(e) => setCustomProtein(e.target.value)}
                    />
                  </label>

                  <label>
                    Carbs (g)
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={customCarbs}
                      onChange={(e) => setCustomCarbs(e.target.value)}
                    />
                  </label>

                  <label>
                    Fat (g)
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={customFat}
                      onChange={(e) => setCustomFat(e.target.value)}
                    />
                  </label>
                </div>

                {/* Optional nutrients */}
                <div className="diary-optional-nutrients">
                  <div className="diary-optional-title">
                    <strong>Additional nutrients</strong>
                    <span>Optional</span>
                  </div>

                  <div className="diary-custom-macros">
                    <label>
                      Fiber (g)
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Optional"
                        value={customFiber}
                        onChange={(e) => setCustomFiber(e.target.value)}
                      />
                    </label>

                    <label>
                      Sugar (g)
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="Optional"
                        value={customSugar}
                        onChange={(e) => setCustomSugar(e.target.value)}
                      />
                    </label>

                    <label>
                      Cholesterol (mg)
                      <input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Optional"
                        value={customCholesterol}
                        onChange={(e) => setCustomCholesterol(e.target.value)}
                      />
                    </label>
                  </div>

                  <label className="diary-vitamins-input">
                    Vitamins
                    <input
                      type="text"
                      placeholder="e.g. Vitamin A, C, B12 (optional)"
                      value={customVitamins}
                      onChange={(e) => setCustomVitamins(e.target.value)}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="diary-quantity-row">
              <div>
                <strong>Quantity</strong>
                <span>Number of servings</span>
              </div>

              <div className="diary-quantity-control">
                <button
                  onClick={() =>
                    setQuantity((q) => Math.max(0.25, +(q - 0.25).toFixed(2)))
                  }
                >
                  −
                </button>

                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(0.25, Number(e.target.value) || 0.25))
                  }
                />

                <button
                  onClick={() => setQuantity((q) => +(q + 0.25).toFixed(2))}
                >
                  +
                </button>
              </div>
            </div>

            <button
              className="diary-modal-add-button"
              disabled={
                (!customFood && !selectedFood) ||
                (customFood && (!customName.trim() || customCalories === ""))
              }
              onClick={addFood}
            >
              Add to diary
            </button>
          </div>
        </div>
      )}
    </div>
  );
}