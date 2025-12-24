"use client"; // Se ejecuta en el navegador (usa hooks, eventos, window y router)

import { cn } from "@/lib/utils"; // Une className (Tailwind) de forma segura
import { createClient } from "@/lib/supabase/client"; // Cliente Supabase para Auth en frontend
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Componentes UI tipo tarjeta
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Inputs y labels del formulario
import Link from "next/link"; // Navegación sin recargar
import { useRouter } from "next/navigation"; // Redirección programática
import { useState } from "react"; // Estado local

/**
 * Formulario de registro de usuarios usando Supabase Auth
 */
export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  // Estados para los campos del formulario (inputs controlados)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  // Estado para errores y loading
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter(); // Para mandar al usuario a otra ruta

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita recargar la página al enviar el form

    const supabase = createClient(); // Inicializa Supabase (cliente)
    setIsLoading(true); // Activa loading (deshabilita botón)
    setError(null); // Limpia errores previos

    // Validación básica: ambas contraseñas deben coincidir
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      // Crea la cuenta en Supabase Auth y configura la URL de redirección del email de confirmación
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Después de confirmar el correo, Supabase redirige a esta ruta
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      });

      if (error) throw error;

      // Registro iniciado: manda a pantalla de “revisa tu correo / éxito”
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      // Convierte el error a texto para mostrarlo en UI
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false); // Quita loading pase lo que pase
    }
  };

  return (
    // cn combina clases base con className opcional
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>

        <CardContent>
          {/* Form: al enviar ejecuta handleSignUp */}
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              {/* Input controlado: email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} // Actualiza estado email
                />
              </div>

              {/* Input controlado: password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} // Actualiza estado password
                />
              </div>

              {/* Input controlado: repetir password */}
              <div className="grid gap-2">
                <Label htmlFor="repeat-password">Repeat Password</Label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)} // Actualiza estado repeatPassword
                />
              </div>

              {/* Muestra error si existe */}
              {error && <p className="text-sm text-red-500">{error}</p>}

              {/* Deshabilita mientras isLoading=true para evitar doble submit */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating an account..." : "Sign up"}
              </Button>
            </div>

            {/* Link para ir a Login */}
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
