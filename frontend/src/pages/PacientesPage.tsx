import { useEffect, useState, type FormEvent } from 'react'
import { pacienteApi, type Paciente } from '../api/pacientes'

interface FormState {
  nome: string
  email: string
  telefone: string
  cpf: string
}

const emptyForm: FormState = { nome: '', email: '', telefone: '', cpf: '' }

export function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formErro, setFormErro] = useState('')
  const [saving, setSaving] = useState(false)
  const [busca, setBusca] = useState('')

  const carregar = () => {
    setLoading(true)
    pacienteApi.listar()
      .then((r) => setPacientes(r.data))
      .catch(() => setErro('Erro ao carregar pacientes.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setForm(emptyForm)
    setEditId(null)
    setFormErro('')
    setShowModal(true)
  }

  const abrirEditar = (p: Paciente) => {
    setForm({ nome: p.nome, email: p.email, telefone: p.telefone ?? '', cpf: p.cpf ?? '' })
    setEditId(p.id!)
    setFormErro('')
    setShowModal(true)
  }

  const validar = (): boolean => {
    if (!form.nome.trim()) { setFormErro('Nome é obrigatório.'); return false }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setFormErro('E-mail inválido.'); return false
    }
    if (form.cpf && form.cpf.replace(/\D/g, '').length !== 11) {
      setFormErro('CPF deve ter 11 dígitos.'); return false
    }
    return true
  }

  const salvar = async (e: FormEvent) => {
    e.preventDefault()
    setFormErro('')
    if (!validar()) return
    setSaving(true)
    try {
      if (editId !== null) {
        await pacienteApi.atualizar(editId, form)
      } else {
        await pacienteApi.criar(form)
      }
      setShowModal(false)
      carregar()
    } catch (err: any) {
      setFormErro(err.response?.data?.error ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const deletar = async (p: Paciente) => {
    if (!confirm(`Excluir paciente "${p.nome}"?`)) return
    try {
      await pacienteApi.deletar(p.id!)
      carregar()
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Erro ao excluir.')
    }
  }

  const filtrados = pacientes.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      p.email.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="page-title fw-bold mb-0">Pacientes</h4>
        <button className="btn btn-primary" onClick={abrirNovo}>
          <i className="bi bi-person-plus me-2"></i>Novo Paciente
        </button>
      </div>

      <div className="mb-3">
        <input
          type="search"
          className="form-control"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary"></div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-3">Nenhum paciente encontrado.</td></tr>
                )}
                {filtrados.map((p) => (
                  <tr key={p.id}>
                    <td className="text-muted">{p.id}</td>
                    <td>{p.nome}</td>
                    <td>{p.email}</td>
                    <td>{p.telefone ?? '—'}</td>
                    <td>{p.cpf ?? '—'}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => abrirEditar(p)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deletar(p)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={salvar} noValidate>
                <div className="modal-header">
                  <h5 className="modal-title">{editId ? 'Editar Paciente' : 'Novo Paciente'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {formErro && <div className="alert alert-danger py-2">{formErro}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nome <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">E-mail <span className="text-danger">*</span></label>
                    <input type="email" className="form-control" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Telefone</label>
                    <input className="form-control" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(xx) xxxxx-xxxx" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">CPF</label>
                    <input className="form-control" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} placeholder="00000000000" />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2"></span>}
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
