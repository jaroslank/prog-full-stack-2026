import { useEffect, useState, type FormEvent } from 'react'
import { especialidadeApi, type Especialidade } from '../api/especialidades'

export function EspecialidadesPage() {
  const [lista, setLista] = useState<Especialidade[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [nome, setNome] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [formErro, setFormErro] = useState('')
  const [saving, setSaving] = useState(false)

  const carregar = () => {
    setLoading(true)
    especialidadeApi.listar()
      .then((r) => setLista(r.data))
      .catch(() => setErro('Erro ao carregar especialidades.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setNome(''); setEditId(null); setFormErro(''); setShowModal(true)
  }

  const abrirEditar = (e: Especialidade) => {
    setNome(e.nome); setEditId(e.id!); setFormErro(''); setShowModal(true)
  }

  const salvar = async (e: FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) { setFormErro('Nome é obrigatório.'); return }
    setSaving(true)
    try {
      if (editId !== null) {
        await especialidadeApi.atualizar(editId, { nome })
      } else {
        await especialidadeApi.criar({ nome })
      }
      setShowModal(false)
      carregar()
    } catch (err: any) {
      setFormErro(err.response?.data?.error ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const deletar = async (esp: Especialidade) => {
    if (!confirm(`Excluir especialidade "${esp.nome}"?`)) return
    try {
      await especialidadeApi.deletar(esp.id!)
      carregar()
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Erro ao excluir.')
    }
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="page-title fw-bold mb-0">Especialidades</h4>
        <button className="btn btn-primary" onClick={abrirNovo}>
          <i className="bi bi-plus-circle me-2"></i>Nova Especialidade
        </button>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <div className="row g-3">
          {lista.length === 0 && <p className="text-muted">Nenhuma especialidade cadastrada.</p>}
          {lista.map((esp) => (
            <div className="col-12 col-sm-6 col-md-4" key={esp.id}>
              <div className="card card-hover border-0 shadow-sm h-100">
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <i className="bi bi-award text-primary me-2"></i>
                    <span className="fw-semibold">{esp.nome}</span>
                  </div>
                  <div>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => abrirEditar(esp)}>
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => deletar(esp)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={salvar} noValidate>
                <div className="modal-header">
                  <h5 className="modal-title">{editId ? 'Editar Especialidade' : 'Nova Especialidade'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {formErro && <div className="alert alert-danger py-2">{formErro}</div>}
                  <label className="form-label fw-semibold">Nome <span className="text-danger">*</span></label>
                  <input className="form-control" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
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
