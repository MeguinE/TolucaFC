"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  MapPin,
  Tags,
  RefreshCw,
  Download,
  LogOut,
  Search,
  Copy,
  Eye,
  Menu,
  X,
  ChevronRight,
  CalendarDays,
  Phone,
  Shield,
} from "lucide-react";

type Venue = { id: string; name: string; place: string | null };
type Category = {
  id: string;
  name: string;
  year_from: number;
  year_to: number;
  sort_order: number | null;
};

type RegistrationRow = {
  id: string;
  full_name: string;
  birth_date: string;
  phone: string;
  created_at: string;
  venue: Venue | null;
  category: Category | null;
};

function formatFecha(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function calcAge(birthDate: string) {
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

function normalize(v: any, fallback: string) {
  return v == null || v === "" ? fallback : String(v);
}

function exportCSV(rows: RegistrationRow[]) {
  const headers = ["Nombre", "Edad", "Teléfono", "Sede", "Categoría", "Fecha"];

  const lines = rows.map((r) => {
    const sede = normalize(r.venue?.name, "Sin sede");
    const cat = normalize(r.category?.name, "Sin categoría");
    const age = calcAge(r.birth_date);
    const fecha = formatFecha(r.created_at);

    const cells = [
      r.full_name ?? "",
      age == null ? "" : String(age),
      r.phone ?? "",
      sede,
      cat,
      fecha,
    ].map((x) => `"${String(x).replaceAll('"', '""')}"`);

    return cells.join(",");
  });

  const csv = [headers.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `registros_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Dashboard() {
  const [q, setQ] = useState("");
  const [sedeSel, setSedeSel] = useState("Todas");
  const [catSel, setCatSel] = useState("Todas");
  const [mobileOpen, setMobileOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<RegistrationRow[]>([]);

  const load = async () => {
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("player_registrations")
      .select(
        `
    id,
    full_name,
    birth_date,
    phone,
    created_at,
    venue:venues ( id, name, place ),
    category:categories ( id, name, year_from, year_to, sort_order )
  `
      )
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
      setRows([]);
    } else {
      const mapped: RegistrationRow[] = (data ?? []).map((r: any) => ({
        id: r.id,
        full_name: r.full_name,
        birth_date: r.birth_date,
        phone: r.phone,
        created_at: r.created_at,
        venue: r.venue ?? null,
        category: r.category ?? null,
      }));
      setRows(mapped);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const data = useMemo(() => {
    const safe = Array.isArray(rows) ? rows : [];

    const sedesSet = new Set<string>();
    const catsSet = new Set<string>();

    for (const r of safe) {
      sedesSet.add(normalize(r.venue?.name, "Sin sede"));
      catsSet.add(normalize(r.category?.name, "Sin categoría"));
    }

    const sedes = ["Todas", ...Array.from(sedesSet).sort()];
    const categorias = ["Todas", ...Array.from(catsSet).sort()];

    const now = new Date();
    const last30 = safe.filter((r) => {
      const d = new Date(r.created_at);
      if (Number.isNaN(d.getTime())) return false;
      const diff = now.getTime() - d.getTime();
      return diff >= 0 && diff <= 30 * 24 * 60 * 60 * 1000;
    }).length;

    let filtrados = safe;

    if (sedeSel !== "Todas") {
      filtrados = filtrados.filter(
        (r) => normalize(r.venue?.name, "Sin sede") === sedeSel
      );
    }

    if (catSel !== "Todas") {
      filtrados = filtrados.filter(
        (r) => normalize(r.category?.name, "Sin categoría") === catSel
      );
    }

    if (q.trim()) {
      const needle = q.trim().toLowerCase();
      filtrados = filtrados.filter((r) => {
        const nombre = String(r.full_name ?? "").toLowerCase();
        const tel = String(r.phone ?? "").toLowerCase();
        const sede = String(r.venue?.name ?? "").toLowerCase();
        const cat = String(r.category?.name ?? "").toLowerCase();
        return (
          nombre.includes(needle) ||
          tel.includes(needle) ||
          sede.includes(needle) ||
          cat.includes(needle)
        );
      });
    }

    return {
      total: safe.length,
      last30,
      sedes,
      categorias,
      filtrados,
      sedesCount: Math.max(0, sedes.length - 1),
      catsCount: Math.max(0, categorias.length - 1),
    };
  }, [rows, q, sedeSel, catSel]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/auth/login");
  };

  const copyPhone = async (phone: string) => {
    try {
      await navigator.clipboard.writeText(phone);
    } catch {
      // nada
    }
  };

  const shell = "min-h-screen bg-zinc-950 text-white relative overflow-hidden";

  const panel =
    "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_30px_90px_rgba(0,0,0,.45)]";

  const soft =
    "rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md";

  const input =
    "h-11 w-full rounded-xl bg-black/40 border border-white/10 px-4 text-sm text-white placeholder:text-white/40 outline-none " +
    "focus-visible:ring-2 focus-visible:ring-[#D50032]/30 focus-visible:border-[#D50032]";

  const select =
    "h-11 w-full rounded-xl bg-black/40 border border-white/10 px-4 text-sm text-white outline-none " +
    "focus-visible:ring-2 focus-visible:ring-[#D50032]/30 focus-visible:border-[#D50032]";

  return (
    <div className={shell}>
      {/* Background premium */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_20%_10%,rgba(213,0,50,.25),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_500px_at_85%_80%,rgba(213,0,50,.12),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:42px_42px]" />

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[320px] p-4">
            <div className={cn(panel, "h-full p-4 flex flex-col")}>
              <div className="flex items-center justify-between">
                <Brand />
                <button
                  className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="mx-auto" size={18} />
                </button>
              </div>

              <Nav />

              <div className="mt-auto pt-4 border-t border-white/10">
                <button
                  onClick={handleLogout}
                  className="w-full h-11 rounded-xl bg-black/40 border border-white/10 hover:bg-black/55 transition font-extrabold flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      <div className="relative flex">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex w-[320px] p-6">
          <div
            className={cn(panel, "w-full flex flex-col h-[calc(100vh-3rem)]")}
          >
            <div className="p-5">
              <Brand />
            </div>

            <div className="px-5 pb-5 overflow-y-auto flex-1">
              <Nav />
            </div>

            <div className="px-5 py-5 border-t border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-black/40 border border-white/10 grid place-items-center">
                  <Shield size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-white/60">Sesión</div>
                  <div className="font-extrabold truncate">Administrador</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="mt-4 w-full h-11 rounded-xl bg-[#D50032] hover:bg-[#B8002A] transition font-extrabold flex items-center justify-center gap-2 shadow-[0_14px_30px_rgba(213,0,50,.18)]"
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1">
          {/* Topbar */}
          <div className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur-md">
            <div className="mx-auto max-w-7xl px-6 md:px-10 py-3 flex items-center gap-3">
              <button
                className="lg:hidden h-10 w-10 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="mx-auto" size={18} />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-sm text-white/70">
                <span className="font-extrabold text-white">
                  Panel de Administración
                </span>
                <ChevronRight size={16} className="text-white/35" />
                <span className="text-[#FF2A4D] font-extrabold">
                  Toluca Altas Montañas
                </span>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={load}
                  className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2 text-sm font-extrabold"
                  disabled={loading}
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                  Refrescar
                </button>

                <button
                  onClick={() => exportCSV(data.filtrados)}
                  className="h-10 px-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition flex items-center gap-2 text-sm font-extrabold"
                >
                  <Download size={16} />
                  Exportar
                </button>
              </div>
            </div>
          </div>

          {/* Header */}
          <section className="mx-auto max-w-7xl px-6 md:px-10 pt-6">
            <div className={cn(panel, "p-6 sm:p-7 relative overflow-hidden")}>
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(700px_220px_at_20%_0%,rgba(213,0,50,.22),transparent_55%)]" />
              <div className="absolute -top-20 -right-20 h-56 w-56 rounded-full bg-[#D50032]/10 blur-3xl" />

              <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-[#D50032]/30 bg-[#D50032]/15 px-4 py-1 text-[11px] font-extrabold tracking-widest">
                    ADMIN
                  </div>

                  <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold tracking-tight">
                    Registros{" "}
                    <span className="text-[#FF2A4D]">de Interesados</span>
                  </h1>

                  <p className="mt-2 text-sm text-white/65">
                    Consulta, filtra y administra los registros capturados desde
                    la landing.
                  </p>
                </div>

                <Link
                  href="/#registro"
                  className="inline-flex items-center justify-center rounded-xl px-5 py-3 font-extrabold bg-[#D50032] hover:bg-[#B8002A] transition shadow-[0_14px_30px_rgba(213,0,50,.18)]"
                >
                  ＋ Nuevo registro
                </Link>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="mx-auto max-w-7xl px-6 md:px-10 py-6 space-y-5">
            {error ? (
              <div className="rounded-xl border border-[#D50032]/25 bg-[#D50032]/10 p-4 text-sm text-[#FFD1DA]">
                <b className="mr-2">⚠</b>
                {error}
              </div>
            ) : null}

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Kpi
                icon={<Users size={18} />}
                title="Registros totales"
                value={data.total}
                hint="Global"
              />
              <Kpi
                icon={<CalendarDays size={18} />}
                title="Últimos 30 días"
                value={data.last30}
                hint="Actividad"
              />
              <Kpi
                icon={<MapPin size={18} />}
                title="Sedes"
                value={data.sedesCount}
                hint="Distribución"
              />
              <Kpi
                icon={<Tags size={18} />}
                title="Categorías"
                value={data.catsCount}
                hint="Academia"
              />
            </div>

            {/* Filters */}
            <div className={cn(soft, "p-4 sm:p-5")}>
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex flex-col md:flex-row gap-3 w-full">
                  <div className="flex-1 relative">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
                    />
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Buscar por nombre, teléfono, sede o categoría…"
                      className={cn(input, "pl-11")}
                    />
                  </div>

                  <select
                    value={sedeSel}
                    onChange={(e) => setSedeSel(e.target.value)}
                    className={cn(select, "md:w-64")}
                  >
                    {data.sedes.map((s) => (
                      <option key={s} value={s} className="bg-zinc-950">
                        {s}
                      </option>
                    ))}
                  </select>

                  <select
                    value={catSel}
                    onChange={(e) => setCatSel(e.target.value)}
                    className={cn(select, "md:w-64")}
                  >
                    {data.categorias.map((c) => (
                      <option key={c} value={c} className="bg-zinc-950">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-sm text-white/60">
                  Mostrando:{" "}
                  <b className="text-white">
                    {loading ? "…" : data.filtrados.length}
                  </b>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className={cn(panel, "overflow-hidden")}>
              <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#D50032]" />
                  <h2 className="font-extrabold">Listado</h2>
                  <span className="text-xs text-white/60">
                    ({loading ? "…" : data.filtrados.length})
                  </span>
                </div>
              </div>

              <div className="hidden md:grid grid-cols-12 gap-3 px-4 sm:px-6 py-3 border-t border-white/10 text-[11px] font-extrabold uppercase tracking-[0.18em] text-white/60 bg-black/25">
                <div className="col-span-4">Jugador</div>
                <div className="col-span-2">Edad</div>
                <div className="col-span-2">Teléfono</div>
                <div className="col-span-2">Categoría</div>
                <div className="col-span-1">Sede</div>
                <div className="col-span-1 text-right">Acciones</div>
              </div>

              <div className="divide-y divide-white/10">
                {loading ? (
                  <div className="px-4 sm:px-6 py-10 text-white/60">
                    Cargando…
                  </div>
                ) : data.filtrados.length === 0 ? (
                  <div className="px-4 sm:px-6 py-10 text-white/60">
                    No hay resultados con esos filtros.
                  </div>
                ) : (
                  data.filtrados.map((r) => {
                    const sede = normalize(r.venue?.name, "Sin sede");
                    const cat = normalize(r.category?.name, "Sin categoría");
                    const age = calcAge(r.birth_date);

                    return (
                      <div
                        key={r.id}
                        className="grid grid-cols-12 gap-3 px-4 sm:px-6 py-4 items-center hover:bg-white/[0.03] transition"
                      >
                        {/* Jugador */}
                        <div className="col-span-12 md:col-span-4 flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-black/40 border border-white/10 grid place-items-center font-extrabold">
                            {(
                              String(r.full_name ?? "X")[0] || "X"
                            ).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold truncate">
                              {r.full_name}
                            </div>
                            <div className="text-xs text-white/60 truncate">
                              {formatFecha(r.created_at)}
                            </div>
                          </div>
                        </div>

                        {/* Edad */}
                        <div className="col-span-6 md:col-span-2 text-white/80">
                          {age == null ? "—" : `${age} años`}
                        </div>

                        {/* Tel */}
                        <div className="col-span-6 md:col-span-2 flex items-center gap-2">
                          <Phone size={16} className="text-white/45" />
                          <span className="font-semibold">
                            {r.phone ?? "—"}
                          </span>
                        </div>

                        {/* Cat */}
                        <div className="col-span-6 md:col-span-2">
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold bg-[#D50032] text-white shadow-[0_12px_24px_rgba(213,0,50,.14)]">
                            {cat}
                          </span>
                        </div>

                        {/* Sede */}
                        <div className="col-span-6 md:col-span-1">
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold bg-black/35 border border-white/10 text-white">
                            {sede}
                          </span>
                        </div>

                        {/* Acciones */}
                        <div className="col-span-12 md:col-span-1 md:justify-end flex gap-2">
                          <button
                            onClick={() => copyPhone(r.phone ?? "")}
                            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
                            title="Copiar teléfono"
                          >
                            <Copy size={16} />
                          </button>

                          <button
                            onClick={() =>
                              alert(
                                `Jugador: ${r.full_name}\nTel: ${r.phone}\nSede: ${sede}\nCategoría: ${cat}`
                              )
                            }
                            className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center"
                            title="Ver"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <p className="text-center text-xs text-white/50 pt-1">
              Toluca Altas Montañas • Panel administrativo
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-2xl bg-black/40 border border-white/10 grid place-items-center">
        <Image src="/img/toluca-logo.png" alt="Toluca" width={34} height={34} />
      </div>
      <div className="min-w-0">
        <div className="font-extrabold leading-tight truncate">
          Toluca Altas Montañas
        </div>
        <div className="text-xs text-white/60">Admin Panel</div>
      </div>
    </div>
  );
}

function Nav() {
  const item =
    "w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-extrabold transition border";
  return (
    <nav className="space-y-2">
      <button
        className={cn(
          item,
          "bg-[#D50032] text-white border-[#D50032] shadow-[0_14px_30px_rgba(213,0,50,.18)]"
        )}
      >
        <LayoutDashboard size={18} />
        Dashboard
      </button>

      <button
        className={cn(
          item,
          "bg-white/0 text-white border-white/0 hover:bg-white/[0.06]"
        )}
      >
        <Users size={18} className="text-white/70" />
        Registros
      </button>

      <button
        className={cn(
          item,
          "bg-white/0 text-white border-white/0 hover:bg-white/[0.06]"
        )}
      >
        <MapPin size={18} className="text-white/70" />
        Sedes
      </button>

      <button
        className={cn(
          item,
          "bg-white/0 text-white border-white/0 hover:bg-white/[0.06]"
        )}
      >
        <Tags size={18} className="text-white/70" />
        Categorías
      </button>
    </nav>
  );
}

function Kpi({
  icon,
  title,
  value,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,.25)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-black/40 border border-white/10 grid place-items-center">
            {icon}
          </div>
          <div>
            <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-white/60">
              {title}
            </div>
            <div className="mt-1 text-3xl font-extrabold text-white">
              {value}
            </div>
          </div>
        </div>

        <span className="text-xs px-3 py-1 rounded-full font-bold bg-black/35 border border-white/10 text-white/60">
          {hint}
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full rounded-full overflow-hidden bg-white/10">
        <div className="h-full w-2/3 bg-[#D50032]" />
      </div>
    </div>
  );
}
