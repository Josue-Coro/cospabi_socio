import { Link, useParams } from "react-router-dom"
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react"

import { BotonImprimir, Estado, EstadoCarga, Panel } from "@/components/comunes"
import PagoQR from "@/components/PagoQR"
import { useDatos } from "@/lib/datos"
import { bs, fecha, fechaHora } from "@/lib/formato"
import type { Aviso, AvisoDetalle as TipoAviso } from "@/lib/tipos"

export default function AvisoDetalle() {
  const { id } = useParams()
  const aviso = useDatos<TipoAviso>(`/portal/avisos/${id}`)
  const todos = useDatos<Aviso[]>("/portal/avisos")
  const a = aviso.datos

  if (!a) return <EstadoCarga cargando={aviso.cargando} error={aviso.error} />

  const abierto = a.estado === "PENDIENTE" || a.estado === "VENCIDO"
  // Solo se puede pagar el aviso pendiente más antiguo
  const anterior = todos.datos?.find(
    (otro) => otro.id_aviso !== a.id_aviso && (otro.estado === "PENDIENTE" || otro.estado === "VENCIDO")
      && clave(otro.periodo) < clave(a.periodo),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between print:hidden">
        <Link to="/" className="flex items-center gap-1 text-sm text-primary"><ArrowLeftIcon className="size-4" /> Mis avisos</Link>
        <BotonImprimir />
      </div>

      <Panel>
        <div className="mb-3 flex items-start justify-between border-b pb-3">
          <div>
            <p className="font-semibold">COOPERATIVA DE AGUA POTABLE COSPABI R.L.</p>
            <p className="text-xs text-muted-foreground">Aviso de cobranza N° {a.id_aviso} · periodo {a.periodo}</p>
          </div>
          <Estado valor={a.estado} />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Dato nombre="Código fijo" valor={a.socio.codigo_fijo} />
          <Dato nombre="Categoría" valor={a.socio.categoria} />
          <Dato nombre="Emisión" valor={fecha(a.fecha_emision)} />
          <Dato nombre="Vencimiento" valor={fecha(a.fecha_vencimiento)} />
        </div>
        {a.lectura && (
          <div className="mb-3 grid grid-cols-3 gap-2 rounded-lg bg-muted p-3 text-center text-sm">
            <Dato nombre="Lectura anterior" valor={`${a.lectura.lectura_anterior} m³`} />
            <Dato nombre="Lectura actual" valor={`${a.lectura.lectura_actual} m³`} />
            <Dato nombre="Consumo" valor={`${a.lectura.consumo_m3} m³`} />
          </div>
        )}
        <ul className="space-y-1.5 text-sm">
          <li className="flex justify-between"><span>Consumo de agua</span><span>{bs(a.total_consumo)}</span></li>
          {a.cargos.map((c) => (
            <li key={c.id_cargo_extra} className="flex justify-between"><span>{c.descripcion}</span><span>{bs(c.monto)}</span></li>
          ))}
          {a.cuotas_inscripcion.map((c) => (
            <li key={c.num_cuota} className="flex justify-between"><span>Cuota {c.num_cuota} de 4 de inscripción</span><span>{bs(c.monto)}</span></li>
          ))}
          <li className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span>{bs(a.total_aviso)}</span></li>
        </ul>
        {a.pago && (
          <p className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-sm">
            Pagado el {fechaHora(a.pago.fecha_pago)} con {a.pago.metodo}.{" "}
            {a.pago.factura_url && (
              <a href={a.pago.factura_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary underline">
                Ver factura <ExternalLinkIcon className="size-3.5" />
              </a>
            )}
            {!a.pago.factura_url && a.pago.id_factura && (
              <Link to={`/facturas/${a.pago.id_factura}`} className="text-primary underline">Ver factura</Link>
            )}
          </p>
        )}
      </Panel>

      {abierto && (
        <div className="print:hidden">
          {anterior ? (
            <Panel className="border-amber-300 bg-amber-50 text-sm">
              Primero debe pagar el aviso más antiguo ({anterior.periodo}).{" "}
              <Link to={`/avisos/${anterior.id_aviso}`} className="font-medium text-primary underline">Ir a ese aviso</Link>
            </Panel>
          ) : (
            <PagoQR
              key={a.id_aviso}
              idAviso={a.id_aviso}
              nombreSocio={a.socio.nombre_socio}
              pendiente={a.pago_qr_pendiente}
              alPagar={() => { aviso.recargar(); todos.recargar() }}
            />
          )}
        </div>
      )}
    </div>
  )
}

function clave(periodo: string) {
  const [mes, anio] = periodo.split("/")
  return Number(anio) * 100 + Number(mes)
}

function Dato({ nombre, valor }: { nombre: string; valor: string | number }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{nombre}</p>
      <p className="font-medium">{valor}</p>
    </div>
  )
}
