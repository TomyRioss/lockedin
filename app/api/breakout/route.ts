import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const { reason } = await req.json().catch(() => ({ reason: null }));
  const [brk] = await sql`select id from breaks where status = 'active'`;
  if (!brk) {
    return Response.json({ error: "no active break" }, { status: 409 });
  }
  const [closed] = await sql`
    update breaks
    set break_out = now(), status = 'closed', reason = ${reason ?? null}
    where id = ${brk.id}
    returning id, session_id, break_in, break_out, status, reason
  `;
  return Response.json(closed);
}
