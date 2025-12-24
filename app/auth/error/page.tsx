import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Componentes de UI para mostrar el error dentro de una tarjeta

import { Suspense } from "react";
// Suspense permite renderizar contenido async con fallback (aunque aquí no se define uno)

/**
 * Componente async que muestra el contenido del error
 * Lee los parámetros de la URL (?error=...)
 */
async function ErrorContent({
  searchParams,
}: {
  // searchParams llega como una Promise en App Router
  searchParams: Promise<{ error: string }>;
}) {
  // Se esperan los parámetros de la URL
  const params = await searchParams;

  return (
    <>
      {/* Si existe un parámetro "error", se muestra */}
      {params?.error ? (
        <p className="text-sm text-muted-foreground">
          Code error: {params.error}
        </p>
      ) : (
        // Si no hay mensaje específico
        <p className="text-sm text-muted-foreground">
          An unspecified error occurred.
        </p>
      )}
    </>
  );
}

/**
 * Página de error principal
 * Se muestra cuando ocurre un error de autenticación u otro flujo
 */
export default function Page({
  searchParams,
}: {
  // searchParams contiene los parámetros de la URL (?error=...)
  searchParams: Promise<{ error: string }>;
}) {
  return (
    // Contenedor centrado vertical y horizontalmente
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          {/* Tarjeta que muestra el mensaje de error */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Sorry, something went wrong.
              </CardTitle>
            </CardHeader>

            <CardContent>
              {/* Suspense permite usar un componente async dentro del render */}
              <Suspense>
                <ErrorContent searchParams={searchParams} />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
