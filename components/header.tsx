"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const links = [
  { href: "#about",    label: "Nosotros",   id: "about"    },
  { href: "#training", label: "Categorías", id: "training" },
  { href: "#registro", label: "Registro",   id: "registro" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Sección activa con IntersectionObserver
  useEffect(() => {
    const ids = links.map((l) => l.id);
    const observers: IntersectionObserver[] = [];

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const close = () => setOpen(false);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-black/80 backdrop-blur-md border-b border-white/10 shadow-[0_4px_24px_rgba(0,0,0,.4)]"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-10 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0" onClick={close}>
            <Image
              src="/img/toluca-logo.png"
              alt="Toluca Altas Montañas"
              width={36}
              height={36}
              className="h-9 w-9 object-contain drop-shadow-[0_0_8px_rgba(255,0,0,0.5)]"
            />
            <span className="hidden sm:block text-white font-extrabold tracking-tight leading-tight text-sm">
              Toluca <span className="text-[#FF2A4D]">Altas Montañas</span>
            </span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative px-4 py-2 rounded-xl text-sm font-semibold transition",
                  activeSection === l.id
                    ? "text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {l.label}
                {/* Indicador activo */}
                {activeSection === l.id && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-[#FF2A4D]" />
                )}
              </Link>
            ))}

            <Link
              href="/auth/login"
              className={cn(
                "ml-3 h-9 px-4 rounded-xl inline-flex items-center justify-center",
                "text-sm font-extrabold text-white",
                "bg-[#D50032] hover:bg-[#B8002A] transition",
                "shadow-[0_8px_20px_rgba(213,0,50,.25)]"
              )}
            >
              🔐 Admin
            </Link>
          </nav>

          {/* Hamburguesa */}
          <button
            className="md:hidden h-10 w-10 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 transition grid place-items-center text-white"
            onClick={() => setOpen(true)}
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Drawer mobile */}
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
          <div className="absolute right-0 top-0 h-full w-72 bg-zinc-950 border-l border-white/10 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Image src="/img/toluca-logo.png" alt="Logo" width={32} height={32} className="h-8 w-8 object-contain" />
                <span className="text-sm font-extrabold text-white">
                  Toluca <span className="text-[#FF2A4D]">AM</span>
                </span>
              </div>
              <button
                onClick={close}
                className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition grid place-items-center text-white"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 p-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition",
                    activeSection === l.id
                      ? "bg-white/10 text-white"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {activeSection === l.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#FF2A4D]" />
                  )}
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto p-4 border-t border-white/10">
              <Link
                href="/auth/login"
                onClick={close}
                className="flex items-center justify-center gap-2 h-11 w-full rounded-xl bg-[#D50032] hover:bg-[#B8002A] text-white font-extrabold text-sm transition shadow-[0_8px_20px_rgba(213,0,50,.25)]"
              >
                🔐 Panel Admin
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
