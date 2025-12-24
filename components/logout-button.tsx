"use client"; // Se ejecuta en el navegador (usa router y eventos click)

import { createClient } from "@/lib/supabase/client"; // Cliente Supabase para usar Auth en el frontend
import { Button } from "@/components/ui/button"; // Botón UI
import { useRouter } from "next/navigation"; // Para redirigir después de cerrar sesión

export function LogoutButton() {
  const router = useRouter(); // Instancia del router de Next.js

  const logout = async () => {
    const supabase = createClient(); // Crea cliente Supabase
    await supabase.auth.signOut(); // Cierra la sesión actual (borra tokens/cookies según config)
    router.push("/auth/login"); // Redirige a la pantalla de login
  };

  return <Button onClick={logout}>Logout</Button>; // Botón que ejecuta logout al hacer click
}
