# 🌱 PlantPal – Responsive Plant Care Tracker

PlantPal is a sleek, responsive single-page web app to help you manage your houseplants with ease. Built with **React + Vite**, styled using **Tailwind CSS**, and uses **LocalStorage** for persistence. Now live—and deployed via **Vercel**!  

[ Visit the live app → **plant-plan-nine.vercel.app** ](https://plant-plan-nine.vercel.app)

---

##  Features

- **Add Plant Form** – Add plants with name, type, watering frequency, sunlight needs, last watered date, and an optional image.
- **Plant Cards** – Animated, responsive cards to view plant details and actions.
- **Watered Button** – Updates the "last watered" date and triggers status animations.
- **Delete Functionality** – Remove plants from both the UI and `localStorage`.
- **Dark / Light Mode** – Toggle between themes with smooth transitions (persisted across sessions).
- **Bonus Features**:
  - Filter plants by type.
  - Sort by next watering date, name, or newest.
  - Dashboard summary (e.g., “3 plants need watering today”).
  - Export/import plant data as JSON.

---

##  Live Demo

Check it out yourself: **[plant-plan-nine.vercel.app](https://plant-plan-nine.vercel.app)**

---

##  Tech Stack

| Stack | Details |
|-------|---------|
| **React (Vite)** | Fast and modern frontend tooling |
| **Tailwind CSS** | Utility-first styling framework |
| **LocalStorage** | For client-side data persistence |
| **Vercel** | Hosting and continuous deployment |

---

##  Getting Started

1. **Clone the repository**  
   ```bash
   git clone https://github.com/RencyBoreh/PlantPlan.git
   cd PlanPlan-Project/plantpal
Install dependencies (using pnpm)

bash
Copy code
pnpm install
Run the development server

bash
Copy code
pnpm run dev
Open http://localhost:5173 to view it locally.

Build for production

bash
Copy code
pnpm run build
Deployment on Vercel
Connected GitHub repository triggers automatic deployment on push to main.

Live site: plant-plan-nine.vercel.app

(Optional) Add a custom domain via Vercel dashboard if desired.

Future Ideas (Bonus)
Add filters by watering status or type

Sort plants by next watering date

Dashboard with quick stats like “Plants that need watering today”

Export/import plant data easily via JSON

Author
Rency Jeptanui (RencyBoreh)
Aspiring Full-Stack Developer from Kenya

License
This project is open-sourced under the MIT License. Use it, modify it, and make plant care easier!
