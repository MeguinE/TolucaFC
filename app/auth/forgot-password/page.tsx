import { ForgotPasswordForm } from "@/components/forgot-password-form";
// Importa el componente del formulario para recuperar contraseña

/**
 * Página de "Forgot Password"
 * Muestra el formulario centrado en pantalla
 */
export default function Page() {
  return (
    // Contenedor principal centrado vertical y horizontalmente
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      {/* Limita el ancho del contenido */}
      <div className="w-full max-w-sm">
        {/* Formulario para solicitar recuperación de contraseña */}
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
