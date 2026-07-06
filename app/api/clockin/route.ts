import { sql } from "@/lib/db";
import { getOrCreateUserId } from "@/lib/auth";

export async function POST() {
  const userId = await getOrCreateUserId();
  const [active] = await sql`select id from sessions where status = 'active' and user_id = ${userId}`;
  if (active) {
    return Response.json({ error: "session already active" }, { status: 409 });
  }
  const [session] = await sql`
    insert into sessions (user_id)
    values (${userId})
    returning id, clock_in, clock_out, status
  `;
  return Response.json(session);
}
