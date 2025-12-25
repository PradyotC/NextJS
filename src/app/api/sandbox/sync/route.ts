import { NextResponse } from "next/server";
import { syncSandboxRepo } from "@/lib/server/github-sync";
import crypto from "crypto";

export const runtime = "nodejs";

// Helper: Verify the signature from GitHub
async function verifySignature(req: Request): Promise<boolean> {
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    
    // If no secret is set, we cannot verify (Open / Insecure)
    if (!secret) {
        console.warn("⚠️ GITHUB_WEBHOOK_SECRET is not set. Skipping verification.");
        return true; 
    }

    const signature = req.headers.get("x-hub-signature-256");
    if (!signature) return false;

    // We must read the raw body to hash it
    const body = await req.text();
    
    // Create the expected signature
    const hmac = crypto.createHmac("sha256", secret);
    const digest = Buffer.from("sha256=" + hmac.update(body).digest("hex"), "utf8");
    const checksum = Buffer.from(signature, "utf8");

    // Constant-time comparison to prevent timing attacks
    return (
        checksum.length === digest.length &&
        crypto.timingSafeEqual(digest, checksum)
    );
}

export async function POST(req: Request) {
    try {
        console.log("[Webhook] Received sync trigger");

        // 1. Verify Security Token
        const isValid = await verifySignature(req);
        if (!isValid) {
            console.error("[Webhook] ⛔ Signature verification failed");
            return NextResponse.json(
                { status: "error", message: "Invalid signature" },
                { status: 401 }
            );
        }

        // 2. Run the sync logic
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

// Keep GET open for manual testing (or add a separate query param secret if needed)
export async function GET() {
    try {
        const result = await syncSandboxRepo();
        return NextResponse.json(result);
    } catch (error: any) {
         return NextResponse.json({ error: error.message }, { status: 500 });
    }
}