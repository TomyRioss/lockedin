import { sql } from "@/lib/db";
import { getOrCreateUserId } from "@/lib/auth";

export async function GET() {
  const userId = await getOrCreateUserId();
  const [session] = await sql`
    select id, clock_in, extract(epoch from now() - clock_in) as elapsed
    from sessions where status = 'active' and user_id = ${userId}
  `;
  if (!session) {
    return Response.json({ session: null, breaks: [] });
  }
  const breaks = await sql`
    select id, break_in, break_out, status, reason,
      extract(epoch from coalesce(break_out, now()) - break_in) as elapsed
    from breaks where session_id = ${session.id}
    order by break_in asc
  `;
  return Response.json({ session, breaks });
}
