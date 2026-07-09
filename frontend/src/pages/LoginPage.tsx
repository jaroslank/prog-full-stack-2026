import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErro('')
    if (!email || !senha) {
      setErro('Preencha email e senha.')
      return
    }
    setLoading(true)
    try {
      await signIn(email, senha)
      navigate('/dashboard')
    } catch (err: any) {
      setErro(err.response?.data?.error ?? 'Credenciais inválidas.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow-sm" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <i className="bi bi-hospital text-primary" style={{ fontSize: '2.5rem' }}></i>
            <h4 className="mt-2 fw-bold">Clínica — Acesso</h4>
            <p className="text-muted small">Entre com suas credenciais de profissional</p>
          </div>

          {erro && <div className="alert alert-danger py-2">{erro}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label className="form-label fw-semibold">E-mail</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="profissional@clinica.com"
                autoFocus
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold">Senha</label>
              <input
                type="password"
                className="form-control"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="bi bi-box-arrow-in-right me-2"></i>
              )}
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
