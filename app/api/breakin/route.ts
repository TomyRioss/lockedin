import { sql } from "@/lib/db";

export async function POST() {
  const [session] = await sql`select id from sessions where status = 'active'`;
  if (!session) {
    return Response.json({ error: "no active session" }, { status: 409 });
  }
  const [existingBreak] = await sql`select id from breaks where session_id = ${session.id} and status = 'active'`;
  if (existingBreak) {
    return Response.json({ error: "break already active" }, { status: 409 });
  }
  const [brk] = await sql`
    insert into breaks (session_id)
    values (${session.id})
    returning id, session_id, break_in, break_out, status
  `;
  return Response.json(brk);
}
