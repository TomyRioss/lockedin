import { sql } from "@/lib/db";
import { getOrCreateUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const userId = await getOrCreateUserId();
  const { reason } = await req.json().catch(() => ({ reason: null }));
  const [brk] = await sql`
    select b.id from breaks b
    join sessions s on s.id = b.session_id
    where b.status = 'active' and s.user_id = ${userId}
  `;
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
