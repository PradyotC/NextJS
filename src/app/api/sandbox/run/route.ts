import { NextResponse } from "next/server";

// Define the shape of the request we expect from our frontend
type ExecuteRequest = {
  language: string;
  code: string;
};

type PistonRuntime = {
  language: string;
  version: string;
  aliases: string[];
};

export async function POST(req: Request) {
  try {
    const { language, code } = (await req.json()) as ExecuteRequest;

    // 1. Map UI languages to Piston language names
    const langMap: Record<string, string> = {
      python: "python",
      go: "go",
      javascript: "javascript",
      typescript: "typescript",
    };

    const pistonLang = langMap[language];
    if (!pistonLang) {
      return NextResponse.json(
        { output: "Unsupported language." }, 
        { status: 400 }
      );
    }

    // 2. Dynamically fetch available runtimes to get the correct version
    // This ensures we always use the version installed on the server (e.g. 1.22.0)
    const runtimesRes = await fetch("https://emkc.org/api/v2/piston/runtimes");
    const runtimes: PistonRuntime[] = await runtimesRes.json();

    const runtime = runtimes.find((r) => r.language === pistonLang);

    if (!runtime) {
      return NextResponse.json(
        { output: `Runtime for ${language} is currently unavailable.` }, 
        { status: 503 }
      );
    }

    // 3. Execute using the dynamically found version
    const response = await fetch("https://emkc.org/api/v2/piston/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: runtime.language,
        version: runtime.version, // Use the version we just found
        files: [
          {
            content: code,
          },
        ],
      }),
    });

    const data = await response.json();

    // 4. Handle Response
    if (data.run) {
      const output = data.run.stdout + data.run.stderr;
      return NextResponse.json({ 
        output: output || "No output returned.", 
        isError: !!data.run.stderr 
      });
    }

    return NextResponse.json(
      { output: data.message || "Execution failed via Piston." }, 
      { status: 400 }
    );

  } catch (error) {
    console.error("Sandbox Execution Error:", error);
    return NextResponse.json(
      { output: "Internal Server Error during execution." }, 
      { status: 500 }
    );
  }
}