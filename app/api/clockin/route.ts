import { sql } from "@/lib/db";

export async function POST() {
  const [active] = await sql`select id from sessions where status = 'active'`;
  if (active) {
    return Response.json({ error: "session already active" }, { status: 409 });
  }
  const [session] = await sql`
    insert into sessions default values
    returning id, clock_in, clock_out, status
  `;
  return Response.json(session);
}
