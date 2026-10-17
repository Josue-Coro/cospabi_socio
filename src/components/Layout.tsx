import { Navigate, Outlet } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useSesion } from "@/lib/auth"

/** Estructura de las páginas protegidas: exige sesión iniciada. */
export default function Layout() {
  const { socio, cargando, cerrarSesion } = useSesion()

  if (cargando) return <p className="p-6 text-muted-foreground">Cargando...</p>
  if (!socio) return <Navigate to="/login" replace />

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="flex items-center justify-between border-b bg-background px-4 py-3">
        <span className="font-semibold">COSPABI R.L. · Portal del Socio</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">
            {socio.nombre_socio} · Cód. {socio.codigo_fijo}
          </span>
          <Button variant="outline" size="sm" onClick={cerrarSesion}>
            Cerrar sesión
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  )
}
