import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex items-center justify-center gap-4 py-6 text-white font-mono text-sm">
      <span className="text-zinc-600">lockin</span>
      <span className="h-4 w-px bg-zinc-700" />
      <Link href="/" className="hover:text-zinc-400">
        reloj
      </Link>
      <span className="h-4 w-px bg-zinc-700" />
      <Link href="/metrics" className="hover:text-zinc-400">
        sesiones
      </Link>
    </nav>
  );
}
