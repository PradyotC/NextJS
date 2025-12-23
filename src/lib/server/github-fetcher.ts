// src/lib/server/github-fetcher.ts

const BASE_URL = process.env.GITHUB_REPO_BASEURL;
const TOKEN = process.env.GITHUB_ACCESS_TOKEN;

if (!BASE_URL) throw new Error("Missing GITHUB_REPO_BASEURL in .env.local");
if (!TOKEN) throw new Error("Missing GITHUB_ACCESS_TOKEN in .env.local");

const HEADERS = {
  Authorization: `Bearer ${TOKEN}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export type Snippet = {
  navTitle: string;
  title: string;
  language: string;
  description: string;
  code: string;
};

function parseMetadata(readmeContent: string, folderName: string) {
    const lines = readmeContent.split('\n');
    let title = folderName;
    const descriptionLines: string[] = [];
    let titleFound = false;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!titleFound && trimmed.startsWith('# ')) {
            title = trimmed.substring(2).trim();
            titleFound = true;
        } else {
            if (titleFound && descriptionLines.length === 0 && trimmed === '') continue;
            descriptionLines.push(line);
        }
    }
    
    return { 
        title, 
        description: descriptionLines.join('\n').trim() 
    };
}

// FIX 1: Remove "/contents/" append. Use URL exactly as provided.
async function fetchFileContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
    if (!res.ok) {
        console.error(`File fetch failed: ${url} ${res.status}`);
        return "";
    }
    return await res.text();
  } catch (err) {
    console.error("Error fetching file content:", err);
    return "";
  }
}

// FIX 2: Remove "/contents/" append. 
// GitHub API `dir.url` already includes it.
async function scanDirectory(url: string): Promise<Snippet[]> {
  const snippets: Snippet[] = [];
  console.log(`Scanning: ${url}`);

  const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
  
  if (!res.ok) {
    console.error(`[GithubFetch] Failed to list ${url}: ${res.status}`);
    return [];
  }

  const items = await res.json();
  if (!Array.isArray(items)) return [];

  const codeFile = items.find((f: any) => f.name === "main.go" || f.name === "main.py");
  const readmeFile = items.find((f: any) => f.name.toLowerCase() === "readme.md");

  if (codeFile) {
    // These URLs are already correct (raw download URL)
    const rawCode = await fetchFileContent(codeFile.download_url);
    const rawReadme = readmeFile ? await fetchFileContent(readmeFile.download_url) : "";

    const folderPath = codeFile.path.split("/").slice(0, -1).join("/");
    const navTitle = folderPath.split("/").pop() || "Untitled";
    const language = codeFile.name.endsWith(".go") ? "go" : "python";

    const { title, description } = parseMetadata(rawReadme, navTitle);

    snippets.push({
      navTitle,
      title,
      language,
      description,
      code: rawCode,
    });
  } else {
    const subDirs = items.filter((f: any) => f.type === "dir");
    for (const dir of subDirs) {
      // dir.url is "https://api.github.com/.../contents/subdir" 
      // So we pass it directly
      const subSnippets = await scanDirectory(dir.url);
      snippets.push(...subSnippets);
    }
  }

  return snippets;
}

export async function getRawSnippets() {
  // FIX 3: Append "/contents" ONLY here at the start
  return await scanDirectory(`${BASE_URL}/contents`);
}