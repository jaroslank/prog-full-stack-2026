import { useEffect, useState, type FormEvent } from 'react'
import { servicoApi, type Servico } from '../api/servicos'
import { especialidadeApi, type Especialidade } from '../api/especialidades'

interface FormState {
  nome: string
  preco: string
  especialidadeId: string
}

const emptyForm: FormState = { nome: '', preco: '', especialidadeId: '' }

export function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState<FormState>(emptyForm)
  const [editId, setEditId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formErro, setFormErro] = useState('')
  const [saving, setSaving] = useState(false)

  const carregar = () => {
    setLoading(true)
    Promise.all([servicoApi.listar(), especialidadeApi.listar()])
      .then(([s, e]) => { setServicos(s.data); setEspecialidades(e.data) })
      .catch(() => setErro('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setForm(emptyForm); setEditId(null); setFormErro(''); setShowModal(true)
  }

  const abrirEditar = (s: Servico) => {
    setForm({ nome: s.nome, preco: String(s.preco), especialidadeId: s.especialidade?.id ? String(s.especialidade.id) : '' })
    setEditId(s.id!)
    setFormErro('')
    setShowModal(true)
  }

  const validar = (): boolean => {
    if (!form.nome.trim()) { setFormErro('Nome é obrigatório.'); return false }
    if (!form.preco || isNaN(Number(form.preco)) || Number(form.preco) <= 0) {
      setFormErro('Preço deve ser um número positivo.'); return false
    }
    return true
  }

  const salvar = async (e: FormEvent) => {
    e.preventDefault()
    setFormErro('')
    if (!validar()) return
    setSaving(true)
    const payload: Servico = {
      nome: form.nome,
      preco: Number(form.preco),
      especialidade: form.especialidadeId ? { id: Number(form.especialidadeId), nome: '' } : undefined,
    }
    try {
      if (editId !== null) {
        await servicoApi.atualizar(editId, payload)
      } else {
        await servicoApi.criar(payload)
      }
      setShowModal(false)
      carregar()
    } catch (err: any) {
      setFormErro(err.response?.data?.error ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const deletar = async (s: Servico) => {
    if (!confirm(`Excluir serviço "${s.nome}"?`)) return
    try {
      await servicoApi.deletar(s.id!)
      carregar()
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Erro ao excluir.')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="page-title fw-bold mb-0">Serviços</h4>
        <button className="btn btn-primary" onClick={abrirNovo}>
          <i className="bi bi-plus-circle me-2"></i>Novo Serviço
        </button>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Preço</th>
                  <th>Especialidade</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {servicos.length === 0 && (
                  <tr><td colSpan={5} className="text-center text-muted py-3">Nenhum serviço cadastrado.</td></tr>
                )}
                {servicos.map((s) => (
                  <tr key={s.id}>
                    <td className="text-muted">{s.id}</td>
                    <td>{s.nome}</td>
                    <td>R$ {Number(s.preco).toFixed(2)}</td>
                    <td>{s.especialidade?.nome ?? '—'}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => abrirEditar(s)}>
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deletar(s)}>
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

      {showModal && (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={salvar} noValidate>
                <div className="modal-header">
                  <h5 className="modal-title">{editId ? 'Editar Serviço' : 'Novo Serviço'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {formErro && <div className="alert alert-danger py-2">{formErro}</div>}
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Nome <span className="text-danger">*</span></label>
                    <input className="form-control" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Preço (R$) <span className="text-danger">*</span></label>
                    <input type="number" min="0.01" step="0.01" className="form-control" value={form.preco} onChange={(e) => setForm({ ...form, preco: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Especialidade</label>
                    <select className="form-select" value={form.especialidadeId} onChange={(e) => setForm({ ...form, especialidadeId: e.target.value })}>
                      <option value="">— Selecione —</option>
                      {especialidades.map((esp) => (
                        <option key={esp.id} value={esp.id}>{esp.nome}</option>
                      ))}
                    </select>
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
