"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* ✅ 100% viewport SIEMPRE */}
      <div className="relative h-screen min-h-[700px] w-full">
        {/* Fondo */}
        <Image
          src="/img/toluca-campeon.jpg"
          alt="Toluca Altas Montañas"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="object-cover"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-black/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_30%,rgba(213,0,50,.35),transparent_60%)]" />

        {/* Contenido */}
        <div className="relative z-10 h-full w-full">
          <div className="mx-auto h-full w-full max-w-7xl px-4 sm:px-6 md:px-10 flex items-center justify-center">
            <div className="w-full max-w-5xl">
              {/* Card */}
              <div className="w-full rounded-3xl border border-white/30 bg-white/10 backdrop-blur-xl shadow-[0_30px_90px_rgba(0,0,0,.45)] overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6 md:gap-10 p-5 sm:p-6 md:p-10">
                  {/* Logo */}
                  <div className="flex flex-col items-center md:items-start gap-4">
                    <Image
                      src="/img/toluca-logo.png"
                      alt="Toluca Logo"
                      width={220}
                      height={220}
                      className={cn(
                        "h-auto drop-shadow-[0_0_12px_rgba(255,0,0,0.75)]",
                        "w-28 sm:w-36 md:w-56"
                      )}
                      priority
                    />

                    <span className="md:hidden inline-flex items-center rounded-full border border-[#D50032]/30 bg-[#D50032]/15 px-3 py-1 text-[11px] font-extrabold tracking-widest text-white">
                      ACADEMIA / FILIAL
                    </span>
                  </div>

                  {/* Texto */}
                  <div className="text-white text-center md:text-left">
                    <div className="hidden md:block">
                      <span className="inline-flex items-center rounded-full border border-[#D50032]/30 bg-[#D50032]/15 px-3 py-1 text-[11px] font-extrabold tracking-widest text-white">
                        ACADEMIA / FILIAL
                      </span>
                    </div>

                    <h1 className="mt-4 text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                      <span className="drop-shadow-[0_10px_30px_rgba(0,0,0,.55)]">
                        Toluca{" "}
                      </span>
                      <span className="text-[#FF2A4D] drop-shadow-[0_10px_30px_rgba(0,0,0,.55)]">
                        Altas Montañas
                      </span>
                    </h1>

                    <p className="mt-4 mx-auto md:mx-0 max-w-2xl text-sm sm:text-base md:text-lg text-white/85 leading-relaxed">
                      Donde la pasión se convierte en propósito. Formamos
                      personas, impulsamos talentos y construimos mentalidad
                      ganadora para competir con disciplina dentro y fuera de la
                      cancha.
                    </p>

                    <p className="mt-5 text-xs sm:text-sm md:text-base font-extrabold tracking-[0.18em] sm:tracking-[0.22em] text-white">
                      ¡ÚNETE HOY A TOLUCA ALTAS MONTAÑAS!
                    </p>

                    {/* Botones */}
                    <div className="mt-7 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
                      <Link
                        href="#contacto"
                        className={cn(
                          "h-11 px-6 rounded-xl inline-flex items-center justify-center",
                          "bg-[#D50032] hover:bg-[#B8002A] text-white font-extrabold",
                          "shadow-[0_18px_40px_rgba(213,0,50,.25)] transition"
                        )}
                      >
                        <Image
                          src="/img/user-star.svg"
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 mr-2"
                        />
                        Contáctanos
                      </Link>

                      <Link
                        href="#about"
                        className={cn(
                          "h-11 px-6 rounded-xl inline-flex items-center justify-center",
                          "bg-white/10 hover:bg-white/15 text-white font-extrabold",
                          "border border-white/20 backdrop-blur-sm transition"
                        )}
                      >
                        <Image
                          src="/img/user-round.svg"
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 mr-2"
                        />
                        Conócenos
                      </Link>

                      <Link
                        href="/auth/login"
                        className={cn(
                          "h-11 px-6 rounded-xl inline-flex items-center justify-center",
                          "bg-black/35 hover:bg-black/45 text-white font-extrabold",
                          "border border-white/10 transition"
                        )}
                      >
                        <Image
                          src="/img/lock-keyhole.svg"
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 mr-2"
                        />
                        Admin
                      </Link>
                    </div>

                    <p className="mt-6 text-[11px] sm:text-xs md:text-sm text-white/70">
                      Entrenamientos serios • Visorías • Desarrollo integral •
                      Identidad y respeto
                    </p>
                  </div>
                </div>
              </div>

              {/* Nota inferior */}
              <p className="mt-5 text-center md:text-left text-[11px] sm:text-xs text-white/70">
                Representamos a la región con orgullo. Disciplina hoy, victoria
                mañana.
              </p>
            </div>
          </div>
        </div>

        {/* ✅ (Opcional) Fade abajo para que el siguiente section no “corte” feo */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-black/40" />
      </div>
    </section>
  );
}
