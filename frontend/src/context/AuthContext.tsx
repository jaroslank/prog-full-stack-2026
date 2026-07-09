import { createContext, useContext, useState, type ReactNode } from 'react'
import { login as apiLogin } from '../api/profissionais'

interface AuthContextType {
  token: string | null
  signIn: (email: string, senha: string) => Promise<void>
  signOut: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('token')
  )

  const signIn = async (email: string, senha: string) => {
    const res = await apiLogin(email, senha)
    const t = res.data.token
    localStorage.setItem('token', t)
    setToken(t)
  }

  const signOut = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, signIn, signOut, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
