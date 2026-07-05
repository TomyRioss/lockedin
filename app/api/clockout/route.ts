import { sql } from "@/lib/db";

export async function POST() {
  const [session] = await sql`select id, clock_in from sessions where status = 'active'`;
  if (!session) {
    return Response.json({ error: "no active session" }, { status: 409 });
  }
  const [activeBreak] = await sql`select id from breaks where session_id = ${session.id} and status = 'active'`;
  if (activeBreak) {
    return Response.json({ error: "break active, break out first" }, { status: 409 });
  }

  const [closed] = await sql`
    update sessions
    set clock_out = now(), status = 'closed'
    where id = ${session.id}
    returning id, clock_in, clock_out, status
  `;

  const breaks = await sql`select break_in, break_out from breaks where session_id = ${session.id}`;
  const breakSeconds = breaks.reduce((acc, b) => {
    return acc + (new Date(b.break_out).getTime() - new Date(b.break_in).getTime()) / 1000;
  }, 0);
  const totalSeconds = (new Date(closed.clock_out).getTime() - new Date(closed.clock_in).getTime()) / 1000;
  const workSeconds = totalSeconds - breakSeconds;

  return Response.json({ ...closed, breakSeconds, workSeconds });
}
