import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export function EnvVarWarning() {
  return (
    // Contenedor horizontal con separación y alineación centrada
    <div className="flex gap-4 items-center">
      {/* Etiqueta (badge) que avisa que faltan variables de entorno */}
      <Badge variant="outline" className="font-normal">
        Supabase environment variables required
      </Badge>

      {/* Botones deshabilitados (solo informativos, no clickeables) */}
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled>
          Sign in
        </Button>
        <Button size="sm" variant="default" disabled>
          Sign up
        </Button>
      </div>
    </div>
  );
}
