import { Link } from "react-router-dom"
import { QrCodeIcon } from "lucide-react"

import { Estado, EstadoCarga, Panel } from "@/components/comunes"
import { buttonVariants } from "@/components/ui/button"
import { useSesion } from "@/lib/auth"
import { useDatos } from "@/lib/datos"
import { bs, fecha, ordenarPeriodos } from "@/lib/formato"
import type { Aviso } from "@/lib/tipos"

export default function MisAvisos() {
  const { socio } = useSesion()
  const avisos = useDatos<Aviso[]>("/portal/avisos")

  const lista = avisos.datos ? ordenarPeriodos(avisos.datos) : []
  const porPagar = lista.filter((a) => a.estado === "PENDIENTE" || a.estado === "VENCIDO")
  const deuda = porPagar.reduce((total, a) => total + a.total_aviso, 0)
  // Se paga primero el aviso más antiguo
  const siguiente = porPagar[porPagar.length - 1]

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Hola, {socio?.nombre_socio}</h1>
        <p className="text-sm text-muted-foreground">Consulte sus avisos de cobranza y páguelos con QR.</p>
      </div>

      {avisos.datos && (
        <Panel className={deuda > 0 ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}>
          {deuda > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm">Deuda pendiente ({porPagar.length} {porPagar.length === 1 ? "aviso" : "avisos"})</p>
                <p className="text-2xl font-semibold">{bs(deuda)}</p>
              </div>
              {siguiente && (
                <Link to={`/avisos/${siguiente.id_aviso}`} className={buttonVariants({ size: "lg" })}>
                  <QrCodeIcon /> Pagar {siguiente.periodo} con QR
                </Link>
              )}
            </div>
          ) : (
            <p className="font-medium text-emerald-800">Está al día. No tiene avisos pendientes de pago.</p>
          )}
        </Panel>
      )}

      <div className="grid gap-3">
        {lista.map((a) => (
          <Link key={a.id_aviso} to={`/avisos/${a.id_aviso}`}>
            <Panel className="transition hover:border-primary">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">Periodo {a.periodo}</p>
                  <p className="text-xs text-muted-foreground">
                    Aviso N° {a.id_aviso} · consumo {a.consumo_m3 ?? "—"} m³ · vence {fecha(a.fecha_vencimiento)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{bs(a.total_aviso)}</p>
                  <Estado valor={a.estado} />
                </div>
              </div>
            </Panel>
          </Link>
        ))}
      </div>
      <EstadoCarga cargando={avisos.cargando} error={avisos.error} vacio={avisos.datos?.length === 0}
        textoVacio="Todavía no tiene avisos de cobranza." />
    </div>
  )
}
