// src/lib/server/github-sync.ts
import { prisma } from "./prisma";
import { getRawSnippets, Snippet } from "./github-fetcher";

const BASE_URL = process.env.GITHUB_REPO_BASEURL;
const GITHUB_TOKEN = process.env.GITHUB_ACCESS_TOKEN;

// Helper: Generate a stable, unique slug
function generateSlug(lang: string, navTitle: string) {
    const safeTitle = navTitle.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    return `${lang}-${safeTitle}`; // e.g. "go-worker-pool"
}

// 1. Fetch Latest Commit SHA from GitHub
async function getRemoteHeadSha() {
    const url = `${BASE_URL}/commits/main`;
    const res = await fetch(url, {
        headers: { 
            Authorization: `Bearer ${GITHUB_TOKEN}`,
            Accept: "application/vnd.github.sha" // Request raw SHA
        },
        next: { revalidate: 0 } 
    });
    
    if (!res.ok) throw new Error(`Failed to fetch commit SHA: ${res.status}`);
    return await res.text();
}

// 2. The Main Sync Function
export async function syncSandboxRepo() {
    console.log("[Sync] Checking for updates...");
    
    // A. Check Remote SHA
    let remoteSha = "";
    try {
        remoteSha = await getRemoteHeadSha();
    } catch (e) {
        console.error("Skipping sync check, API failed:", e);
        return { status: "error", message: "Could not fetch remote SHA" };
    }

    // B. Check Local SHA in DB
    const localState = await prisma.systemState.findUnique({
        where: { key: "sandbox_repo_sha"}
    });

    if (localState && localState.value === remoteSha) {
        console.log("[Sync] System up to date. Skipping fetch.");
        return { status: "skipped", message: "Already on latest commit" };
    }

    console.log(`[Sync] Update detected! Local: ${localState?.value?.slice(0,7)} -> Remote: ${remoteSha.slice(0,7)}`);

    // C. Fetch Content (Only if changed)
    const snippets: Snippet[] = await getRawSnippets();
    
    if (snippets.length === 0) {
        return { status: "error", message: "No snippets found in repo" };
    }

    // D. Database Transaction (Atomic Update)
    await prisma.$transaction(async (tx) => {
        // Optional: Clear old snippets if you want to ensure deletions propagate
        // await tx.codeSnippet.deleteMany({}); 

        for (const s of snippets) {
            const slug = generateSlug(s.language, s.navTitle);
            
            await tx.codeSnippet.upsert({
                where: { slug },
                update: {
                    navTitle: s.navTitle,
                    title: s.title,
                    language: s.language,
                    description: s.description,
                    code: s.code,
                    commitSha: remoteSha,
                    updatedAt: new Date(),
                },
                create: {
                    slug,
                    navTitle: s.navTitle,
                    title: s.title,
                    language: s.language,
                    description: s.description,
                    code: s.code,
                    commitSha: remoteSha,
                }
            });
        }

        // Update the Sync State
        await tx.systemState.upsert({
            where: { key: "sandbox_repo_sha" },
            update: { value: remoteSha },
            create: { key: "sandbox_repo_sha", value: remoteSha }
        });
    });

    console.log(`[Sync] Successfully synced ${snippets.length} snippets.`);
    return { status: "updated", count: snippets.length };
}