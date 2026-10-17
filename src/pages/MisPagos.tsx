import { Link } from "react-router-dom"
import { ExternalLinkIcon } from "lucide-react"

import { EstadoCarga, Panel } from "@/components/comunes"
import { useDatos } from "@/lib/datos"
import { bs, fechaHora } from "@/lib/formato"

type PagoPortal = {
  id_pago: number
  fecha_pago: string
  id_aviso: number
  periodo: string
  monto_pagado: number
  metodo: string
  forma_pago: string | null
  id_factura: number | null
  factura_url: string | null
}

export default function MisPagos() {
  const pagos = useDatos<PagoPortal[]>("/portal/pagos")

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Mis pagos</h1>
        <p className="text-sm text-muted-foreground">Historial de pagos en oficina y desde el portal, con su factura.</p>
      </div>
      <div className="grid gap-3">
        {pagos.datos?.map((p) => (
          <Panel key={p.id_pago}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">Periodo {p.periodo} · {bs(p.monto_pagado)}</p>
                <p className="text-xs text-muted-foreground">
                  {fechaHora(p.fecha_pago)} · {p.metodo} · {p.forma_pago === "PORTAL" ? "desde el portal" : "en oficina"}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-sm">
                <Link to={`/avisos/${p.id_aviso}`} className="text-primary underline">Ver aviso</Link>
                {p.factura_url ? (
                  <a href={p.factura_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">
                    Factura <ExternalLinkIcon className="size-3.5" />
                  </a>
                ) : p.id_factura ? (
                  <Link to={`/facturas/${p.id_factura}`} className="text-primary underline">Factura</Link>
                ) : (
                  <span className="text-xs text-muted-foreground">Sin factura</span>
                )}
              </div>
            </div>
          </Panel>
        ))}
      </div>
      <EstadoCarga cargando={pagos.cargando} error={pagos.error} vacio={pagos.datos?.length === 0}
        textoVacio="Todavía no tiene pagos registrados." />
    </div>
  )
}
