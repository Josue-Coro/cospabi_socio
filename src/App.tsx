import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Layout from "@/components/Layout"
import { Toaster } from "@/components/ui/sonner"
import { ProveedorSesion } from "@/lib/auth"
import AvisoDetalle from "@/pages/AvisoDetalle"
import Factura from "@/pages/Factura"
import Login from "@/pages/Login"
import MisAvisos from "@/pages/MisAvisos"
import MisPagos from "@/pages/MisPagos"

export default function App() {
  return (
    <ProveedorSesion>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<MisAvisos />} />
            <Route path="/avisos/:id" element={<AvisoDetalle />} />
            <Route path="/pagos" element={<MisPagos />} />
            <Route path="/facturas/:id" element={<Factura />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </ProveedorSesion>
  )
}
