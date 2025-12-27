import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Venue = { id: string; name: string; place: string | null };

type Category = {
  id: string;
  name: string;
  year_from: number;
  year_to: number;
  sort_order: number | null;
};

type Schedule = {
  id: string;
  venue_id: string;
  category_id: string;
  weekday: number; // 1-7
  start_time: string; // "16:00:00"
  end_time: string;
  note: string | null;
};

const weekdayEs: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

function fmtTimeTo12h(t: string) {
  const [hh, mm] = t.split(":");
  const h = Number(hh);
  const h12 = ((h + 11) % 12) + 1;
  const suffix = h >= 12 ? "pm" : "am";
  return `${h12}:${mm} ${suffix}`;
}

function fmtRange(start: string, end: string) {
  // "4:00 a 6:00 pm"
  return `${fmtTimeTo12h(start)} a ${fmtTimeTo12h(end)}`;
}

const categoryBg: Record<string, string> = {
  "Dientes de Leche": "/img/categories/dientes.jpg",
  Chupón: "/img/categories/chupon.jpg",
  Biberón: "/img/categories/biberon.jpg",
  Pony: "/img/categories/pony.jpg",
  Infantil: "/img/categories/infantil.jpg",
  Intermedia: "/img/categories/intermedia.jpg",
  Juvenil: "/img/categories/juvenil.jpg",
};

const fallbackBg = "/img/categories/training.jpg";

// Orden “bonito” de sedes (opcional)
const venueOrder = ["Río Blanco", "Jalapilla"];

export default async function TrainingSection({
  className,
}: {
  className?: string;
}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !anon) {
    return (
      <section className="w-full px-6 md:px-10 py-14 text-white">
        <p className="font-bold">Faltan variables de entorno:</p>
        <ul className="list-disc pl-5 mt-2 text-white/80">
          {!url && <li>NEXT_PUBLIC_SUPABASE_URL</li>}
          {!anon && (
            <li>
              NEXT_PUBLIC_SUPABASE_ANON_KEY o
              NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
            </li>
          )}
        </ul>
      </section>
    );
  }

  const supabase = createClient(url, anon, { auth: { persistSession: false } });

  const [
    { data: venues, error: venuesError },
    { data: categories, error: catError },
    { data: schedules, error: schError },
  ] = await Promise.all([
    supabase.from("venues").select("id, name, place").order("name"),
    supabase
      .from("categories")
      .select("id, name, year_from, year_to, sort_order")
      .order("sort_order", { ascending: true }),
    supabase
      .from("schedules")
      .select("id, venue_id, category_id, weekday, start_time, end_time, note")
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true }),
  ]);

  if (venuesError || catError || schError) {
    return (
      <section className="w-full px-6 md:px-10 py-14 text-white">
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
          <p className="font-extrabold">Error consultando Supabase</p>
          <pre className="mt-3 text-xs text-white/80 overflow-auto">
            {JSON.stringify(
              {
                venuesError: venuesError?.message,
                catError: catError?.message,
                schError: schError?.message,
              },
              null,
              2
            )}
          </pre>
        </div>
      </section>
    );
  }

  const v = (venues ?? []) as Venue[];
  const c = (categories ?? []) as Category[];
  const s = (schedules ?? []) as Schedule[];

  const venueById = new Map<string, Venue>(v.map((x) => [x.id, x]));

  const schedulesByCategory = new Map<string, Schedule[]>();
  for (const row of s) {
    const arr = schedulesByCategory.get(row.category_id) ?? [];
    arr.push(row);
    schedulesByCategory.set(row.category_id, arr);
  }

  const sortVenuesNice = (aId: string, bId: string) => {
    const a = venueById.get(aId)?.name ?? "";
    const b = venueById.get(bId)?.name ?? "";
    const ia = venueOrder.indexOf(a);
    const ib = venueOrder.indexOf(b);
    if (ia !== -1 || ib !== -1)
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return a.localeCompare(b, "es");
  };

  return (
    <section
      id="training"
      className={cn(
        "relative w-full overflow-hidden py-20",
        "bg-gradient-to-b from-[#170006] via-black to-black text-white",
        className
      )}
    >
      {/* glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(213,0,50,.35),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_85%_80%,rgba(213,0,50,.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20" />

      <div className="relative mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center rounded-full border border-[#D50032]/30 bg-[#D50032]/15 px-4 py-1 text-[11px] font-extrabold tracking-widest text-white">
            ENTRENAMIENTOS
          </span>

          <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            <span className="text-white">Categorías</span>{" "}
            <span className="text-[#FF2A4D]">y Horarios</span>
          </h2>

          <p className="mt-4 text-base sm:text-lg text-white/75">
            Consulta los horarios por sede (Río Blanco y Jalapilla).
          </p>
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {c.map((cat) => {
            const rows = schedulesByCategory.get(cat.id) ?? [];

            // Agrupa horarios por sede
            const byVenue = new Map<string, Schedule[]>();
            for (const r of rows) {
              const arr = byVenue.get(r.venue_id) ?? [];
              arr.push(r);
              byVenue.set(r.venue_id, arr);
            }

            // Para que cada sede dentro de la categoría quede ordenada y
            // con horarios ordenados por día/hora
            const venueIds = Array.from(byVenue.keys()).sort(sortVenuesNice);
            for (const vid of venueIds) {
              byVenue
                .get(vid)!
                .sort(
                  (a, b) =>
                    a.weekday - b.weekday ||
                    a.start_time.localeCompare(b.start_time)
                );
            }

            const bg = categoryBg[cat.name] ?? fallbackBg;

            return (
              <article
                key={cat.id}
                className={cn(
                  "relative rounded-3xl overflow-hidden",
                  "border border-white/10 bg-white/5 backdrop-blur-md",
                  "shadow-[0_30px_90px_rgba(0,0,0,.35)]"
                )}
              >
                {/* Fondo */}
                <div className="absolute inset-0">
                  <Image
                    src={bg}
                    alt={`Fondo ${cat.name}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                    quality={85}
                  />
                  <div className="absolute inset-0 bg-black/55" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-black/75" />
                  <div className="absolute inset-0 bg-[radial-gradient(700px_400px_at_30%_20%,rgba(213,0,50,.35),transparent_60%)]" />
                </div>

                <div className="relative z-10 h-1 bg-[#D50032]" />

                <div className="relative z-10 p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                        {cat.name}
                      </h3>
                      <p className="mt-1 text-sm text-white/75 font-semibold">
                        {cat.year_from} / {cat.year_to}
                      </p>
                    </div>

                    <div className="h-10 w-10 rounded-2xl border border-white/15 bg-white/5 backdrop-blur grid place-items-center">
                      <Image
                        src="/img/toluca-logo.png"
                        alt="Toluca"
                        width={34}
                        height={34}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* ✅ Sedes + horarios (como te lo piden) */}
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="h-5 w-1 rounded-full bg-[#FF2A4D]" />
                      <p className="font-extrabold text-white">
                        Sedes y horarios
                      </p>
                    </div>

                    {venueIds.length === 0 ? (
                      <p className="text-sm text-white/70">
                        Aún no hay horarios registrados.
                      </p>
                    ) : (
                      venueIds.map((vid) => {
                        const venue = venueById.get(vid);
                        const list = byVenue.get(vid) ?? [];

                        return (
                          <div
                            key={vid}
                            className="rounded-2xl border border-white/10 bg-black/30 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-extrabold text-white truncate">
                                  {venue?.name ?? "Sede"}
                                </div>
                                <div className="text-xs text-white/70">
                                  {venue?.place ?? "—"}
                                </div>
                              </div>

                              <span className="text-[10px] px-3 py-1 rounded-full font-extrabold tracking-widest border border-[#D50032]/30 bg-[#D50032]/15 text-white">
                                SEDE
                              </span>
                            </div>

                            <div className="mt-3 space-y-2 text-sm text-white/85">
                              {list.map((r) => (
                                <div
                                  key={r.id}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <span className="font-semibold text-white">
                                    {weekdayEs[r.weekday] ?? `Día ${r.weekday}`}
                                  </span>
                                  <span className="text-white/80">
                                    {fmtRange(r.start_time, r.end_time)}
                                  </span>
                                </div>
                              ))}

                              {list.some((x) => x.note) ? (
                                <div className="pt-2 text-xs text-white/60">
                                  {list
                                    .filter((x) => x.note)
                                    .map((x) => x.note)
                                    .slice(0, 1)
                                    .join("")}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="relative z-10 h-px bg-white/10" />
              </article>
            );
          })}
        </div>

        <p className="mt-10 text-center text-xs sm:text-sm text-white/60">
          Disciplina hoy, victoria mañana.
        </p>
      </div>
    </section>
  );
}
