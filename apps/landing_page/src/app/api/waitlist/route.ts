import { NextResponse } from "next/server";
import { prisma } from "@bugable/db";

export const runtime = "nodejs";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const source =
      typeof body?.source === "string" ? body.source.trim() : "landing";

    if (!email || email.length > 254 || !isValidEmail(email)) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid email." },
        { status: 400 }
      );
    }

    await prisma.waitlistEntry.create({
      data: { email, source },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Unique constraint violation - email already exists
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return NextResponse.json({ ok: true, already: true });
    }

    console.error("Waitlist error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to save email." },
      { status: 500 }
    );
  }
}
