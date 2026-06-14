"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Plus, Pencil, RefreshCw, Trash2, ArrowUpDown } from "lucide-react";

type Category = {
  id: string;
  name: string;
  year_from: number;
  year_to: number;
  sort_order: number | null;
};

export default function CategoriasAdmin({
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
  const [cats, setCats] = useState<Category[]>([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const [form, setForm] = useState({
    name: "",
    year_from: new Date().getFullYear(),
    year_to: new Date().getFullYear(),
    sort_order: "",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, year_from, year_to, sort_order")
      .order("sort_order", { ascending: true });
    if (error) {
      setError(error.message);
      setCats([]);
    } else {
      setCats((data ?? []) as Category[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      year_from: new Date().getFullYear(),
      year_to: new Date().getFullYear(),
      sort_order: "",
    });
    setOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({
      name: c.name ?? "",
      year_from: c.year_from,
      year_to: c.year_to,
      sort_order: c.sort_order != null ? String(c.sort_order) : "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return setError("El nombre de la categoría es obligatorio.");
    if (!form.year_from || !form.year_to) return setError("Define los años de nacimiento.");

    setBusy(true);
    setError(null);

    const payload = {
      name: form.name.trim(),
      year_from: Number(form.year_from),
      year_to: Number(form.year_to),
      sort_order: form.sort_order !== "" ? Number(form.sort_order) : null,
    };

    if (!editing) {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) setError(error.message);
      else { setOpen(false); await load(); }
    } else {
      const { error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editing.id);
      if (error) setError(error.message);
      else { setOpen(false); await load(); }
    }

    setBusy(false);
  };

  const remove = async (c: Category) => {
    const ok = confirm(
      `¿Eliminar la categoría "${c.name}"? Los horarios y registros ligados podrían verse afectados.`
    );
    if (!ok) return;
    setBusy(true);
    setError(null);
    const { error } = await supabase.from("categories").delete().eq("id", c.id);
    if (error) setError(error.message);
    else await load();
    setBusy(false);
  };

  const yearRange = (c: Category) => {
    const min = Math.min(c.year_from, c.year_to);
    const max = Math.max(c.year_from, c.year_to);
    return min === max ? String(min) : `${min} – ${max}`;
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className={cn(panelClass, "p-6 sm:p-7 relative overflow-hidden")}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_220px_at_20%_0%,rgba(213,0,50,.22),transparent_55%)]" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D50032]/30 bg-[#D50032]/15 px-4 py-1 text-[11px] font-extrabold tracking-widest">
              ADMIN
            </div>
            <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
              Categorías <span className="text-[#FF2A4D]">del club</span>
            </h1>
            <p className="mt-2 text-sm text-white/65">
              Gestiona las categorías por rango de año de nacimiento.
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
              Nueva categoría
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-[#D50032]/25 bg-[#D50032]/10 p-4 text-sm text-[#FFD1DA]">
          <b className="mr-2">⚠</b>{error}
        </div>
      )}

      {/* Lista */}
      <div className={cn(panelClass, "overflow-hidden")}>
        <div className="px-4 sm:px-6 py-4 flex items-center gap-3 border-b border-white/10">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D50032]" />
          <h2 className="font-extrabold">Listado</h2>
          <span className="text-xs text-white/60">({loading ? "…" : cats.length})</span>
          <ArrowUpDown size={14} className="text-white/40 ml-auto" />
          <span className="text-xs text-white/40">ordenado por sort_order</span>
        </div>

        {loading ? (
          <div className="px-4 sm:px-6 py-10 text-white/60">Cargando…</div>
        ) : cats.length === 0 ? (
          <div className="px-4 sm:px-6 py-10 text-white/60">
            No hay categorías registradas. Crea la primera.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {cats.map((c) => (
              <div
                key={c.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-6 py-5 hover:bg-white/[0.03] transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Sort order badge */}
                  <div className="h-10 w-10 rounded-xl bg-black/40 border border-white/10 grid place-items-center text-xs font-extrabold text-white/60 shrink-0">
                    {c.sort_order ?? "—"}
                  </div>

                  <div className="min-w-0">
                    <div className="font-extrabold text-white truncate">{c.name}</div>
                    <div className="text-sm text-white/60">
                      Año de nacimiento:{" "}
                      <span className="font-semibold text-[#FF2A4D]">{yearRange(c)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(c)}
                    className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-extrabold flex items-center gap-2 text-sm"
                    disabled={busy}
                  >
                    <Pencil size={15} />
                    Editar
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="h-10 px-3 rounded-xl border border-[#D50032]/20 bg-[#D50032]/10 hover:bg-[#D50032]/20 transition font-extrabold flex items-center gap-2 text-sm text-[#FF6B6B]"
                    disabled={busy}
                  >
                    <Trash2 size={15} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className={cn(softClass, "p-4 text-sm text-white/60")}>
        <b className="text-white/80">sort_order</b> controla el orden en que aparecen las categorías en la landing. Valores menores aparecen primero.
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} />
          <div className={cn(panelClass, "relative w-full max-w-lg p-5 sm:p-6")}>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="font-extrabold text-lg">
                {editing ? `Editar: ${editing.name}` : "Nueva categoría"}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-extrabold text-sm"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em] mb-2">
                  Nombre de la categoría
                </div>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className={inputClass}
                  placeholder='Ej. "Infantil", "Juvenil", "Dientes de Leche"'
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em] mb-2">
                    Año de nacimiento (desde)
                  </div>
                  <input
                    type="number"
                    value={form.year_from}
                    onChange={(e) => setForm((p) => ({ ...p, year_from: Number(e.target.value) }))}
                    className={inputClass}
                    placeholder="Ej. 2012"
                    min={1990}
                    max={new Date().getFullYear()}
                  />
                </div>
                <div>
                  <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em] mb-2">
                    Año de nacimiento (hasta)
                  </div>
                  <input
                    type="number"
                    value={form.year_to}
                    onChange={(e) => setForm((p) => ({ ...p, year_to: Number(e.target.value) }))}
                    className={inputClass}
                    placeholder="Ej. 2013"
                    min={1990}
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div>
                <div className="text-xs text-white/60 font-extrabold uppercase tracking-[0.18em] mb-2">
                  Orden de aparición (sort_order)
                </div>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))}
                  className={inputClass}
                  placeholder="Ej. 1 (menor = primero). Dejar vacío para sin orden."
                  min={1}
                />
              </div>

              {/* Preview */}
              {form.name && (
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <div className="text-xs text-white/50 font-extrabold uppercase tracking-widest mb-1">
                    Vista previa
                  </div>
                  <div className="font-extrabold text-white">{form.name}</div>
                  <div className="text-sm text-white/60 mt-0.5">
                    Nacidos en {form.year_from}
                    {form.year_to !== form.year_from ? ` – ${form.year_to}` : ""}
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-[#D50032]/25 bg-[#D50032]/10 p-3 text-sm text-[#FFD1DA]">
                  <b className="mr-2">⚠</b>{error}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={save}
                  disabled={busy}
                  className="flex-1 h-11 rounded-xl bg-[#D50032] hover:bg-[#B8002A] transition font-extrabold shadow-[0_14px_30px_rgba(213,0,50,.18)] disabled:opacity-60"
                >
                  {busy ? "Guardando…" : editing ? "Guardar cambios" : "Crear categoría"}
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
      )}
    </div>
  );
}
