"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Plus, Pencil, RefreshCw, Trash2 } from "lucide-react";

type Venue = { id: string; name: string; place: string | null };

export default function SedesAdmin({
  panelClass,
  softClass,
  inputClass,
}: {
  panelClass: string;
  softClass: string;
  inputClass: string;
}) {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [venues, setVenues] = useState<Venue[]>([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Venue | null>(null);

  const [form, setForm] = useState({ name: "", place: "" });

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("venues")
      .select("id, name, place")
      .order("name");
    if (error) {
      setError(error.message);
      setVenues([]);
    } else {
      setVenues((data ?? []) as Venue[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", place: "" });
    setOpen(true);
  };

  const openEdit = (v: Venue) => {
    setEditing(v);
    setForm({ name: v.name ?? "", place: v.place ?? "" });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim())
      return setError("El nombre de la sede es obligatorio.");
    if (!form.place.trim())
      return setError("La ubicación (place) es obligatoria.");

    setBusy(true);
    setError(null);

    if (!editing) {
      const { error } = await supabase.from("venues").insert({
        name: form.name.trim(),
        place: form.place.trim(),
      });
      if (error) setError(error.message);
      else {
        setOpen(false);
        await load();
      }
    } else {
      const { error } = await supabase
        .from("venues")
        .update({
          name: form.name.trim(),
          place: form.place.trim(),
        })
        .eq("id", editing.id);

      if (error) setError(error.message);
      else {
        setOpen(false);
        await load();
      }
    }

    setBusy(false);
  };

  const remove = async (v: Venue) => {
    const ok = confirm(
      "¿Eliminar esta sede? Si hay horarios ligados, se borrarán (on delete cascade)."
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("venues").delete().eq("id", v.id);
    if (error) setError(error.message);
    else await load();
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      <div className={cn(panelClass, "p-6 sm:p-7 relative overflow-hidden")}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_220px_at_20%_0%,rgba(213,0,50,.22),transparent_55%)]" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D50032]/30 bg-[#D50032]/15 px-4 py-1 text-[11px] font-extrabold tracking-widest">
              ADMIN
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Sedes <span className="text-[#FF2A4D]">del club</span>
            </h1>
            <p className="mt-2 text-sm text-white/65">
              Agrega o edita sedes. (Borrar es opcional)
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={load}
              className="h-11 px-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2 text-sm font-extrabold"
              disabled={loading || busy}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refrescar
            </button>

            <button
              onClick={openCreate}
              className="h-11 px-4 rounded-xl bg-[#D50032] hover:bg-[#B8002A] transition flex items-center gap-2 text-sm font-extrabold shadow-[0_14px_30px_rgba(213,0,50,.18)]"
              disabled={loading || busy}
            >
              <Plus size={16} />
              Nueva sede
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-[#D50032]/25 bg-[#D50032]/10 p-4 text-sm text-[#FFD1DA]">
          <b className="mr-2">⚠</b>
          {error}
        </div>
      ) : null}

      <div className={cn(softClass, "p-4 sm:p-5")}>
        {loading ? (
          <div className="text-white/60">Cargando…</div>
        ) : venues.length === 0 ? (
          <div className="text-white/60">No hay sedes registradas.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {venues.map((v) => (
              <div
                key={v.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex flex-col gap-2"
              >
                <div className="font-extrabold text-white">{v.name}</div>
                <div className="text-sm text-white/60">{v.place ?? "—"}</div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => openEdit(v)}
                    className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-extrabold flex items-center gap-2"
                    disabled={busy}
                  >
                    <Pencil size={16} />
                    Editar
                  </button>
                  <button
                    onClick={() => remove(v)}
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
        )}
      </div>

      {/* modal */}
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
                  {editing ? "Editar sede" : "Nueva sede"}
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
                    Nombre
                  </div>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    className={cn(inputClass, "mt-2")}
                    placeholder="Ej. Río Blanco"
                  />
                </div>

                <div>
                  <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em]">
                    Ubicación (place)
                  </div>
                  <input
                    value={form.place}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, place: e.target.value }))
                    }
                    className={cn(inputClass, "mt-2")}
                    placeholder='Ej. "Río Blanco, Ver. - Estadio 7 de Enero"'
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
