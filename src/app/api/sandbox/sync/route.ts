import { NextResponse } from "next/server";
import { syncSandboxRepo } from "@/lib/server/github-sync";

// Force Node.js runtime because we might use file system or complex logic
export const runtime = "nodejs";

// GitHub calls this method (POST) when a commit is pushed
export async function POST() {
    try {
        console.log("[Webhook] Received sync trigger from GitHub");
        
        // 1. (Optional) Verify security token if you set a Secret in GitHub
        // const signature = req.headers.get("x-hub-signature-256");
        // if (!verifySignature(signature, process.env.GITHUB_WEBHOOK_SECRET)) { ... }

        // 2. Run the sync logic (Checks SHA, fetches files, updates DB)
        const result = await syncSandboxRepo();

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("[Sync Error]", error);
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 500 }
        );
    }
}

// Keep GET for manual testing via browser (http://localhost:3000/api/sandbox/sync)
export async function GET() {
    try {
        const result = await syncSandboxRepo();
        return NextResponse.json(result);
    } catch (error: any) {
         return NextResponse.json({ error: error.message }, { status: 500 });
    }
}