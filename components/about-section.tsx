import Image from "next/image";
import { cn } from "@/lib/utils";

export default function AboutSection({ className }: { className?: string }) {
  const about = {
    title: "Toluca Altas Montañas",
    subtitle: "Formación, identidad y mentalidad ganadora",
    description:
      "Somos una academia enfocada en el desarrollo integral: disciplina, respeto, trabajo en equipo y fútbol competitivo. Entrenamos para crecer dentro y fuera de la cancha, representando a nuestra región con orgullo.",
    mission:
      "Formar futbolistas y personas con disciplina, valores y mentalidad competitiva, impulsando el talento local con entrenamiento profesional y acompañamiento integral.",
    vision:
      "Ser una academia referente en la región por su metodología, resultados deportivos y formación humana, proyectando talento a niveles superiores.",
    values: [
      "Disciplina",
      "Respeto",
      "Trabajo en equipo",
      "Compromiso",
      "Humildad",
      "Identidad",
    ],
    background:
      "Nacimos con el objetivo de brindar a niños y jóvenes un espacio serio de formación deportiva. Creemos en el esfuerzo diario y en la pasión que se construye con trabajo.",
  };

  return (
    <section
      id="about"
      className={cn(
        "relative w-full overflow-hidden py-20 sm:py-24 text-white",
        className
      )}
    >
      {/* ✅ FONDO ROJO PRO (no plano) */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#7A0018_0%,#B00022_35%,#D50032_70%,#7A0018_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_15%,rgba(255,255,255,.14),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_85%,rgba(0,0,0,.25),transparent_60%)]" />
      <div className="absolute inset-0 bg-black/25" />

      {/* ✅ Marca de agua (logo grande) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <Image
          src="/img/toluca-logo.png"
          alt="Marca de agua Toluca"
          width={900}
          height={900}
          className="opacity-[0.08] w-[86%] max-w-[760px]"
        />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1 text-[11px] font-extrabold tracking-widest text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-green-400" />
            NUESTRA IDENTIDAD
          </span>

          {/* ✅ Logo visible arriba (no solo watermark) */}
          <div className="mt-6 flex justify-center">
            <Image
              src="/img/toluca-logo.png"
              alt="Toluca Altas Montañas"
              width={140}
              height={140}
              className="h-[92px] w-[92px] sm:h-[110px] sm:w-[110px] object-contain drop-shadow-[0_0_18px_rgba(255,255,255,.25)]"
              priority={false}
            />
          </div>

          <h2 className="mt-6 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-[0_12px_30px_rgba(0,0,0,.35)]">
            <span className="text-white">Toluca </span>
            <span className="text-white">
              <span className="text-black/90 bg-white/20 px-2 py-1 rounded-lg">
                Altas Montañas
              </span>
            </span>
          </h2>

          <h3 className="mt-3 text-base sm:text-lg md:text-xl font-semibold text-white/90">
            {about.subtitle}
          </h3>

          <p className="mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-white/80">
            {about.description}
          </p>
        </div>

        {/* ✅ Cards GLASS (transparentes) */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Card base */}
          <GlassCard title="Misión" accent="red">
            {about.mission}
          </GlassCard>

          <GlassCard title="Visión" accent="white">
            {about.vision}
          </GlassCard>

          <GlassCard title="Valores" accent="red">
            <ul className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {about.values.map((v) => (
                <li
                  key={v}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2"
                >
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="font-semibold text-white/90">{v}</span>
                </li>
              ))}
            </ul>
          </GlassCard>

          <GlassCard title="Antecedentes" accent="white">
            {about.background}
          </GlassCard>
        </div>

        {/* Separador */}
        <div className="mt-12 flex items-center justify-center">
          <div className="h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-white/3 to-transparent" />
        </div>

        <p className="mt-6 text-center text-xs sm:text-sm text-white/85">
          Identidad, disciplina y respeto: la base para competir en grande.
        </p>
      </div>
    </section>
  );
}

function GlassCard({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "red" | "white";
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/20 bg-black/30 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,.28)] overflow-hidden">
      <div className="p-7 sm:p-8">
        <h4
          className={cn(
            "text-xl sm:text-2xl font-extrabold",
            accent === "red" ? "text-white" : "text-white"
          )}
        >
          {title}
        </h4>

        {title !== "Valores" ? (
          <p className="mt-3 text-white/80 leading-relaxed">{children}</p>
        ) : (
          <div>{children}</div>
        )}
      </div>
    </div>
  );
}
