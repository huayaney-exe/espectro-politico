import Link from "next/link";
import { AXES } from "@/lib/axes";
import { NON_REPRESENTATION_THETA } from "@/lib/distance";

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
            decenas de preguntas distintas —economía, cultura, soberanía, territorio— en
            ese mismo eje de una dimensión. La etiqueta sobrevivió; los conceptos
            originales que la justificaban, no.
          </p>
        </Section>

        <Section title="Por qué 12 dimensiones y no 2">
          <p>
            El eje único izquierda/derecha es una compresión con pérdida: colapsa
            posiciones económicas, culturales, de soberanía y de territorio en una
            sola etiqueta. En la realidad, una persona puede ser 9 en redistribución,
            3 en derechos culturales, 8 en soberanía productiva y 2 en seguridad. Sobre
            un eje eso se pierde. Sobre 12 ejes, emerge un vector único.
          </p>
        </Section>

        <Section title="Los 12 ejes">
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
            En vez de una batería de preguntas cerradas, respondes con tus palabras
            a preguntas sobre temas concretos. Un modelo interpreta tus respuestas y
            asigna, para cada eje, un puntaje 0–10 y una confianza. El componente que
            puntúa está deliberadamente <strong>separado</strong> del que conversa,
            para reducir el sesgo de complacencia del modelo, y solo puntúa lo que
            realmente dijiste (sin evidencia → confianza baja).
          </p>
          <p>
            La versión local corre con un <strong>scorer heurístico determinista</strong>{" "}
            (sin IA): compara tu respuesta con las señales de cada pregunta. Es un
            piso funcional. Con una API key conectada, un LLM hace la lectura fina.
          </p>
        </Section>

        <Section title="El mapa (proyección determinista)">
          <p>
            Tu vector de 12 ejes se proyecta a 2 dimensiones interpretables mediante
            una matriz fija (no entrenada en runtime): el eje horizontal es
            económico/estructural-soberanista y el vertical es cultural/libertades.
            Es solo una vista: la comparación real se hace sobre los 12 ejes.
          </p>
        </Section>

        <Section title="Distancia y frontera de no-representación">
          <p>
            La cercanía con cada político se calcula con una distancia euclidiana
            ponderada sobre los 12 ejes (bajamos el peso de ejes correlacionados para
            no sobrecontar). Si tu político más cercano queda a más de{" "}
            {Math.round(NON_REPRESENTATION_THETA * 100)}% de distancia normalizada,
            se declara que <strong>ninguno te representa</strong>, y se muestran los
            ejes donde ni el más cercano coincide contigo.
          </p>
        </Section>

        <Section title="Privacidad">
          <p>
            No guardamos nada en ningún servidor. Tu perfil se codifica en el enlace
            (en el hash de la URL), así que compartir un resultado no expone tu
            identidad ni queda registrado.
          </p>
        </Section>

        <Section title="Límites honestos">
          <p>
            Los perfiles de políticos son <strong>ilustrativos</strong>, derivados de
            posiciones públicas documentadas, y requieren validación experta. Las
            preguntas pueden tener sesgos de redacción que iremos corrigiendo con
            pilotaje. Esta herramienta no reemplaza el análisis ni la organización
            política: es un instrumento de auto-observación.
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
