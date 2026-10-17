import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import Layout from "@/components/Layout"
import { ProveedorSesion } from "@/lib/auth"
import MisAvisos from "@/pages/MisAvisos"
import Login from "@/pages/Login"

export default function App() {
  return (
    <ProveedorSesion>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route index element={<MisAvisos />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProveedorSesion>
  )
}
