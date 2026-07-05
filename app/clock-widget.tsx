"use client";

import { useEffect, useRef, useState } from "react";

type BreakRow = {
  id: number;
  break_in: string;
  break_out: string | null;
  status: string;
  reason: string | null;
  elapsed: number;
};

type Status = {
  session: { id: number; clock_in: string; elapsed: number } | null;
  breaks: BreakRow[];
};

function fmt(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}

export default function ClockWidget() {
  const [status, setStatus] = useState<Status | null>(null);
  const [tick, setTick] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [reasonInput, setReasonInput] = useState("");
  const fetchedAt = useRef(0);

  async function refresh() {
    const res = await fetch("/api/status");
    const data = await res.json();
    fetchedAt.current = Date.now();
    setStatus(data);
  }

  useEffect(() => {
    refresh();
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  async function call(path: string, body?: unknown) {
    const res = await fetch(path, {
      method: "POST",
      ...(body ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "error");
      return;
    }
    if (path === "/api/clockout") {
      setLastResult(
        `work: ${fmt(data.workSeconds)} — break: ${fmt(data.breakSeconds)}`
      );
    }
    await refresh();
  }

  async function submitBreakOut() {
    await call("/api/breakout", { reason: reasonInput.trim() || null });
    setReasonInput("");
    setShowReasonModal(false);
  }

  if (!status) return null;

  const clockedIn = !!status.session;
  const activeBreak = status.breaks.find((b) => b.status === "active") ?? null;
  const onBreak = !!activeBreak;
  const sinceFetch = (Date.now() - fetchedAt.current) / 1000;

  const mainSeconds = clockedIn ? Number(status.session!.elapsed) + sinceFetch : 0;
  const breakSeconds = onBreak ? Number(activeBreak!.elapsed) + sinceFetch : 0;
  void tick;

  return (
    <div className="flex items-center gap-16 text-white">
      <div className="flex flex-col items-center gap-10">
        <div className="text-9xl font-mono tabular-nums">{fmt(mainSeconds)}</div>

        {onBreak && (
          <div className="text-2xl font-mono tabular-nums text-zinc-400">
            break {fmt(breakSeconds)}
          </div>
        )}

        <div className="flex gap-4">
          {!clockedIn && (
            <button
              onClick={() => call("/api/clockin")}
              className="rounded-full border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors"
            >
              lock in
            </button>
          )}

          {clockedIn && !onBreak && (
            <>
              <button
                onClick={() => call("/api/breakin")}
                className="rounded-full border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors"
              >
                break in
              </button>
              <button
                onClick={() => call("/api/clockout")}
                className="rounded-full border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors"
              >
                lock out
              </button>
            </>
          )}

          {clockedIn && onBreak && (
            <button
              onClick={() => setShowReasonModal(true)}
              className="rounded-full border border-white px-6 py-3 hover:bg-white hover:text-black transition-colors"
            >
              break out
            </button>
          )}
        </div>

        {lastResult && (
          <div className="text-sm text-zinc-400">{lastResult}</div>
        )}
      </div>

      {clockedIn && status.breaks.length > 0 && (
        <div className="flex flex-col gap-4 border-l border-zinc-800 pl-10">
          <div className="text-sm text-zinc-500 mb-1">breaks</div>
          {status.breaks.map((b, i) => {
            const seconds = b.status === "active" ? Number(b.elapsed) + sinceFetch : Number(b.elapsed);
            return (
              <div key={b.id} className="font-mono flex flex-col gap-1">
                <div className="flex gap-4 text-2xl">
                  <span className="text-zinc-600">{i + 1}</span>
                  <span className={b.status === "active" ? "text-white" : "text-zinc-300"}>
                    {fmt(seconds)}
                  </span>
                </div>
                {b.reason && (
                  <div className="text-sm text-zinc-500 pl-9 max-w-xs">{b.reason}</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showReasonModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-8 flex flex-col gap-4 w-full max-w-sm">
            <h2 className="text-lg">What was so important?</h2>
            <textarea
              autoFocus
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              className="bg-black border border-zinc-700 rounded-lg p-3 text-white resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowReasonModal(false);
                  setReasonInput("");
                }}
                className="px-4 py-2 text-zinc-400 hover:text-white"
              >
                cancel
              </button>
              <button
                onClick={submitBreakOut}
                className="rounded-full border border-white px-6 py-2 hover:bg-white hover:text-black transition-colors"
              >
                done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
