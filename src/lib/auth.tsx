import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

import { api, guardarToken, obtenerToken } from "@/lib/api"

export type Socio = {
  id_socio: number
  codigo_fijo: number
  nombre_socio: string
}

type Sesion = {
  socio: Socio | null
  cargando: boolean
  iniciarSesion: (usuario: string, contrasena: string) => Promise<void>
  cerrarSesion: () => void
}

const ContextoSesion = createContext<Sesion | null>(null)

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [socio, setSocio] = useState<Socio | null>(null)
  const [cargando, setCargando] = useState(true)

  // Al abrir la página, si hay un token guardado se recupera el socio
  useEffect(() => {
    if (!obtenerToken()) {
      setCargando(false)
      return
    }
    api<Socio>("/portal/yo")
      .then(setSocio)
      .catch(() => guardarToken(null))
      .finally(() => setCargando(false))
  }, [])

  async function iniciarSesion(usuario: string, contrasena: string) {
    const respuesta = await api<{ access_token: string }>("/portal/login", {
      method: "POST",
      body: JSON.stringify({ usuario, contrasena }),
    })
    guardarToken(respuesta.access_token)
    setSocio(await api<Socio>("/portal/yo"))
  }

  function cerrarSesion() {
    guardarToken(null)
    setSocio(null)
  }

  return (
    <ContextoSesion.Provider value={{ socio, cargando, iniciarSesion, cerrarSesion }}>
      {children}
    </ContextoSesion.Provider>
  )
}

export function useSesion() {
  const sesion = useContext(ContextoSesion)
  if (!sesion) throw new Error("useSesion debe usarse dentro de ProveedorSesion")
  return sesion
}
