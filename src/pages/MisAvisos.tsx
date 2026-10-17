import { useSesion } from "@/lib/auth"

export default function MisAvisos() {
  const { socio } = useSesion()

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold">Hola, {socio?.nombre_socio}</h1>
      <p className="text-muted-foreground">
        Código fijo {socio?.codigo_fijo}. Aquí verá sus avisos de cobranza y podrá pagarlos con QR.
      </p>
    </div>
  )
}
