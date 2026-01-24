import { query } from "@/lib/db";

export async function GET() {
  try {
    const rows = await query("SELECT * FROM admin");
    return Response.json({ ok: true, rows });
  } catch (error) {
    console.error("DB test error", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
}
