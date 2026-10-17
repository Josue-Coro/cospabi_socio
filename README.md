# cospabi_socio

Portal del Socio del MVP de la Cooperativa de Agua Potable **COSPABI R.L.**
(React + TypeScript + Vite + Tailwind CSS + shadcn/ui). El socio ingresa con su
código fijo, consulta sus avisos de cobranza y pagos, y paga con QR.
Consume la API `cospabi-mvp-backend`.

Desplegado en https://cospabi-socio.vercel.app

## Pantallas

- **Mis avisos:** deuda pendiente y avisos; se paga primero el más antiguo.
- **Aviso:** detalle (consumo, cargos extra, cuota de inscripción) y **pago con QR** mediante
  Libélula: el socio indica si quiere factura (CI/NIT y razón social), escanea el QR con la app de
  su banco o abre la pasarela, y la página se actualiza sola cuando Libélula confirma el pago.
- **Mis pagos:** historial con la factura de Libélula o la emitida en oficina.

## Ejecutar en local

```bash
npm install
cp .env.example .env      # ajustar VITE_API_URL si la API no está en localhost:8000
npm run dev
```

## Despliegue en Vercel

- Framework: Vite (build `npm run build`, salida `dist`).
- Variable de entorno: `VITE_API_URL` = URL de la API en Render.
- `vercel.json` redirige todas las rutas a `index.html` (React Router).
