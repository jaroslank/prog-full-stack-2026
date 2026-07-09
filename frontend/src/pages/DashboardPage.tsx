import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { agendamentoApi, type Agendamento } from '../api/agendamentos'
import { pacienteApi } from '../api/pacientes'
import { servicoApi } from '../api/servicos'

export function DashboardPage() {
  const [totalAgendamentos, setTotalAgendamentos] = useState(0)
  const [totalPacientes, setTotalPacientes] = useState(0)
  const [totalServicos, setTotalServicos] = useState(0)
  const [proximosAgendamentos, setProximosAgendamentos] = useState<Agendamento[]>([])

  useEffect(() => {
    Promise.all([
      agendamentoApi.listar(),
      pacienteApi.listar(),
      servicoApi.listar(),
    ]).then(([ag, pac, serv]) => {
      const todos = ag.data
      setTotalAgendamentos(todos.length)
      setTotalPacientes(pac.data.length)
      setTotalServicos(serv.data.length)

      const agora = new Date()
      const proximos = todos
        .filter((a) => a.status === 'agendado' && new Date(a.dataHora) > agora)
        .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime())
        .slice(0, 5)
      setProximosAgendamentos(proximos)
    })
  }, [])

  const cards = [
    { label: 'Agendamentos', value: totalAgendamentos, icon: 'bi-calendar-check', color: 'primary', to: '/agendamentos' },
    { label: 'Pacientes', value: totalPacientes, icon: 'bi-people', color: 'success', to: '/pacientes' },
    { label: 'Serviços', value: totalServicos, icon: 'bi-scissors', color: 'info', to: '/servicos' },
  ]

  return (
    <div>
      <h4 className="page-title fw-bold mb-4">Dashboard</h4>

      <div className="row g-3 mb-4">
        {cards.map((c) => (
          <div className="col-12 col-sm-4" key={c.label}>
            <Link to={c.to} className="text-decoration-none">
              <div className={`card card-hover border-0 shadow-sm`}>
                <div className="card-body d-flex align-items-center gap-3">
                  <div className={`rounded-circle bg-${c.color} bg-opacity-10 p-3`}>
                    <i className={`bi ${c.icon} fs-4 text-${c.color}`}></i>
                  </div>
                  <div>
                    <div className="fs-2 fw-bold">{c.value}</div>
                    <div className="text-muted small">{c.label}</div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white fw-semibold">
          <i className="bi bi-clock me-2 text-primary"></i>Próximos Agendamentos
        </div>
        <div className="card-body p-0">
          {proximosAgendamentos.length === 0 ? (
            <p className="text-muted p-3 mb-0">Nenhum agendamento futuro.</p>
          ) : (
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Paciente</th>
                  <th>Data/Hora</th>
                  <th>Serviços</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {proximosAgendamentos.map((a) => (
                  <tr key={a.id}>
                    <td>{a.paciente?.nome}</td>
                    <td>{new Date(a.dataHora).toLocaleString('pt-BR')}</td>
                    <td>{a.servicos?.map((s) => s.nome).join(', ')}</td>
                    <td>
                      <span className="badge bg-primary">{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
