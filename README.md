# StereoJEE — Stereoisomerism Complete Guide

Interactive JEE Chemistry learning app for stereoisomerism. Built for Aakash Institute students.

## What's Inside

- **8 Learning Sections**: Home, Isomers Overview, Geometric, Optical, Projections, Conformational, Counting, Quiz
- **Interactive Newman Projection Rotator** (Ethane + n-Butane with dihedral angle slider)
- **Fischer Projection** with visual rules
- **R/S Configuration** step-by-step with practice
- **Meso Compound Visualizer** with POS diagram
- **Counting Stereoisomers** with 4 worked examples
- **15 JEE-Level Quiz Questions** with detailed explanations
- **AI Doubt Solver** (powered by OpenRouter — API key stays on server)
- Student name entry on landing page

---

## Deploy to Vercel (5 minutes)

### Step 1 — Upload to GitHub
1. Create a new repo on github.com (e.g. `stereo-jee`)
2. Drag and drop ALL these files into the repo (maintain folder structure)
3. Commit

### Step 2 — Connect to Vercel
1. Go to vercel.com → New Project
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click Deploy

### Step 3 — Add API Key (IMPORTANT)
1. In Vercel → Your Project → Settings → Environment Variables
2. Add: `OPENROUTER_API_KEY` = your OpenRouter key
3. Redeploy (Vercel → Deployments → Redeploy)

### Step 4 — Share with Students
Send them your Vercel URL: `https://your-project-name.vercel.app`

---

## Local Development

```bash
npm install
cp .env.local.example .env.local
# Add your OPENROUTER_API_KEY to .env.local
npm run dev
```

Open http://localhost:3000

---

## File Structure

```
stereo-jee/
├── app/
│   ├── page.jsx              ← Landing page (name entry)
│   ├── learn/page.jsx        ← Main app (all 8 sections)
│   ├── api/doubt/route.js    ← AI proxy (API key hidden here)
│   └── layout.js             ← Root layout
├── .env.local.example        ← Copy to .env.local, add your key
├── .gitignore                ← Hides .env.local from GitHub ✓
├── next.config.js
└── package.json
```

---

## AI Model Used
OpenRouter → `google/gemini-2.0-flash-exp:free` (free tier)
Can change model in `app/api/doubt/route.js` line 22.

## Made by
Himanshu Jain · Aakash Institute, Greater Noida · JEE Chemistry Division
