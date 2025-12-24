import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden text-white">
      {/* Fondo */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#4a0010]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(213,0,50,.35),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_90%,rgba(213,0,50,.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-6 pt-16 pb-10">
        {/* Card glass */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_30px_90px_rgba(0,0,0,.45)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 p-6 sm:p-10">
            {/* Col 1: Marca */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/img/toluca-logo.png"
                  alt="Toluca Altas Montañas"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain"
                />
                <div className="leading-tight">
                  <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                    Toluca{" "}
                    <span className="text-[#FF2A4D]">Altas Montañas</span>
                  </h3>
                  <p className="text-xs text-white/70 font-semibold tracking-wide">
                    ACADEMIA / FILIAL
                  </p>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-white/75">
                Formación, disciplina y pasión por el deporte. Entrenamos para
                crecer dentro y fuera de la cancha.
              </p>

              <p className="text-xs text-white/60">
                Entrenamientos serios • Visorías • Desarrollo integral
              </p>
            </div>

            {/* Col 2: Navegación */}
            <div>
              <h4 className="text-sm font-extrabold tracking-[0.2em] text-white/90 uppercase">
                Secciones
              </h4>
              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li>
                  <Link
                    className="hover:text-[#FF2A4D] transition"
                    href="#about"
                  >
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#FF2A4D] transition"
                    href="#categorias"
                  >
                    Categorías
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#FF2A4D] transition"
                    href="#galeria"
                  >
                    Galería
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#FF2A4D] transition"
                    href="#contacto"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-white transition"
                    href="/auth/login"
                  >
                    Admin
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Contacto */}
            <div>
              <h4 className="text-sm font-extrabold tracking-[0.2em] text-white/90 uppercase">
                Contacto
              </h4>

              <ul className="mt-4 space-y-2 text-sm text-white/70">
                <li className="flex items-center gap-2">
                  <span className="opacity-80">
                    <Image
                      src="/img/map-pin.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 opacity-80"
                    />
                  </span>{" "}
                  Orizaba, Veracruz
                </li>
                <li className="flex items-center gap-2">
                  <span className="opacity-80">
                    <Image
                      src="/img/phone.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 opacity-80"
                    />
                  </span>{" "}
                  +52 272 143 4901
                </li>
                <li className="flex items-center gap-2">
                  <span className="opacity-80">
                    <Image
                      src="/img/mail.svg"
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 opacity-80"
                    />
                  </span>{" "}
                  maef22@hotmail.com
                </li>
              </ul>

              <p className="mt-4 text-xs text-white/55">
                Horario de atención: L–V 9:00–18:00
              </p>
            </div>

            {/* Col 4: Redes */}
            <div>
              <h4 className="text-sm font-extrabold tracking-[0.2em] text-white/90 uppercase">
                Síguenos
              </h4>

              <div className="mt-4 flex items-center gap-3">
                {/* Facebook */}
                <a
                  href="https://www.facebook.com/profile.php?id=100063583780613&locale=es_LA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-white/10 border border-white/15 hover:bg-[#D50032]/80 hover:border-[#D50032]/40 transition grid place-items-center"
                  aria-label="Facebook"
                >
                  <Image
                    src="/img/facebook.svg"
                    alt="Facebook Icon"
                    width={20}
                    height={20}
                    className="h-5 w-5 text-white/90"
                  />
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/academia_toluca_altas_mont/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-white/10 border border-white/15 hover:bg-[#D50032]/80 hover:border-[#D50032]/40 transition grid place-items-center"
                  aria-label="Instagram"
                >
                  <Image
                    src="/img/instagram.svg"
                    alt="Instagram Icon"
                    width={20}
                    height={20}
                    className="h-5 w-5 text-white/90"
                  />
                </a>
              </div>

              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-xs text-white/70">
                  ¿Quieres unirte? Escríbenos por redes y agenda una prueba.
                </p>
              </div>
            </div>
          </div>

          {/* Divider + credit */}
          <div className="border-t border-white/10 px-6 sm:px-10 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
              <p className="text-xs text-white/55">
                © 2025 Toluca Altas Montañas — Todos los derechos reservados.
              </p>
              <p className="text-xs text-white/55">
                Desarrollado por{" "}
                <a
                  href="https://www.facebook.com/meguin3?locale=es_LA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#FF2A4D] hover:text-white font-semibold transition"
                >
                  Guillermo Díaz Ramos
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Mini nota abajo */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/50">
          <span className="hidden sm:inline">Powered by Supabase</span>
          <span className="h-3 w-px bg-white/15 hidden sm:inline" />
          <span>Hecho con disciplina ⚽</span>
        </div>
      </div>
    </footer>
  );
}
