import { Link, useParams } from "react-router-dom"
import { ArrowLeftIcon } from "lucide-react"

import { BotonImprimir, EstadoCarga } from "@/components/comunes"
import VistaFactura from "@/components/VistaFactura"
import { useDatos } from "@/lib/datos"
import type { FacturaDetalle } from "@/lib/tipos"

/** Factura emitida en oficina (simulada) para ver o imprimir desde el portal. */
export default function Factura() {
  const { id } = useParams()
  const factura = useDatos<FacturaDetalle>(`/portal/facturas/${id}`)

  if (!factura.datos) return <EstadoCarga cargando={factura.cargando} error={factura.error} />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/pagos" className="flex items-center gap-1 text-sm text-primary"><ArrowLeftIcon className="size-4" /> Mis pagos</Link>
        <BotonImprimir />
      </div>
      <VistaFactura f={factura.datos} />
    </div>
  )
}
