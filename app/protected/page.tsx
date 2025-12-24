import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/admin/dashboard";

async function ProtectedGate() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return <Dashboard />;
}

export default function ProtectedPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center text-white">
          Cargando panel…
        </div>
      }
    >
      <ProtectedGate />
    </Suspense>
  );
}
