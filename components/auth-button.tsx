import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  // Crea el cliente de Supabase en el servidor (Server Component).
  const supabase = await createClient();

  // Obtiene los “claims” del usuario autenticado (si hay sesión).
  const { data } = await supabase.auth.getClaims();

  // Si existe sesión, aquí vienen los datos del usuario (por ejemplo, email).
  const user = data?.claims;

  // Si hay usuario: muestra saludo + botón de cerrar sesión.
  // Si no hay usuario: muestra botones para iniciar sesión o registrarse.
  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
