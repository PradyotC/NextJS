# Portfolio & Full-Stack Playground

> **Under the Hood:** This isn't just a portfolio; it's a full-stack playground. Here is a breakdown of the architecture, the technology choices, and the "Why" behind them.

## 🏗 Core Architecture: SSR & Server Components

This application utilizes **Next.js 15+ App Router**.

- **Server-First Approach:** By default, pages are React Server Components (RSC). This reduces the JavaScript bundle size sent to the browser, improving First Contentful Paint (FCP) and SEO scores. Sensitive logic (API keys, DB connections) stays strictly on the server.
- **Client Wrappers:** Interactivity (like the music player, stock carousel, or theme toggle) is isolated into "Client Components." The server fetches the data and passes it as props to these wrappers. This **"Island Architecture"** pattern ensures we only hydrate the JavaScript that actually needs to be interactive.

## 💾 Data Layer & Caching

### Neon Tech PostgreSQL + Prisma ORM
I chose **Neon** because it offers Serverless PostgreSQL. It separates compute from storage, meaning it scales down to zero when not in use (cost-effective) and scales up instantly. **Prisma** provides a type-safe interface to the DB, ensuring that if my schema changes, my TypeScript code catches errors at build time.

| Feature | Description |
| :--- | :--- |
| **Smart Caching** | External APIs (Stocks, News) have strict rate limits. I implemented a caching layer in Postgres. Before hitting an API, the server checks the DB. If data is fresh, it serves from DB; otherwise, it fetches, updates DB, and serves. |
| **Image Proxying** | To avoid CORS issues, mixed content warnings (HTTP images on HTTPS site), and hotlinking protection from providers like Jamendo/NewsAPI, images are proxied through a Next.js API route. |
| **GitHub Sync** | The "Sandbox" doesn't just link to GitHub; it uses the GitHub API and Webhooks to pull raw file content and folder structures, effectively mirroring the repo structure live on the site. |

## 🌐 API Ecosystem

This project integrates several external APIs to provide live data.

| Provider | Service Description |
| :--- | :--- |
| **AlphaVantage** | Provides daily stock data (Top Gainers/Losers). Cached for 24h to avoid hitting the 25-request limit. |
| **TMDB** | The Movie Database API supplies trending movies, posters, and backdrops for the entertainment section. |
| **Jamendo** | A catalog of royalty-free music. Tracks are fetched server-side, and audio streams are proxied to bypass strict CORS. |
| **NewsAPI** | Aggregates global headlines. Articles are categorized (Tech, Business, etc.) and cached to maintain performance. |
| **Piston API** | A high-performance code execution engine. It isolates and runs the code written in the Sandbox component securely in real-time. |

## 🎨 Frontend & UI

### Tailwind CSS (v4) & DaisyUI (v5)
- **Tailwind** allows for rapid styling without context-switching between HTML and CSS files. It enforces consistency via utility classes.
- **DaisyUI** adds semantic component classes (like `btn`, `card`, `navbar`) on top of Tailwind. This keeps the HTML clean while maintaining the flexibility of utility classes. It also comes with built-in accessibility focus states and theme handling via `next-themes`.

### Tech Stack
* **Framework:** Next.js 16 (App Router)
* **Library:** React 19
* **Language:** TypeScript
* **Styling:** Tailwind CSS 4, DaisyUI 5, SASS
* **Database:** Neon DB (Serverless Postgres)
* **ORM:** Prisma
* **Editor:** Monaco Editor (React)
* **Audio:** Wavesurfer.js
* **Deployment:** Vercel

## ⚡ Deployment

### CI/CD Pipeline
Code is hosted on **GitHub**. Every push to the `main` branch triggers a deployment on **Vercel**. Vercel handles the build process, optimizes images, and deploys the Serverless Functions (API routes) to edge locations globally.
