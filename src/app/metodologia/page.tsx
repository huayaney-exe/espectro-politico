import Link from "next/link";
import { AXES } from "@/lib/axes";
import { DIMENSIONS } from "@/lib/identity";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-display text-2xl mb-3">{title}</h2>
      <div className="flex flex-col gap-3 text-[15px] leading-relaxed" style={{ color: "var(--color-ink-soft)" }}>
        {children}
      </div>
    </section>
  );
}

export default function Metodologia() {
  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link href="/" className="font-display text-lg spectrum-text">
          Espectro
        </Link>
        <div className="spectrum-bar h-1.5 w-24 rounded-full my-6" />
        <h1 className="font-display text-4xl mb-8">Metodología</h1>

        <Section title="De dónde viene el binario (y por qué no basta)">
          <p>
            "Izquierda" y "derecha" nacieron por un accidente de arquitectura: en la
            Asamblea Nacional Francesa de 1789, los partidarios del rey se sentaron a la
            derecha del presidente y los de la revolución a la izquierda. Era una
            geografía de asientos sobre una sola pregunta (¿monarquía o no?), no una
            teoría de la política. Doscientos años después seguimos comprimiendo
            decenas de preguntas distintas —economía, cultura, autoridad, comunidad,
            soberanía— en ese mismo eje de una dimensión. La etiqueta sobrevivió; los
            conceptos originales que la justificaban, no.
          </p>
        </Section>

        <Section title="Las 5 dimensiones de identidad (y sus marcos)">
          <p>
            Tu perfil se expresa en cinco dimensiones. Ninguna es inventada: cada una
            está anclada en un marco reconocido de la ciencia política.
          </p>
          <div className="flex flex-col gap-3">
            {DIMENSIONS.map((d) => (
              <div key={d.id} className="border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
                <span className="font-display" style={{ color: "var(--color-ink)" }}>
                  {d.name}
                </span>
                <div className="text-xs mt-0.5" style={{ color: "var(--color-ink-faint)" }}>
                  0 = {d.poleLow} · 10 = {d.poleHigh}
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--color-ink-soft)" }}>
                  Marco: {d.source}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm">
            El Political Compass <strong>no</strong> se usa como fuente: su algoritmo
            no está publicado ni validado. Sirve como referencia visual popular, no
            como base metodológica.
          </p>
        </Section>

        <Section title="El instrumento: 12 ejes calibrados para LATAM">
          <p>
            Las 5 dimensiones se miden con 12 ejes concretos (0–10) diseñados para el
            contexto latinoamericano — soberanía productiva, extractivismo, memoria
            histórica y otros que los tests globales no capturan. Cada eje alimenta
            exactamente una dimensión (sin doble conteo).
          </p>
          <div className="flex flex-col gap-2">
            {AXES.map((ax) => (
              <div key={ax.id} className="border-b pb-2" style={{ borderColor: "var(--color-border)" }}>
                <span className="font-display" style={{ color: "var(--color-ink)" }}>
                  {ax.id} · {ax.name}
                </span>
                <div className="text-xs" style={{ color: "var(--color-ink-faint)" }}>
                  0 = {ax.poleLow} · 10 = {ax.poleHigh}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Cómo se puntúa (conversación, no encuesta)">
          <p>
            En vez de una batería de preguntas cerradas, conversas: respondes con tus
            palabras y la entrevista se adapta — profundiza donde hay incertidumbre,
            re-pregunta cuando tu postura no quedó clara y para cuando tiene señal
            suficiente (o al llegar al tope de preguntas). Un modelo interpreta tus
            respuestas y asigna, para cada eje, un puntaje 0–10 y una confianza. El
            componente que puntúa está deliberadamente <strong>separado</strong> del
            que conversa, para reducir el sesgo de complacencia del modelo, y solo
            puntúa lo que realmente dijiste (sin evidencia → confianza baja).
          </p>
          <p>
            La versión local corre con un <strong>scorer heurístico determinista</strong>{" "}
            (sin IA): compara tu respuesta con las señales de cada pregunta. Es un
            piso funcional. Con una API key conectada, un LLM hace la lectura fina.
          </p>
        </Section>

        <Section title="El arquetipo y la narrativa">
          <p>
            El arquetipo se compone sobre el plano económico × cultural (el espacio
            bidimensional estándar de la política comparada) más modificadores cuando
            autoridad, comunidad o soberanía están marcadas. Los nombres usan
            vocabulario estándar de familias políticas (von Beyme), no etiquetas
            inventadas. La narrativa se deriva de tus dimensiones más marcadas y de
            las tensiones internas entre ellas — nunca comparándote con un político
            concreto.
          </p>
        </Section>

        <Section title="Privacidad">
          <p>
            No guardamos tus respuestas en ningún servidor propio: la entrevista es
            stateless y tu perfil se codifica en el enlace (en el hash de la URL).
            Si conectas un modelo de IA, tus respuestas se envían al proveedor del
            modelo para ser puntuadas — revisa su política de datos.
          </p>
        </Section>

        <Section title="Límites honestos">
          <p>
            <strong>Esta es una herramienta educativa e ilustrativa, no un
            instrumento psicométrico validado.</strong> No mide personalidad ni
            predice conducta; las preguntas pueden tener sesgos de redacción que
            iremos corrigiendo con pilotaje, y el puntaje de un LLM no ha pasado por
            validación formal. Úsala como espejo para pensar, no como veredicto.
          </p>
        </Section>

        <div className="py-8">
          <Link href="/test" className="btn btn-primary">
            Encontrar mi espectro →
          </Link>
        </div>
      </div>
    </main>
  );
}
