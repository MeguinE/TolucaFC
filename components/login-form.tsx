"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TolucaLoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) throw error;

      router.push("/protected");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error al iniciar sesión"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Forzamos colores para que SIEMPRE se vea (independiente del theme)
  const inputBase =
    "h-11 rounded-md bg-white border border-zinc-200 px-3 text-[14px] " +
    "text-zinc-900 caret-zinc-900 placeholder:text-zinc-400 " +
    "focus-visible:ring-2 focus-visible:ring-[#D50032]/30 focus-visible:border-[#D50032]";

  return (
    <div className={cn("min-h-screen w-full", className)} {...props}>
      {/* Fondo estadio */}
      <div className="relative min-h-screen w-full grid place-items-center px-4">
        <Image
          src="/img/toluca-stadium.jpg"
          alt="Estadio"
          fill
          priority
          className="object-cover"
        />

        {/* Overlay oscuro + rojo */}
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_500px_at_15%_25%,rgba(213,0,50,.35),transparent_55%)]" />

        {/* Card */}
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,.45)]">
          <div className="grid md:grid-cols-2">
            {/* Panel izquierdo (branding) */}
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/70" />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(213,0,50,.55),transparent_55%)]" />

              {/* Player/arte */}
              <div className="relative h-full min-h-[520px]">
                <Image
                  src="/img/Alexis-vega.jpg"
                  alt="Toluca"
                  fill
                  className="object-cover object-left"
                />
              </div>

              {/* Header Toluca */}
              <div className="absolute left-6 top-6 flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-white/10 backdrop-blur border border-white/15 grid place-items-center">
                  <Image
                    src="/img/toluca-logo.png"
                    alt="Toluca Logo"
                    width={34}
                    height={34}
                    className="object-contain"
                  />
                </div>
                <div className="text-white leading-tight">
                  <div className="text-[15px] font-extrabold tracking-tight">
                    Toluca Altas Montañas
                  </div>
                  <div className="text-[12.5px] font-semibold text-white/75">
                    Acceso al panel
                  </div>
                </div>
              </div>

              {/* Texto inferior */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-sm font-semibold text-white/90">
                  “Rojo pasión, trabajo y disciplina.”
                </p>
                <p className="mt-1 text-xs text-white/70">
                  Inicia sesión para administrar el sistema.
                </p>
              </div>
            </div>

            {/* Panel derecho (formulario) */}
            <div className="bg-white/18 backdrop-blur-sm border-l border-white/20">
              <div className="px-7 py-7">
                {/* header en mobile */}
                <div className="md:hidden flex items-center gap-3 mb-6">
                  <div className="h-11 w-11 rounded-xl border border-zinc-200 bg-zinc-50 grid place-items-center">
                    <Image
                      src="/img/toluca-logo.png"
                      alt="Toluca Logo"
                      width={32}
                      height={32}
                      className="object-contain"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[15px] font-extrabold tracking-tight text-zinc-900">
                      Toluca Altas Montañas
                    </div>
                    <div className="text-[12.5px] font-semibold text-zinc-500">
                      Acceso al panel
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h1 className="text-xl font-extrabold text-neutral-200">
                      Iniciar sesión
                    </h1>
                    <p className="mt-1 text-sm text-zinc-500">
                      Usa tu correo y contraseña para entrar.
                    </p>
                  </div>

                  <span className="rounded-full border border-[#D50032]/25 bg-[#D50032]/10 px-3 py-1 text-[11px] font-extrabold tracking-widest text-[#D50032]">
                    ADMIN
                  </span>
                </div>

                <form onSubmit={handleLogin} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-[12.5px] font-extrabold text-zinc-300"
                    >
                      Correo
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">
                        ✉️
                      </span>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tucorreo@dominio.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className={cn(inputBase, "pl-9")}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-[12.5px] font-extrabold text-zinc-300"
                      >
                        Contraseña
                      </Label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">
                        🔒
                      </span>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className={cn(inputBase, "pl-9")}
                        required
                      />
                    </div>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-semibold text-zinc-400 underline-offset-4 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  {error ? (
                    <div className="rounded-xl border border-[#D50032]/25 bg-[#D50032]/10 px-3 py-2 text-sm font-semibold text-[#7C0F16]">
                      <span className="mr-2 font-black">⚠</span>
                      {error}
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full h-11 rounded-xl font-extrabold shadow-[0_14px_30px_rgba(213,0,50,.18)]",
                      "bg-[#D50032] hover:bg-[#B8002A] text-white",
                      isLoading && "opacity-80"
                    )}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>

                  <p className="text-center text-xs text-sky-50 font-semibold">
                    Tip: revisa mayúsculas y espacios al final del correo.
                  </p>
                </form>

                {/* Nota inferior tipo “signup for free …” */}
                <div className="mt-6 rounded-xl bg-zinc-50 border border-zinc-200 px-4 py-3">
                  <p className="text-xs text-zinc-600">
                    Acceso exclusivo para administración. Si necesitas cuenta,
                    solicita alta con el encargado.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* texto inferior como en la referencia */}
        <p className="relative mt-6 text-center text-xs text-white/80">
          Accede para gestionar contenido y ver reportes del sistema.
        </p>
      </div>
    </div>
  );
}
