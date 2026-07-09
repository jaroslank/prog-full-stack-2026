import { useEffect, useState, type FormEvent } from 'react'
import { agendamentoApi, type Agendamento } from '../api/agendamentos'
import { pacienteApi, type Paciente } from '../api/pacientes'
import { servicoApi, type Servico } from '../api/servicos'

interface NovoAgForm {
  pacienteId: string
  dataHora: string
  servicoIds: number[]
}

const emptyForm: NovoAgForm = { pacienteId: '', dataHora: '', servicoIds: [] }

const statusBadge: Record<string, string> = {
  agendado: 'bg-primary',
  cancelado: 'bg-danger',
  concluido: 'bg-success',
}

export function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [servicos, setServicos] = useState<Servico[]>([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState<NovoAgForm>(emptyForm)
  const [showModal, setShowModal] = useState(false)
  const [formErro, setFormErro] = useState('')
  const [saving, setSaving] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [detalhes, setDetalhes] = useState<Agendamento | null>(null)

  const carregar = () => {
    setLoading(true)
    Promise.all([agendamentoApi.listar(), pacienteApi.listar(), servicoApi.listar()])
      .then(([ag, pac, serv]) => {
        setAgendamentos(ag.data)
        setPacientes(pac.data)
        setServicos(serv.data)
      })
      .catch(() => setErro('Erro ao carregar dados.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  const abrirNovo = () => {
    setForm(emptyForm); setFormErro(''); setShowModal(true)
  }

  const toggleServico = (id: number) => {
    setForm((prev) => ({
      ...prev,
      servicoIds: prev.servicoIds.includes(id)
        ? prev.servicoIds.filter((s) => s !== id)
        : [...prev.servicoIds, id],
    }))
  }

  const validar = (): boolean => {
    if (!form.pacienteId) { setFormErro('Selecione um paciente.'); return false }
    if (!form.dataHora) { setFormErro('Informe a data e hora.'); return false }
    if (new Date(form.dataHora).getTime() <= Date.now()) {
      setFormErro('A data/hora deve ser futura.'); return false
    }
    if (form.servicoIds.length === 0) { setFormErro('Selecione ao menos um serviço.'); return false }
    return true
  }

  const salvar = async (e: FormEvent) => {
    e.preventDefault()
    setFormErro('')
    if (!validar()) return
    setSaving(true)
    try {
      await agendamentoApi.criar({
        paciente: { id: Number(form.pacienteId) },
        servicos: form.servicoIds.map((id) => ({ id })),
        dataHora: new Date(form.dataHora).toISOString(),
      })
      setShowModal(false)
      carregar()
    } catch (err: any) {
      setFormErro(err.response?.data?.error ?? 'Erro ao agendar.')
    } finally {
      setSaving(false)
    }
  }

  const acao = async (id: string, tipo: 'cancelar' | 'concluir') => {
    const msg = tipo === 'cancelar' ? 'Cancelar este agendamento?' : 'Marcar como concluído?'
    if (!confirm(msg)) return
    try {
      if (tipo === 'cancelar') await agendamentoApi.cancelar(id)
      else await agendamentoApi.concluir(id)
      carregar()
      setDetalhes(null)
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Erro.')
    }
  }

  const deletar = async (id: string) => {
    if (!confirm('Excluir agendamento permanentemente?')) return
    try {
      await agendamentoApi.deletar(id)
      carregar()
      setDetalhes(null)
    } catch (err: any) {
      alert(err.response?.data?.error ?? 'Erro ao excluir.')
    }
  }

  const filtrados = agendamentos.filter((a) =>
    filtroStatus === 'todos' ? true : a.status === filtroStatus
  ).sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())

  const totalValor = (a: Agendamento) =>
    (a.servicos ?? []).reduce((sum, s) => sum + Number(s.preco ?? 0), 0)

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="page-title fw-bold mb-0">Agendamentos</h4>
        <button className="btn btn-primary" onClick={abrirNovo}>
          <i className="bi bi-calendar-plus me-2"></i>Novo Agendamento
        </button>
      </div>

      {/* Filtro de status */}
      <div className="mb-3 d-flex gap-2">
        {['todos', 'agendado', 'concluido', 'cancelado'].map((s) => (
          <button
            key={s}
            className={`btn btn-sm ${filtroStatus === s ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setFiltroStatus(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
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
                  <th>Data/Hora</th>
                  <th>Paciente</th>
                  <th>Serviços</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th className="text-end">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-3">Nenhum agendamento encontrado.</td></tr>
                )}
                {filtrados.map((a) => (
                  <tr key={a.id} onClick={() => setDetalhes(a)} style={{ cursor: 'pointer' }}>
                    <td>{new Date(a.dataHora).toLocaleString('pt-BR')}</td>
                    <td>{a.paciente?.nome}</td>
                    <td>{a.servicos?.map((s) => s.nome).join(', ')}</td>
                    <td>R$ {totalValor(a).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${statusBadge[a.status ?? 'agendado']}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      {a.status === 'agendado' && (
                        <>
                          <button className="btn btn-sm btn-outline-success me-1" title="Concluir" onClick={() => acao(a.id!, 'concluir')}>
                            <i className="bi bi-check-circle"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-warning me-1" title="Cancelar" onClick={() => acao(a.id!, 'cancelar')}>
                            <i className="bi bi-x-circle"></i>
                          </button>
                        </>
                      )}
                      <button className="btn btn-sm btn-outline-danger" title="Excluir" onClick={() => deletar(a.id!)}>
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

      {/* Modal novo agendamento */}
      {showModal && (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,.4)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={salvar} noValidate>
                <div className="modal-header">
                  <h5 className="modal-title">Novo Agendamento</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {formErro && <div className="alert alert-danger py-2">{formErro}</div>}
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Paciente <span className="text-danger">*</span></label>
                      <select className="form-select" value={form.pacienteId} onChange={(e) => setForm({ ...form, pacienteId: e.target.value })}>
                        <option value="">— Selecione —</option>
                        {pacientes.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Data e Hora <span className="text-danger">*</span></label>
                      <input
                        type="datetime-local"
                        className="form-control"
                        value={form.dataHora}
                        min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                        onChange={(e) => setForm({ ...form, dataHora: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold">Serviços <span className="text-danger">*</span></label>
                      <div className="row g-2">
                        {servicos.map((s) => (
                          <div className="col-12 col-sm-6" key={s.id}>
                            <div
                              className={`card border-2 card-hover ${form.servicoIds.includes(s.id!) ? 'border-primary bg-primary bg-opacity-10' : 'border-light'}`}
                              style={{ cursor: 'pointer' }}
                              onClick={() => toggleServico(s.id!)}
                            >
                              <div className="card-body py-2 px-3 d-flex justify-content-between align-items-center">
                                <div>
                                  <div className="fw-semibold small">{s.nome}</div>
                                  <div className="text-muted small">{s.especialidade?.nome}</div>
                                </div>
                                <div className="fw-bold text-primary">R$ {Number(s.preco).toFixed(2)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {form.servicoIds.length > 0 && (
                      <div className="col-12">
                        <div className="alert alert-info py-2 mb-0">
                          <strong>Total:</strong> R$ {servicos.filter((s) => form.servicoIds.includes(s.id!)).reduce((sum, s) => sum + Number(s.preco), 0).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving && <span className="spinner-border spinner-border-sm me-2"></span>}
                    Agendar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalhes */}
      {detalhes && (
        <div className="modal d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,.4)' }} onClick={() => setDetalhes(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalhes do Agendamento</h5>
                <button type="button" className="btn-close" onClick={() => setDetalhes(null)}></button>
              </div>
              <div className="modal-body">
                <dl className="row mb-0">
                  <dt className="col-4">Paciente</dt>
                  <dd className="col-8">{detalhes.paciente?.nome}</dd>
                  <dt className="col-4">E-mail</dt>
                  <dd className="col-8">{detalhes.paciente?.email}</dd>
                  <dt className="col-4">Data/Hora</dt>
                  <dd className="col-8">{new Date(detalhes.dataHora).toLocaleString('pt-BR')}</dd>
                  <dt className="col-4">Status</dt>
                  <dd className="col-8">
                    <span className={`badge ${statusBadge[detalhes.status ?? 'agendado']}`}>{detalhes.status}</span>
                  </dd>
                  <dt className="col-4">Serviços</dt>
                  <dd className="col-8">
                    <ul className="mb-0 ps-3">
                      {detalhes.servicos?.map((s) => (
                        <li key={s.id}>{s.nome} — R$ {Number(s.preco).toFixed(2)}</li>
                      ))}
                    </ul>
                  </dd>
                  <dt className="col-4">Total</dt>
                  <dd className="col-8 fw-bold text-primary">R$ {totalValor(detalhes).toFixed(2)}</dd>
                </dl>
              </div>
              <div className="modal-footer">
                {detalhes.status === 'agendado' && (
                  <>
                    <button className="btn btn-success" onClick={() => acao(detalhes.id!, 'concluir')}>
                      <i className="bi bi-check-circle me-1"></i>Concluir
                    </button>
                    <button className="btn btn-warning" onClick={() => acao(detalhes.id!, 'cancelar')}>
                      <i className="bi bi-x-circle me-1"></i>Cancelar
                    </button>
                  </>
                )}
                <button className="btn btn-secondary" onClick={() => setDetalhes(null)}>Fechar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
