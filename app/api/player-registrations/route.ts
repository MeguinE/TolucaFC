import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";


export async function POST(req: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Faltan variables del servidor (URL o SERVICE_ROLE_KEY)" },
        { status: 500 }
      );
    }

    const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

    const body = await req.json();
    const { full_name, birth_date, phone, venue_id, category_id } = body;

    if (!full_name || !birth_date || !phone || !venue_id || !category_id) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }

    const { error } = await supabase.from("player_registrations").insert({
      full_name,
      birth_date,
      phone,
      venue_id,
      category_id,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error" },
      { status: 500 }
    );
  }
}
