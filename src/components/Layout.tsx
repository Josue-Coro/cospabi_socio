import { NavLink, Navigate, Outlet } from "react-router-dom"
import { FileTextIcon, LogOutIcon, ReceiptIcon } from "lucide-react"
import { cn } from "cn"

import { Button } from "@/components/ui/button"
import { useSesion } from "@/lib/auth"

const MENU = [
  { ruta: "/", etiqueta: "Mis avisos", icono: FileTextIcon },
  { ruta: "/pagos", etiqueta: "Mis pagos", icono: ReceiptIcon },
]

/** Estructura de las páginas del portal: exige sesión del socio. */
export default function Layout() {
  const { socio, cargando, cerrarSesion } = useSesion()

  if (cargando) return <p className="p-6 text-muted-foreground">Cargando...</p>
  if (!socio) return <Navigate to="/login" replace />

  return (
    <div className="min-h-svh bg-muted/40 print:bg-white">
      <header className="border-b bg-background print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5">
          <div>
            <p className="font-semibold text-primary">COSPABI R.L.</p>
            <p className="text-xs text-muted-foreground">{socio.nombre_socio} · Cód. {socio.codigo_fijo}</p>
          </div>
          <Button variant="outline" size="sm" onClick={cerrarSesion}>
            <LogOutIcon /> Salir
          </Button>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-1 px-4 pb-2">
          {MENU.map((item) => (
            <NavLink
              key={item.ruta}
              to={item.ruta}
              end={item.ruta === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm hover:bg-muted",
                  isActive && "bg-primary/10 font-medium text-primary",
                )
              }
            >
              <item.icono className="size-4" /> {item.etiqueta}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl p-4 sm:p-6 print:p-0">
        <Outlet />
      </main>
    </div>
  )
}
