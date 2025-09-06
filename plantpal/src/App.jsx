import React, { useEffect, useState, useRef } from "react";

// PlantPal - Single-file React component
// Tailwind CSS required in the project for styling to work

export default function App() {
  const LS_KEY = "plantpal_plants_v1";
  const THEME_KEY = "plantpal_theme_v1";

  const [plants, setPlants] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to load plants from localStorage", e);
      return [];
    }
  });

  const [showForm, setShowForm] = useState(false);
  const [loaded, setLoaded] = useState(false); // for fade-in
  const [filterType, setFilterType] = useState("all");
  const [sortMode, setSortMode] = useState("nextWatering");
  const [theme, setTheme] = useState(() => {
    const t = localStorage.getItem(THEME_KEY);
    return t || "light";
  });

  // form state
  const [form, setForm] = useState({
    name: "",
    type: "",
    wateringFrequency: 7,
    sunlight: "Bright indirect",
    lastWatered: new Date().toISOString().slice(0, 10),
    image: "",
  });

  const formRef = useRef();

  // sample royalty-free images (Unsplash)
  const sampleImages = {
    succulent:
      "https://images.unsplash.com/photo-1524592831667-2b2d1b1f3b76?auto=format&fit=crop&w=800&q=60",
    fern:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=60",
    monstera:
      "https://images.unsplash.com/photo-1535905748047-14a1d3a7a9d8?auto=format&fit=crop&w=800&q=60",
    fiddle:
      "https://images.unsplash.com/photo-1536104968055-4d61aa56cc07?auto=format&fit=crop&w=800&q=60",
    default:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=60",
  };

  useEffect(() => {
    // tiny fade-in
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(plants));
    } catch (e) {
      console.error("Failed to save plants to localStorage", e);
    }
  }, [plants]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  const resetForm = () =>
    setForm({
      name: "",
      type: "",
      wateringFrequency: 7,
      sunlight: "Bright indirect",
      lastWatered: new Date().toISOString().slice(0, 10),
      image: "",
    });

  function addPlant(e) {
    e.preventDefault();
    if (!form.name.trim()) return alert("Please give your plant a name.");

    const id = Date.now().toString();
    const newPlant = {
      id,
      name: form.name.trim(),
      type: (form.type || "unknown").toLowerCase(),
      wateringFrequency: Number(form.wateringFrequency) || 7,
      sunlight: form.sunlight,
      lastWatered: form.lastWatered,
      image: form.image || sampleImages[form.type?.toLowerCase()] || sampleImages.default,
      createdAt: new Date().toISOString(),
    };

    setPlants((p) => [newPlant, ...p]);
    resetForm();
    setShowForm(false);
  }

  function removePlant(id) {
    if (!confirm("Delete this plant?")) return;
    setPlants((p) => p.filter((pl) => pl.id !== id));
  }

  function markWatered(id) {
    setPlants((p) =>
      p.map((pl) => (pl.id === id ? { ...pl, lastWatered: new Date().toISOString() } : pl))
    );
  }

  function daysBetween(aIso, b = new Date()) {
    const a = new Date(aIso);
    const diff = Math.floor((b - a) / (1000 * 60 * 60 * 24));
    return diff;
  }

  function nextWateringDate(plant) {
    const last = new Date(plant.lastWatered);
    const next = new Date(last);
    next.setDate(next.getDate() + Number(plant.wateringFrequency));
    return next;
  }

  function needsWateringToday(plant) {
    const next = nextWateringDate(plant);
    const today = new Date();
    // normalize to date only
    next.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return next <= today;
  }

  // Filters and sorting
  const uniqueTypes = Array.from(new Set(plants.map((p) => p.type))).filter(Boolean);

  let visible = plants.slice();
  if (filterType !== "all") {
    visible = visible.filter((p) => p.type === filterType);
  }

  if (sortMode === "nextWatering") {
    visible.sort((a, b) => nextWateringDate(a) - nextWateringDate(b));
  } else if (sortMode === "name") {
    visible.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortMode === "createdAt") {
    visible.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Dashboard summary
  const needCount = plants.filter((p) => needsWateringToday(p)).length;

  // Export / Import
  function exportJSON() {
    const data = JSON.stringify(plants, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "plantpal_export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const arr = JSON.parse(ev.target.result);
        if (!Array.isArray(arr)) throw new Error("Not an array");
        // basic validation
        const clean = arr
          .map((it) => ({
            id: it.id || Date.now().toString() + Math.random(),
            name: it.name || "Unnamed",
            type: (it.type || "unknown").toLowerCase(),
            wateringFrequency: Number(it.wateringFrequency) || 7,
            sunlight: it.sunlight || "",
            lastWatered: it.lastWatered || new Date().toISOString(),
            image: it.image || sampleImages.default,
            createdAt: it.createdAt || new Date().toISOString(),
          }))
          .slice(0, 500); // safety cap

        setPlants((prev) => [...clean, ...prev]);
        alert("Imported " + clean.length + " plants (merged).");
      } catch (err) {
        alert("Failed to import: " + err.message);
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className={`min-h-screen transition-colors duration-500 ${theme === "dark" ? "dark" : ""}`}>
      <style>{`
        /* small custom keyframes to supplement Tailwind */
        @keyframes slideInFromTop { from { transform: translateY(-12px); opacity: 0 } to { transform: translateY(0); opacity:1 } }
        .slide-in { animation: slideInFromTop 360ms ease-out both }
        .fade-in { animation: fadeIn 450ms ease both }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>

      <main className="bg-gradient-to-b from-white to-emerald-50 dark:from-gray-900 dark:to-gray-800 min-h-screen p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <header className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">PlantPal</h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Your simple houseplant tracker</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700 dark:text-gray-200 mr-2">{needCount} need watering</div>
              <button
                onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
                className="p-2 rounded-lg bg-white/70 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-700 shadow-sm hover:scale-105 transition-transform"
                title="Toggle dark / light"
              >
                {theme === "dark" ? "🌙" : "☀️"}
              </button>

              <button
                onClick={() => setShowForm((s) => !s)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-500 text-white rounded-xl shadow hover:brightness-95 transition"
              >
                + Add Plant
              </button>
            </div>
          </header>

          {/* slide-in form */}
          <section
            ref={formRef}
            className={`mb-6 ${showForm ? "slide-in transform" : "-translate-y-6 opacity-0 pointer-events-none"} transition-all`}
          >
            <form
              onSubmit={addPlant}
              className="bg-white/80 dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-sm backdrop-blur"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  className="input"
                  placeholder="Plant name (e.g., Rosie)"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                  className="input"
                  placeholder="Type (e.g., Succulent, Fern)"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                />

                <label className="text-xs text-gray-600 dark:text-gray-300">Water every (days)</label>
                <label className="text-xs text-gray-600 dark:text-gray-300">Last watered</label>

                <input
                  type="number"
                  min={1}
                  className="input"
                  value={form.wateringFrequency}
                  onChange={(e) => setForm({ ...form, wateringFrequency: e.target.value })}
                />

                <input
                  type="date"
                  className="input"
                  value={form.lastWatered}
                  onChange={(e) => setForm({ ...form, lastWatered: e.target.value })}
                />

                <select
                  className="input col-span-1 sm:col-span-2"
                  value={form.sunlight}
                  onChange={(e) => setForm({ ...form, sunlight: e.target.value })}
                >
                  <option>Bright indirect</option>
                  <option>Direct sunlight</option>
                  <option>Low light</option>
                </select>

                <input
                  className="input col-span-1 sm:col-span-2"
                  placeholder="Image URL (optional)"
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />

                <div className="flex items-center gap-3">
                  <button className="px-4 py-2 bg-emerald-500 text-white rounded-lg shadow">Save</button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </section>

          {/* controls */}
          <section className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <select
                className="input w-40"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All types</option>
                {uniqueTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select className="input w-44" value={sortMode} onChange={(e) => setSortMode(e.target.value)}>
                <option value="nextWatering">Sort: next watering</option>
                <option value="name">Sort: name</option>
                <option value="createdAt">Sort: newest</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportJSON}
                className="px-3 py-2 border rounded-lg text-sm bg-white/60 dark:bg-gray-700/50"
              >
                Export JSON
              </button>

              <label className="px-3 py-2 border rounded-lg text-sm bg-white/60 dark:bg-gray-700/50 cursor-pointer">
                Import
                <input
                  type="file"
                  accept="application/json"
                  onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* Grid of cards */}
          <section>
            {plants.length === 0 ? (
              <div className="rounded-2xl p-8 text-center bg-white/70 dark:bg-gray-900/60 border border-dashed border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold">No plants yet</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Add your first plant with the "Add Plant" button.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${loaded ? "fade-in" : "opacity-0"}`}>
                {visible.map((pl) => {
                  const next = nextWateringDate(pl);
                  const daysLeft = Math.ceil((next - new Date()) / (1000 * 60 * 60 * 24));
                  const needs = needsWateringToday(pl);

                  return (
                    <article
                      key={pl.id}
                      className="relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.01] transition-all"
                    >
                      <div className="h-40 w-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <img
                          src={pl.image}
                          alt={pl.name}
                          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          onError={(e) => (e.currentTarget.src = sampleImages.default)}
                        />
                      </div>

                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{pl.name}</h3>
                            <div className="text-xs text-gray-500 dark:text-gray-300">{pl.type}</div>
                          </div>

                          <div className="text-right text-xs">
                            <div className={`px-2 py-1 rounded-full text-white text-[10px] ${needs ? "bg-rose-500 animate-pulse" : "bg-emerald-500"}`}>
                              {needs ? "Water now" : "OK"}
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                          <div>Water every: <strong>{pl.wateringFrequency} days</strong></div>
                          <div>Sunlight: <strong>{pl.sunlight}</strong></div>
                          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Last watered: {new Date(pl.lastWatered).toLocaleDateString()}</div>

                          <div className="mt-2 text-sm">
                            {needs ? (
                              <div className="text-rose-600 dark:text-rose-400 font-semibold">Needs water today</div>
                            ) : (
                              <div className="text-gray-700 dark:text-gray-200">Next watering in {Math.max(0, daysLeft)} day{Math.abs(daysLeft) !== 1 ? "s" : ""}</div>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() => markWatered(pl.id)}
                            className="px-3 py-2 rounded-lg bg-emerald-500 text-white text-sm shadow hover:scale-105 transition-transform"
                          >
                            Watered
                          </button>

                          <button
                            onClick={() => removePlant(pl.id)}
                            className="px-3 py-2 rounded-lg border text-sm bg-white/60 dark:bg-gray-800/60"
                          >
                            Delete
                          </button>

                          <div className="ml-auto text-xs text-gray-500">Added {new Date(pl.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">Made with ❤️ — PlantPal</footer>
        </div>
      </main>

      {/* small reusable styles for inputs */}
      <style>{`
        .input { width: 100%; padding: 0.55rem 0.75rem; border-radius: 0.75rem; border: 1px solid rgba(0,0,0,0.06); background: rgba(255,255,255,0.8); }
        .dark .input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); color: #e6eef2 }
      `}</style>
    </div>
  );
}
