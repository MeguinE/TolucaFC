"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export default function TiltCard({ children, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = ref.current;
    const glow = glowRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const rotX = ((y - cy) / cy) * -10; // max ±10deg
    const rotY = ((x - cx) / cx) * 10;

    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.03,1.03,1.03)`;

    if (glow) {
      const pctX = Math.round((x / rect.width) * 100);
      const pctY = Math.round((y / rect.height) * 100);
      glow.style.opacity = "1";
      glow.style.background = `radial-gradient(200px circle at ${pctX}% ${pctY}%, rgba(255,255,255,0.10), transparent 60%)`;
    }
  };

  const handleMouseLeave = () => {
    const card = ref.current;
    const glow = glowRef.current;
    if (card) {
      card.style.transform =
        "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
    }
    if (glow) glow.style.opacity = "0";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative", className)}
      style={{ transition: "transform 0.15s ease-out", willChange: "transform" }}
    >
      {children}

      {/* Capa de brillo que sigue al cursor */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 rounded-3xl opacity-0"
        style={{ transition: "opacity 0.2s ease" }}
      />
    </div>
  );
}
