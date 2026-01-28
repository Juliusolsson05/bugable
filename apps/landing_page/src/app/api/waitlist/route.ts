import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

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

    const supabase = supabaseServer();

    const { error } = await supabase.from("waitlist").insert([{ email, source }]);

    if (error) {
      // Unique violation → treat as success or show friendly message
      if (error.code === "23505") {
        return NextResponse.json({ ok: true, already: true });
      }

      return NextResponse.json(
        { ok: false, error: "Failed to save email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Something went wrong." },
      { status: 500 }
    );
  }
}
