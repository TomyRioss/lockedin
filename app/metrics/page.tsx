import { sql } from "@/lib/db";
import { getOrCreateUserId } from "@/lib/auth";
import Nav from "../nav";

export const dynamic = "force-dynamic";

function fmt(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export default async function MetricsPage() {
  const userId = await getOrCreateUserId();
  const sessions = await sql`
    select id, clock_in, clock_out
    from sessions
    where status = 'closed' and user_id = ${userId}
    order by clock_in desc
  `;

  const breaks = await sql`
    select b.session_id, b.break_in, b.break_out from breaks b
    join sessions s on s.id = b.session_id
    where b.status = 'closed' and s.user_id = ${userId}
  `;

  const rows = sessions.map((s) => {
    const sessionBreaks = breaks.filter((b) => b.session_id === s.id);
    const breakSeconds = sessionBreaks.reduce(
      (acc, b) =>
        acc + (new Date(b.break_out).getTime() - new Date(b.break_in).getTime()) / 1000,
      0
    );
    const totalSeconds = (new Date(s.clock_out).getTime() - new Date(s.clock_in).getTime()) / 1000;
    return {
      id: s.id,
      clockIn: new Date(s.clock_in).toLocaleString(),
      workSeconds: totalSeconds - breakSeconds,
      breakSeconds,
    };
  });

  return (
    <div className="flex flex-col flex-1 bg-black">
      <Nav />
      <div className="p-10 text-white">
      <h1 className="text-2xl mb-6">sessions</h1>
      <table className="w-full text-left font-mono text-sm">
        <thead>
          <tr className="border-b border-zinc-700">
            <th className="py-2">clock in</th>
            <th className="py-2">work</th>
            <th className="py-2">break</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-zinc-800">
              <td className="py-2">{r.clockIn}</td>
              <td className="py-2">{fmt(r.workSeconds)}</td>
              <td className="py-2">{fmt(r.breakSeconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
