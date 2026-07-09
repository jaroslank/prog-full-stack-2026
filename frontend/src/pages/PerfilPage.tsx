import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { profissionalApi, type Profissional } from '../api/profissionais'

export function PerfilPage() {
  const [profissional, setProfissional] = useState<Profissional | null>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [saving, setSaving] = useState(false)
  const [uploadingSenha, setUploadingSenha] = useState(false)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // We'll use id=1 as a placeholder; in a real app, decode from JWT
  const getId = () => {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload.profissionalId as number
    } catch {
      return null
    }
  }

  const id = getId()

  const carregar = () => {
    if (!id) return
    setLoading(true)
    profissionalApi.buscar(id)
      .then((r) => {
        setProfissional(r.data)
        setForm({ nome: r.data.nome ?? '', email: r.data.email, senha: '' })
      })
      .catch(() => setErro('Erro ao carregar perfil.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const salvar = async (e: FormEvent) => {
    e.preventDefault()
    setSucesso('')
    setErro('')
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setErro('E-mail inválido.')
      return
    }
    if (form.senha && form.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }
    setSaving(true)
    try {
      const payload: Record<string, string> = { nome: form.nome, email: form.email }
      if (form.senha) payload.senha = form.senha
      await profissionalApi.atualizar(id!, payload)
      setSucesso('Perfil atualizado com sucesso!')
      setForm((f) => ({ ...f, senha: '' }))
    } catch (err: any) {
      setErro(err.response?.data?.error ?? 'Erro ao atualizar.')
    } finally {
      setSaving(false)
    }
  }

  const handleFotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setFotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const uploadFoto = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file || !id) return
    setUploadingSenha(true)
    setSucesso('')
    setErro('')
    try {
      const res = await profissionalApi.uploadFoto(id, file)
      setProfissional(res.data)
      setSucesso('Foto atualizada com sucesso!')
      setFotoPreview(null)
      if (fileRef.current) fileRef.current.value = ''
    } catch (err: any) {
      setErro(err.response?.data?.error ?? 'Erro ao enviar foto.')
    } finally {
      setUploadingSenha(false)
    }
  }

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>

  return (
    <div>
      <h4 className="page-title fw-bold mb-4">Meu Perfil</h4>

      {erro && <div className="alert alert-danger">{erro}</div>}
      {sucesso && <div className="alert alert-success">{sucesso}</div>}

      <div className="row g-4">
        {/* Foto */}
        <div className="col-12 col-md-4">
          <div className="card shadow-sm border-0 text-center p-4">
            <div className="mb-3">
              {fotoPreview ? (
                <img src={fotoPreview} className="rounded-circle border" style={{ width: 120, height: 120, objectFit: 'cover' }} alt="preview" />
              ) : profissional?.foto ? (
                <img src={`/uploads/${profissional.foto}`} className="rounded-circle border" style={{ width: 120, height: 120, objectFit: 'cover' }} alt="foto" />
              ) : (
                <div className="rounded-circle bg-primary bg-opacity-10 d-inline-flex align-items-center justify-content-center" style={{ width: 120, height: 120 }}>
                  <i className="bi bi-person-fill text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
              )}
            </div>
            <p className="fw-semibold mb-1">{profissional?.nome}</p>
            <p className="text-muted small mb-3">{profissional?.email}</p>
            <input
              type="file"
              accept="image/*"
              className="form-control form-control-sm mb-2"
              ref={fileRef}
              onChange={handleFotoChange}
            />
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={uploadFoto}
              disabled={!fotoPreview || uploadingSenha}
            >
              {uploadingSenha ? <span className="spinner-border spinner-border-sm me-1"></span> : <i className="bi bi-upload me-1"></i>}
              Enviar Foto
            </button>
          </div>
        </div>

        {/* Formulário */}
        <div className="col-12 col-md-8">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <h6 className="fw-bold mb-3">Dados do Perfil</h6>
              <form onSubmit={salvar} noValidate>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Nome</label>
                  <input className="form-control" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">E-mail <span className="text-danger">*</span></label>
                  <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Nova Senha</label>
                  <input
                    type="password"
                    className="form-control"
                    value={form.senha}
                    onChange={(e) => setForm({ ...form, senha: e.target.value })}
                    placeholder="Deixe em branco para não alterar"
                  />
                  <div className="form-text">Mínimo 6 caracteres.</div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving && <span className="spinner-border spinner-border-sm me-2"></span>}
                  <i className="bi bi-floppy me-1"></i>Salvar Alterações
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
