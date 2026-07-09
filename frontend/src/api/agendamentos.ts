import api from './axios'
import type { Paciente } from './pacientes'
import type { Servico } from './servicos'

export type StatusAgendamento = 'agendado' | 'cancelado' | 'concluido'

export interface Agendamento {
  id?: string
  dataHora: string
  status?: StatusAgendamento
  paciente?: Paciente
  servicos?: Servico[]
}

export const agendamentoApi = {
  listar: () => api.get<Agendamento[]>('/agendamentos'),
  listarPorPaciente: (pacienteId: number) =>
    api.get<Agendamento[]>(`/agendamentos/paciente/${pacienteId}`),
  buscar: (id: string) => api.get<Agendamento>(`/agendamentos/${id}`),
  criar: (a: { paciente: { id: number }; servicos: { id: number }[]; dataHora: string }) =>
    api.post<Agendamento>('/agendamentos', a),
  atualizar: (id: string, a: Partial<Agendamento>) => api.put<Agendamento>(`/agendamentos/${id}`, a),
  cancelar: (id: string) => api.patch<Agendamento>(`/agendamentos/${id}/cancelar`),
  concluir: (id: string) => api.patch<Agendamento>(`/agendamentos/${id}/concluir`),
  deletar: (id: string) => api.delete(`/agendamentos/${id}`),
}
