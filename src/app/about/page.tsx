import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faServer, faDatabase, faLayerGroup, 
    faBolt, faPalette, faGlobe, 
    faMicrochip, faTerminal 
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { faGitAlt } from "@fortawesome/free-brands-svg-icons";

export const metadata = {
    title: "About This Project | Tech Stack",
    description: "Deep dive into the architecture, tech stack, and design decisions behind this portfolio.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen p-6 lg:p-12 max-w-5xl mx-auto space-y-16 text-base-content">
            
            {/* Header */}
            <header className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight">
                    Under the Hood
                </h1>
                <p className="text-xl opacity-80 max-w-2xl leading-relaxed">
                    This isn&apos;t just a portfolio; it&apos;s a full-stack playground. Here is a breakdown of the architecture, the technology choices, and the &quot;Why&quot; behind them.
                </p>
            </header>

            {/* Section 1: Core Architecture */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 text-2xl font-bold text-primary">
                    <FontAwesomeIcon icon={faServer} />
                    <h2>Core Architecture: SSR & Server Components</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="card bg-base-200 border border-base-content/5 p-6">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faMicrochip} className="text-info" />
                            Server-First Approach
                        </h3>
                        <p className="opacity-70 text-sm leading-relaxed">
                            This application utilizes <strong>Next.js 15 App Router</strong>. By default, pages are React Server Components (RSC). This reduces the JavaScript bundle size sent to the browser, improving First Contentful Paint (FCP) and SEO scores. Sensitive logic (API keys, DB connections) stays strictly on the server.
                        </p>
                    </div>
                    <div className="card bg-base-200 border border-base-content/5 p-6">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <FontAwesomeIcon icon={faLayerGroup} className="text-warning" />
                            Client Wrappers
                        </h3>
                        <p className="opacity-70 text-sm leading-relaxed">
                            Interactivity (like the music player, stock carousel, or theme toggle) is isolated into &quot;Client Components.&quot; The server fetches the data and passes it as props to these wrappers. This <strong>&quot;Island Architecture&quot;</strong> pattern ensures we only hydrate the JavaScript that actually needs to be interactive.
                        </p>
                    </div>
                </div>
            </section>

            {/* Section 2: Data & Backend */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 text-2xl font-bold text-secondary">
                    <FontAwesomeIcon icon={faDatabase} />
                    <h2>Data Layer & Caching</h2>
                </div>
                <div className="space-y-6">
                    <div className="card bg-base-300 shadow-sm border border-base-300">
                        <div className="card-body">
                            <h3 className="card-title text-base-content">
                                <span className="text-primary">Neon Tech</span> PostgreSQL + Prisma ORM
                            </h3>
                            <p className="opacity-80">
                                I chose <strong>Neon</strong> because it offers Serverless PostgreSQL. It separates compute from storage, meaning it scales down to zero when not in use (cost-effective) and scales up instantly. <strong>Prisma</strong> provides a type-safe interface to the DB, ensuring that if my schema changes, my TypeScript code catches errors at build time.
                            </p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-base-200 border border-base-content/5">
                            <div className="font-bold mb-1">Smart Caching</div>
                            <p className="text-xs opacity-70">
                                External APIs (Stocks, News) have strict rate limits. I implemented a caching layer in Postgres. Before hitting an API, the server checks the DB. If data is fresh, it serves from DB; otherwise, it fetches, updates DB, and serves.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-base-200 border border-base-content/5">
                            <div className="font-bold mb-1">Image Proxying</div>
                            <p className="text-xs opacity-70">
                                To avoid CORS issues, mixed content warnings (HTTP images on HTTPS site), and hotlinking protection from providers like Jamendo/NewsAPI, images are proxied through a Next.js API route.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-base-200 border border-base-content/5">
                            <div className="font-bold mb-1">GitHub Sync</div>
                            <p className="text-xs opacity-70">
                                The &quot;Sandbox&quot; doesn&apos;t just link to GitHub; it uses the GitHub API and Webhooks to pull raw file content and folder structures, effectively mirroring the repo structure live on the site.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 3: Integrations */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 text-2xl font-bold text-accent">
                    <FontAwesomeIcon icon={faGlobe} />
                    <h2>API Ecosystem</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <ApiCard 
                        title="AlphaVantage" 
                        desc="Provides daily stock data (Top Gainers/Losers). Cached for 24h to avoid hitting the 25-request limit."
                        color="badge-success"
                    />
                    <ApiCard 
                        title="TMDB" 
                        desc="The Movie Database API supplies trending movies, posters, and backdrops for the entertainment section."
                        color="badge-primary"
                    />
                    <ApiCard 
                        title="Jamendo" 
                        desc="A catalog of royalty-free music. Tracks are fetched server-side, and audio streams are proxied to bypass strict CORS."
                        color="badge-warning"
                    />
                    <ApiCard 
                        title="NewsAPI" 
                        desc="Aggregates global headlines. Articles are categorized (Tech, Business, etc.) and cached to maintain performance."
                        color="badge-info"
                    />
                    <ApiCard 
                        title="Piston API" 
                        desc="A high-performance code execution engine. It isolates and runs the code written in the Sandbox component securely in real-time."
                        color="badge-error"
                        icon={faTerminal}
                    />
                </div>
            </section>

            {/* Section 4: UI/UX */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 text-2xl font-bold text-base-content">
                    <FontAwesomeIcon icon={faPalette} />
                    <h2>Frontend & UI</h2>
                </div>
                <div className="bg-base-200 rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-1 space-y-4">
                        <h3 className="text-xl font-bold">Why Tailwind CSS & DaisyUI?</h3>
                        <p className="opacity-70 leading-relaxed">
                            <strong>Tailwind (v4)</strong> allows for rapid styling without context-switching between HTML and CSS files. It enforces consistency via utility classes.
                        </p>
                        <p className="opacity-70 leading-relaxed">
                            <strong>DaisyUI (v5)</strong> adds semantic component classes (like <code>btn</code>, <code>card</code>, <code>navbar</code>) on top of Tailwind. This keeps the HTML clean while maintaining the flexibility of utility classes. It also comes with built-in accessibility focus states and theme handling via <code>next-themes</code>.
                        </p>
                    </div>
                    <div className="flex-1 bg-base-300 p-6 rounded-xl border border-base-300 w-full">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-base-content/10 pb-2">
                                <span className="font-bold text-sm">Tech Stack</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <TechBadge name="Next.js 16" />
                                <TechBadge name="React 19" />
                                <TechBadge name="TypeScript" />
                                <TechBadge name="Tailwind CSS 4" />
                                <TechBadge name="DaisyUI 5" />
                                <TechBadge name="Prisma" />
                                <TechBadge name="Neon DB" />
                                <TechBadge name="Monaco Editor" />
                                <TechBadge name="Wavesurfer.js" />
                                <TechBadge name="SASS" />
                                <TechBadge name="Vercel" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Section 5: Dev Ops */}
            <section className="space-y-8">
                <div className="flex items-center gap-3 text-2xl font-bold text-error">
                    <FontAwesomeIcon icon={faBolt} />
                    <h2>Deployment</h2>
                </div>
                <div className="alert bg-base-200 border-none shadow-sm">
                    <FontAwesomeIcon icon={faGitAlt} className="text-3xl text-orange-600" />
                    <div>
                        <h3 className="font-bold">CI/CD Pipeline</h3>
                        <div className="text-sm opacity-80">
                            Code is hosted on <strong>GitHub</strong>. Every push to the <code>main</code> branch triggers a deployment on <strong>Vercel</strong>. Vercel handles the build process, optimizes images, and deploys the Serverless Functions (API routes) to edge locations globally.
                        </div>
                    </div>
                </div>
            </section>

            <footer className="pt-10 border-t border-base-content/10 text-center">
                <Link href="/" className="btn btn-primary btn-wide rounded-full">
                    Back to Home
                </Link>
            </footer>
        </div>
    );
}

function ApiCard({ title, desc, color, icon }: { title: string, desc: string, color: string, icon?: any }) {
    return (
        <div className="card bg-base-200 border border-base-content/5 hover:border-base-content/20 transition-all">
            <div className="card-body p-5">
                <div className={`badge ${color} badge-sm mb-2 gap-2`}>
                    {icon && <FontAwesomeIcon icon={icon} className="text-xs" />}
                    API
                </div>
                <h3 className="font-bold text-lg">{title}</h3>
                <p className="text-xs opacity-70 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}

function TechBadge({ name }: { name: string }) {
    return (
        <span className="badge badge-lg badge-outline border-base-content/30 bg-base-400">
            {name}
        </span>
    )
}