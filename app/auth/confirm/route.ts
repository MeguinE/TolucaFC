import { createClient } from "@/lib/supabase/server";
// Crea el cliente de Supabase para el SERVIDOR (usa cookies y headers del request)

import { type EmailOtpType } from "@supabase/supabase-js";
// Tipo que define qué clase de OTP se está verificando
// (signup, recovery, magiclink, etc.)

import { redirect } from "next/navigation";
// Función de Next.js para redireccionar desde el servidor

import { type NextRequest } from "next/server";
// Tipo del objeto request que recibe una Route Handler

/**
 * Route Handler que maneja la verificación de email / OTP de Supabase
 * Se ejecuta cuando Supabase redirige al usuario después de hacer click en el email
 */
export async function GET(request: NextRequest) {
  // Obtiene los parámetros de la URL (?token_hash=...&type=...)
  const { searchParams } = new URL(request.url);

  // Token encriptado que envía Supabase por email
  const token_hash = searchParams.get("token_hash");

  // Tipo de verificación (signup, recovery, magiclink, etc.)
  const type = searchParams.get("type") as EmailOtpType | null;

  // Ruta a la que se debe redirigir después de verificar
  // Si no existe, redirige a "/"
  const next = searchParams.get("next") ?? "/";

  // Verifica que existan los parámetros necesarios
  if (token_hash && type) {
    // Inicializa Supabase en el servidor
    const supabase = await createClient();

    // Verifica el OTP con Supabase
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Si la verificación fue exitosa:
      // redirige al usuario a la ruta indicada o al inicio
      redirect(next);
    } else {
      // Si hubo error al verificar el token:
      // redirige a una página de error con el mensaje
      redirect(`/auth/error?error=${error?.message}`);
    }
  }

  // Si falta el token o el tipo:
  // redirige a una página de error
  redirect(`/auth/error?error=No token hash or type`);
}
