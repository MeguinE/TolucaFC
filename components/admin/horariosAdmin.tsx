"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";

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
  category_id: string;
  venue_id: string;
  weekday: number; // 1-7
  start_time: string; // "16:00:00"
  end_time: string;
  is_optional: boolean;
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

function tToInput(t: string) {
  return (t ?? "").slice(0, 5); // 16:00
}
function inputToDb(t: string) {
  return t.length === 5 ? `${t}:00` : t; // 16:00:00
}

export default function HorariosAdmin({
  panelClass,
  softClass,
  inputClass,
  selectClass,
}: {
  panelClass: string;
  softClass: string;
  inputClass: string;
  selectClass: string;
}) {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [venues, setVenues] = useState<Venue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const [venueSel, setVenueSel] = useState<string>("");

  // modal
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);

  const [form, setForm] = useState({
    category_id: "",
    weekday: 1,
    start_time: "16:00",
    end_time: "18:00",
    is_optional: false,
    note: "",
  });

  const load = async () => {
    setLoading(true);
    setError(null);

    const [vRes, cRes, sRes] = await Promise.all([
      supabase.from("venues").select("id, name, place").order("name"),
      supabase
        .from("categories")
        .select("id, name, year_from, year_to, sort_order")
        .order("sort_order", { ascending: true }),
      supabase
        .from("schedules")
        .select(
          "id, category_id, venue_id, weekday, start_time, end_time, is_optional, note"
        )
        .order("weekday", { ascending: true })
        .order("start_time", { ascending: true }),
    ]);

    if (vRes.error || cRes.error || sRes.error) {
      setError(
        vRes.error?.message ||
          cRes.error?.message ||
          sRes.error?.message ||
          "Error cargando datos"
      );
      setVenues([]);
      setCategories([]);
      setSchedules([]);
      setLoading(false);
      return;
    }

    const v = (vRes.data ?? []) as Venue[];
    setVenues(v);
    setCategories((cRes.data ?? []) as Category[]);
    setSchedules((sRes.data ?? []) as Schedule[]);

    if (!venueSel && v.length) setVenueSel(v[0].id);

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const venue = useMemo(
    () => venues.find((x) => x.id === venueSel) ?? null,
    [venues, venueSel]
  );

  const catById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const grouped = useMemo(() => {
    const list = schedules.filter((s) => s.venue_id === venueSel);

    // group by category
    const map = new Map<string, Schedule[]>();
    for (const r of list) {
      const arr = map.get(r.category_id) ?? [];
      arr.push(r);
      map.set(r.category_id, arr);
    }

    const entries = Array.from(map.entries()).sort((a, b) => {
      const sa = catById.get(a[0])?.sort_order ?? 9999;
      const sb = catById.get(b[0])?.sort_order ?? 9999;
      return sa - sb;
    });

    return entries.map(([category_id, rows]) => ({
      category_id,
      rows: rows.slice().sort((x, y) => x.weekday - y.weekday),
    }));
  }, [schedules, venueSel, catById]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      category_id: categories[0]?.id ?? "",
      weekday: 1,
      start_time: "16:00",
      end_time: "18:00",
      is_optional: false,
      note: "",
    });
    setOpen(true);
  };

  const openEdit = (r: Schedule) => {
    setEditing(r);
    setForm({
      category_id: r.category_id,
      weekday: r.weekday,
      start_time: tToInput(r.start_time),
      end_time: tToInput(r.end_time),
      is_optional: r.is_optional,
      note: r.note ?? "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!venueSel) return;
    if (!form.category_id) return setError("Selecciona una categoría.");
    if (!form.start_time || !form.end_time)
      return setError("Define hora inicio y fin.");

    setBusy(true);
    setError(null);

    const payload = {
      venue_id: venueSel,
      category_id: form.category_id,
      weekday: Number(form.weekday),
      start_time: inputToDb(form.start_time),
      end_time: inputToDb(form.end_time),
      is_optional: !!form.is_optional,
      note: form.note.trim() ? form.note.trim() : null,
    };

    if (!editing) {
      const { error } = await supabase.from("schedules").insert(payload);
      if (error) setError(error.message);
      else {
        setOpen(false);
        await load();
      }
    } else {
      const { error } = await supabase
        .from("schedules")
        .update(payload)
        .eq("id", editing.id);
      if (error) setError(error.message);
      else {
        setOpen(false);
        await load();
      }
    }

    setBusy(false);
  };

  const remove = async (r: Schedule) => {
    const ok = confirm("¿Eliminar este día/horario? No se puede deshacer.");
    if (!ok) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("schedules").delete().eq("id", r.id);
    if (error) setError(error.message);
    else await load();
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      <section className="mx-auto max-w-7xl">
        <div className={cn(panelClass, "p-6 sm:p-7 relative overflow-hidden")}>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_220px_at_20%_0%,rgba(213,0,50,.22),transparent_55%)]" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#D50032]/30 bg-[#D50032]/15 px-4 py-1 text-[11px] font-extrabold tracking-widest">
                ADMIN
              </div>
              <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
                Horarios <span className="text-[#FF2A4D]">por sede</span>
              </h1>
              <p className="mt-2 text-sm text-white/65">
                Agrega días, modifica horas o elimina horarios por categoría.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={load}
                className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2 text-sm font-extrabold"
                disabled={loading || busy}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refrescar
              </button>

              <button
                onClick={openCreate}
                className="h-11 px-4 rounded-xl bg-[#D50032] hover:bg-[#B8002A] transition flex items-center gap-2 text-sm font-extrabold shadow-[0_14px_30px_rgba(213,0,50,.18)]"
                disabled={loading || busy || !venueSel}
              >
                <Plus size={16} />
                Agregar día
              </button>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-5 rounded-xl border border-[#D50032]/25 bg-[#D50032]/10 p-4 text-sm text-[#FFD1DA]">
            <b className="mr-2">⚠</b>
            {error}
          </div>
        ) : null}

        {/* Selector de sede */}
        <div className={cn(softClass, "mt-5 p-4 sm:p-5")}>
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex-1">
              <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em]">
                Sede
              </div>
              <select
                value={venueSel}
                onChange={(e) => setVenueSel(e.target.value)}
                className={cn(selectClass, "mt-2")}
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id} className="bg-zinc-950">
                    {v.name}
                  </option>
                ))}
              </select>
              <div className="mt-2 text-sm text-white/60">
                {venue?.place ? <span>{venue.place}</span> : <span>—</span>}
              </div>
            </div>

            <div className="text-sm text-white/60">
              Total días:{" "}
              <b className="text-white">
                {schedules.filter((x) => x.venue_id === venueSel).length}
              </b>
            </div>
          </div>
        </div>

        {/* Listado por categoría */}
        <div className={cn(panelClass, "mt-5 overflow-hidden")}>
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D50032]" />
              <h2 className="font-extrabold">Horarios</h2>
              <span className="text-xs text-white/60">
                (
                {loading ? "…" : grouped.reduce((a, b) => a + b.rows.length, 0)}
                )
              </span>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {loading ? (
              <div className="px-4 sm:px-6 py-10 text-white/60">Cargando…</div>
            ) : grouped.length === 0 ? (
              <div className="px-4 sm:px-6 py-10 text-white/60">
                No hay horarios para esta sede.
              </div>
            ) : (
              grouped.map((g) => {
                const cat = catById.get(g.category_id);
                return (
                  <div key={g.category_id} className="px-4 sm:px-6 py-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-extrabold text-white">
                          {cat?.name ?? "Categoría"}
                        </div>
                        <div className="text-sm text-white/60">
                          {cat ? `${cat.year_from}–${cat.year_to}` : "—"}
                        </div>
                      </div>
                      <span className="text-xs px-3 py-1 rounded-full font-bold bg-black/35 border border-white/10 text-white/60">
                        {g.rows.length} día(s)
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {g.rows.map((r) => (
                        <div
                          key={r.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="text-sm">
                            <div className="font-extrabold">
                              {weekdayEs[r.weekday] ?? `Día ${r.weekday}`}{" "}
                              <span className="text-white/60 font-semibold">
                                {tToInput(r.start_time)}–{tToInput(r.end_time)}
                              </span>
                            </div>
                            {r.note ? (
                              <div className="text-white/60">{r.note}</div>
                            ) : null}
                            {r.is_optional ? (
                              <div className="text-[#FF2A4D] font-extrabold text-xs mt-1">
                                Opcional
                              </div>
                            ) : null}
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => openEdit(r)}
                              className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-extrabold flex items-center gap-2"
                              disabled={busy}
                            >
                              <Pencil size={16} />
                              Editar
                            </button>
                            <button
                              onClick={() => remove(r)}
                              className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-extrabold flex items-center gap-2"
                              disabled={busy}
                            >
                              <Trash2 size={16} />
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* Modal simple */}
      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2">
            <div className={cn(panelClass, "p-5")}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-extrabold text-lg">
                  {editing ? "Editar horario" : "Agregar horario"}
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-extrabold"
                >
                  Cerrar
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em]">
                    Categoría
                  </div>
                  <select
                    value={form.category_id}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, category_id: e.target.value }))
                    }
                    className={cn(selectClass, "mt-2")}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id} className="bg-zinc-950">
                        {c.name} ({c.year_from}-{c.year_to})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em]">
                      Día
                    </div>
                    <select
                      value={form.weekday}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          weekday: Number(e.target.value),
                        }))
                      }
                      className={cn(selectClass, "mt-2")}
                    >
                      {Object.keys(weekdayEs).map((k) => (
                        <option key={k} value={k} className="bg-zinc-950">
                          {weekdayEs[Number(k)]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em]">
                      Inicio
                    </div>
                    <input
                      type="time"
                      value={form.start_time}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, start_time: e.target.value }))
                      }
                      className={cn(inputClass, "mt-2")}
                    />
                  </div>

                  <div>
                    <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em]">
                      Fin
                    </div>
                    <input
                      type="time"
                      value={form.end_time}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, end_time: e.target.value }))
                      }
                      className={cn(inputClass, "mt-2")}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="opt"
                    type="checkbox"
                    checked={form.is_optional}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, is_optional: e.target.checked }))
                    }
                  />
                  <label
                    htmlFor="opt"
                    className="text-sm text-white/80 font-semibold"
                  >
                    Marcar como opcional
                  </label>
                </div>

                <div>
                  <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em]">
                    Nota (opcional)
                  </div>
                  <input
                    value={form.note}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, note: e.target.value }))
                    }
                    className={cn(inputClass, "mt-2")}
                    placeholder="Ej. Tercer día dependiendo de la categoría…"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={save}
                    disabled={busy}
                    className="flex-1 h-11 rounded-xl bg-[#D50032] hover:bg-[#B8002A] transition font-extrabold shadow-[0_14px_30px_rgba(213,0,50,.18)]"
                  >
                    {busy ? "Guardando…" : "Guardar"}
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-extrabold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
