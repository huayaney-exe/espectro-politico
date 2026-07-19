import Link from "next/link";
import Chat from "@/components/Chat";

export default function TestPage() {
  return (
    <main className="min-h-screen px-6 py-8">
      <div className="max-w-2xl mx-auto mb-6 flex items-center justify-between">
        <Link href="/" className="font-display text-lg spectrum-text">
          Espectro
        </Link>
        <span className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
          Tus respuestas no se guardan en ningún servidor
        </span>
      </div>
      <Chat />
    </main>
  );
}
