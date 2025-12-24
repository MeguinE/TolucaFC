"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Venue = { id: string; name: string; place: string | null };
type Category = {
  id: string;
  name: string;
  year_from: number;
  year_to: number;
  sort_order: number | null;
};

function findCategory(birthYear: number, cats: Category[]) {
  return cats.find((c) => {
    const min = Math.min(c.year_from, c.year_to);
    const max = Math.max(c.year_from, c.year_to);
    return birthYear >= min && birthYear <= max;
  });
}

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("52")) return digits.slice(2);
  return digits;
}

export default function PlayerRegistrationForm({
  className,
}: {
  className?: string;
}) {
  const [venues, setVenues] = React.useState<Venue[]>([]);
  const [cats, setCats] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [fullName, setFullName] = React.useState("");
  const [birthDate, setBirthDate] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [venueId, setVenueId] = React.useState("");

  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      const supabase = createClient();

      const [vRes, cRes] = await Promise.all([
        supabase
          .from("venues")
          .select("id, name, place")
          .order("name", { ascending: true }),
        supabase
          .from("categories")
          .select("id, name, year_from, year_to, sort_order")
          .order("sort_order", { ascending: true }),
      ]);

      if (vRes.error || cRes.error) {
        setError(
          vRes.error?.message ||
            cRes.error?.message ||
            "Error cargando sedes/categorías"
        );
      } else {
        setVenues((vRes.data ?? []) as Venue[]);
        setCats((cRes.data ?? []) as Category[]);
      }

      setLoading(false);
    };

    run();
  }, []);

  const birthYear = birthDate ? new Date(birthDate).getFullYear() : null;
  const category = birthYear ? findCategory(birthYear, cats) : null;

  const inputBase =
    "h-11 rounded-xl bg-white/95 border border-white/15 px-3 text-[14px] " +
    "text-zinc-900 caret-zinc-900 placeholder:text-zinc-400 " +
    "focus-visible:ring-2 focus-visible:ring-[#D50032]/30 focus-visible:border-[#D50032]";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(false);
    setError(null);

    const cleanName = fullName.trim();
    const cleanPhone = normalizePhone(phone);

    if (!cleanName) return setError("Escribe el nombre completo.");
    if (!birthDate) return setError("Selecciona la fecha de nacimiento.");
    if (!venueId) return setError("Selecciona una sede.");
    if (!category) return setError("No se encontró categoría para esa fecha.");
    if (cleanPhone.length !== 10)
      return setError("El teléfono debe tener 10 dígitos.");

    setSubmitting(true);
    try {
      const res = await fetch("/api/player-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ✅ mandamos venue_id y category_id (UUID string)
        body: JSON.stringify({
          full_name: cleanName,
          birth_date: birthDate,
          phone: cleanPhone,
          venue_id: venueId,
          category_id: category.id,
        }),
        // opcional para debug: si quieres ver el 307 sin que siga el redirect:
        // redirect: "manual",
      });

      const text = await res.text();
      let json: { error?: string } | null = null;
      try {
        json = JSON.parse(text);
      } catch {
        // si te regresó HTML, text será "<!DOCTYPE ..."
      }

      if (!res.ok) {
        throw new Error(json?.error ?? text.slice(0, 200));
      }

      setOk(true);
      setFullName("");
      setBirthDate("");
      setPhone("");
      setVenueId("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="registro"
      className={cn(
        "relative w-full overflow-hidden py-20",
        "bg-gradient-to-b from-black via-[#170006] to-black text-white",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(213,0,50,.35),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_80%_90%,rgba(213,0,50,.18),transparent_60%)]" />

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-[#D50032]/30 bg-[#D50032]/15 px-4 py-1 text-[11px] font-extrabold tracking-widest text-white">
            REGISTRO
          </span>

          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-white">Inscripción</span>{" "}
            <span className="text-[#FF2A4D]">de Jugadores</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-white/75">
            Regístrate y te ubicamos automáticamente en tu{" "}
            <span className="font-semibold text-white">categoría</span> según tu
            año de nacimiento.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-3 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_30px_90px_rgba(0,0,0,.35)] overflow-hidden">
            <div className="h-1 bg-[#D50032]" />

            <div className="p-6 sm:p-8">
              {loading ? (
                <p className="text-white/70">Cargando sedes y categorías…</p>
              ) : (
                <form onSubmit={submit} className="space-y-5">
                  <div className="space-y-2">
                    <Label className="text-[12.5px] font-extrabold text-white">
                      Nombre completo
                    </Label>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ej. Juan Pérez García"
                      className={inputBase}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[12.5px] font-extrabold text-white">
                        Fecha de nacimiento
                      </Label>
                      <Input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className={inputBase}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[12.5px] font-extrabold text-white">
                        Teléfono (WhatsApp)
                      </Label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. 2721234567"
                        className={inputBase}
                        required
                      />
                      <p className="text-xs text-white/60">
                        Tip: escribe 10 dígitos (sin espacios).
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[12.5px] font-extrabold text-white">
                      Sede
                    </Label>
                    <select
                      value={venueId}
                      onChange={(e) => setVenueId(e.target.value)}
                      className={cn(
                        inputBase,
                        "w-full appearance-none pr-10 bg-white/95"
                      )}
                      required
                    >
                      <option value="" disabled>
                        Selecciona una sede…
                      </option>
                      {venues.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                          {v.place ? ` — ${v.place}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/25 p-4">
                    <p className="text-xs font-extrabold tracking-widest text-white/70">
                      CATEGORÍA DETECTADA
                    </p>
                    <p className="mt-2 text-lg font-extrabold text-white">
                      {birthYear
                        ? category
                          ? category.name
                          : "No encontrada"
                        : "Selecciona tu fecha"}
                    </p>
                    <p className="mt-1 text-sm text-white/70">
                      {birthYear ? `Año: ${birthYear}` : "—"}
                    </p>
                  </div>

                  {error ? (
                    <div className="rounded-2xl border border-[#D50032]/25 bg-[#D50032]/10 px-3 py-2 text-sm font-semibold text-[#FFD1DA]">
                      <span className="mr-2 font-black">⚠</span>
                      {error}
                    </div>
                  ) : null}

                  {ok ? (
                    <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                      ✅ Registro enviado. En breve nos comunicamos por
                      WhatsApp.
                    </div>
                  ) : null}

                  <Button
                    type="submit"
                    disabled={submitting || loading}
                    className={cn(
                      "w-full h-11 rounded-xl font-extrabold shadow-[0_14px_30px_rgba(213,0,50,.18)]",
                      "bg-[#D50032] hover:bg-[#B8002A] text-white",
                      (submitting || loading) && "opacity-80"
                    )}
                  >
                    {submitting ? "Enviando..." : "Registrar jugador"}
                  </Button>
                </form>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_30px_90px_rgba(0,0,0,.35)] overflow-hidden">
            <div className="h-1 bg-white/10" />
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-extrabold text-white">¿Qué sigue?</h3>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                <li className="flex gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#D50032]" />
                  Te ubicamos en tu categoría automáticamente.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-[#FF2A4D]" />
                  Confirmamos por WhatsApp sede y horarios.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-2 w-2 rounded-full bg-white/70" />
                  Te damos indicaciones para tu primer entrenamiento.
                </li>
              </ul>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
                <p className="text-xs font-extrabold tracking-widest text-white/70">
                  IMPORTANTE
                </p>
                <p className="mt-2 text-sm text-white/75">
                  Si no aparece categoría, revisa la fecha o confirma con
                  administración.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs sm:text-sm text-white/60">
          Toluca Altas Montañas • Disciplina hoy, victoria mañana.
        </p>
      </div>
    </section>
  );
}
