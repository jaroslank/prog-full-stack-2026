import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { PacientesPage } from './pages/PacientesPage'
import { EspecialidadesPage } from './pages/EspecialidadesPage'
import { ServicosPage } from './pages/ServicosPage'
import { AgendamentosPage } from './pages/AgendamentosPage'
import { PerfilPage } from './pages/PerfilPage'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/pacientes" element={<PacientesPage />} />
                    <Route path="/especialidades" element={<EspecialidadesPage />} />
                    <Route path="/servicos" element={<ServicosPage />} />
                    <Route path="/agendamentos" element={<AgendamentosPage />} />
                    <Route path="/perfil" element={<PerfilPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
