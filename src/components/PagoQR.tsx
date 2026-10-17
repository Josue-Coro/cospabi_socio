import { useEffect, useRef, useState, type FormEvent } from "react"
import { CheckCircle2Icon, ExternalLinkIcon, Loader2Icon, QrCodeIcon } from "lucide-react"
import { toast } from "sonner"

import { Campo, Panel, Seleccion } from "@/components/comunes"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { enviar } from "@/lib/datos"
import { bs } from "@/lib/formato"
import type { PagoQr } from "@/lib/tipos"

const SEGUNDOS_CONSULTA = 5

/** Pago de un aviso con QR mediante Libélula: datos de factura → QR → confirmación automática. */
export default function PagoQR({
  idAviso,
  nombreSocio,
  pendiente,
  alPagar,
}: {
  idAviso: number
  nombreSocio: string
  pendiente: PagoQr | null | undefined
  alPagar: () => void
}) {
  const [pago, setPago] = useState<PagoQr | null>(pendiente ?? null)
  const [conFactura, setConFactura] = useState(false)
  const [tipoDocumento, setTipoDocumento] = useState<"CI" | "NIT">("CI")
  const [documento, setDocumento] = useState("")
  const [razon, setRazon] = useState(nombreSocio)
  const [generando, setGenerando] = useState(false)
  // Se guarda en una referencia para no reiniciar la consulta en cada render del padre
  const avisarPago = useRef(alPagar)
  useEffect(() => {
    avisarPago.current = alPagar
  })

  // Mientras el QR espera el pago, se consulta el estado cada pocos segundos
  useEffect(() => {
    if (pago?.estado !== "PENDIENTE") return
    const id = pago.id_pago
    const temporizador = window.setInterval(async () => {
      try {
        const actual = await api<PagoQr>(`/portal/pagos-qr/${id}`)
        if (actual.estado !== "PENDIENTE") {
          setPago(actual)
          if (actual.estado === "APROBADO") {
            toast.success("¡Pago confirmado! Gracias.")
            avisarPago.current()
          }
        }
      } catch {
        // Si falla una consulta se reintenta en la siguiente vuelta
      }
    }, SEGUNDOS_CONSULTA * 1000)
    return () => window.clearInterval(temporizador)
  }, [pago])

  async function generar(evento: FormEvent) {
    evento.preventDefault()
    setGenerando(true)
    const nuevo = await enviar<PagoQr>(`/portal/avisos/${idAviso}/pagar-qr`, {
      con_factura: conFactura,
      tipo_documento: tipoDocumento,
      nit_ci: conFactura ? documento : null,
      razon_social: conFactura ? razon : null,
    }, "QR generado. Escanéelo con la app de su banco.")
    setGenerando(false)
    if (nuevo) setPago(nuevo)
  }

  if (pago?.estado === "APROBADO") {
    return (
      <Panel className="border-emerald-300 bg-emerald-50">
        <p className="flex items-center gap-2 font-medium text-emerald-800">
          <CheckCircle2Icon className="size-5" /> Pago de {bs(pago.monto)} confirmado por Libélula.
        </p>
        {pago.factura_url && (
          <a href={pago.factura_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm text-primary underline">
            Ver factura <ExternalLinkIcon className="size-3.5" />
          </a>
        )}
      </Panel>
    )
  }

  if (pago?.estado === "PENDIENTE") {
    return (
      <Panel>
        <h2 className="mb-1 font-semibold">Pague con QR</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Escanee el código con la aplicación de su banco. La página se actualiza sola cuando el pago se confirma.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          {pago.qr_url && (
            <img src={pago.qr_url} alt="Código QR para pagar el aviso" className="size-56 rounded-lg border bg-white p-2" />
          )}
          <div className="flex flex-col gap-2 text-sm">
            <p>Monto: <b className="text-lg">{bs(pago.monto)}</b></p>
            {pago.codigo_recaudacion && <p>Código de recaudación: <b className="font-mono">{pago.codigo_recaudacion}</b></p>}
            <p className="flex items-center gap-2 text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" /> Esperando la confirmación del pago...
            </p>
            {pago.url_pasarela && (
              <a href={pago.url_pasarela} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline" })}>
                Pagar en la pasarela de Libélula <ExternalLinkIcon />
              </a>
            )}
            <Button variant="ghost" size="sm" onClick={() => setPago(null)}>Generar otro QR</Button>
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <Panel>
      <h2 className="mb-1 font-semibold">Pagar con QR</h2>
      {pago?.estado === "EXPIRADO" && (
        <p className="mb-2 text-sm text-amber-700">El QR anterior venció. Genere uno nuevo.</p>
      )}
      <form onSubmit={generar} className="grid gap-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={conFactura} onChange={(e) => setConFactura(e.target.checked)} />
          ¿Desea factura?
        </label>
        {conFactura && (
          <div className="grid gap-3 sm:grid-cols-[auto_1fr_2fr]">
            <Campo etiqueta="Documento">
              <Seleccion value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value as "CI" | "NIT")}>
                <option value="CI">CI</option>
                <option value="NIT">NIT</option>
              </Seleccion>
            </Campo>
            <Campo etiqueta={tipoDocumento === "NIT" ? "NIT" : "N° de CI"}>
              <Input value={documento} onChange={(e) => setDocumento(e.target.value)} inputMode="numeric"
                pattern="[0-9A-Za-z\-]{3,20}" required />
            </Campo>
            <Campo etiqueta="Razón social">
              <Input value={razon} onChange={(e) => setRazon(e.target.value)} minLength={2} required />
            </Campo>
          </div>
        )}
        <Button type="submit" size="lg" disabled={generando}>
          <QrCodeIcon /> {generando ? "Generando QR..." : "Generar QR de pago"}
        </Button>
      </form>
    </Panel>
  )
}
