import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Espectro — no eres un punto, eres un vector",
  description:
    "Encuentra tu posición política real en 12 dimensiones a través de una conversación. Rompe el binario izquierda/derecha. Calibrado para América Latina.",
  openGraph: {
    title: "Espectro — no eres un punto, eres un vector",
    description:
      "Tu posición política en 12 dimensiones, no en una etiqueta binaria.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
