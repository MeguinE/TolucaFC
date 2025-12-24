// Importa componentes UI tipo “Card” (tarjeta) desde tu carpeta de componentes.
// Normalmente estos vienen de shadcn/ui o una librería similar, pero en tu proyecto
// están ubicados en "@/components/ui/card".
import {
  Card,              // Componente contenedor principal de la tarjeta
  CardContent,       // Sección donde va el contenido (texto, botones, etc.)
  CardDescription,   // Texto descriptivo más pequeño, debajo del título
  CardHeader,        // Encabezado de la tarjeta (título + descripción)
  CardTitle,         // Título principal de la tarjeta
} from "@/components/ui/card";

// Exporta la página (en Next.js App Router, este archivo suele representar una ruta)
export default function Page() {
  return (
    // Contenedor principal centrado en la pantalla:
    // - flex: usa Flexbox
    // - min-h-svh: altura mínima igual al alto del viewport (mejor en móviles que vh)
    // - w-full: ancho completo
    // - items-center + justify-center: centra el contenido vertical y horizontalmente
    // - p-6 / md:p-10: padding normal y padding mayor en pantallas medianas+
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      
      {/* Contenedor que limita el ancho del contenido para que no se vea gigante */}
      <div className="w-full max-w-sm">

        {/* Contenedor en columna con separación (gap) entre elementos */}
        <div className="flex flex-col gap-6">

          {/* Tarjeta visual para mostrar el mensaje de confirmación */}
          <Card>

            {/* Encabezado de la tarjeta: incluye título y descripción */}
            <CardHeader>
              {/* Título grande: text-2xl aumenta tamaño de letra */}
              <CardTitle className="text-2xl">
                Thank you for signing up!
              </CardTitle>

              {/* Descripción breve debajo del título */}
              <CardDescription>Check your email to confirm</CardDescription>
            </CardHeader>

            {/* Contenido principal de la tarjeta */}
            <CardContent>
              {/* Párrafo con texto pequeño y color “apagado” (muted) */}
              <p className="text-sm text-muted-foreground">
                {/* &apos; es la forma segura en JSX para escribir comilla simple (') */}
                You&apos;ve successfully signed up. Please check your email to
                confirm your account before signing in.
              </p>
            </CardContent>

          </Card>
        </div>
      </div>
    </div>
  );
}
