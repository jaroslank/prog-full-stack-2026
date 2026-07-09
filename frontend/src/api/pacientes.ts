import api from './axios'

export interface Paciente {
  id?: number
  nome: string
  email: string
  telefone?: string
  cpf?: string
}

export const pacienteApi = {
  listar: () => api.get<Paciente[]>('/pacientes'),
  buscar: (id: number) => api.get<Paciente>(`/pacientes/${id}`),
  criar: (p: Paciente) => api.post<Paciente>('/pacientes', p),
  atualizar: (id: number, p: Partial<Paciente>) => api.put<Paciente>(`/pacientes/${id}`, p),
  deletar: (id: number) => api.delete(`/pacientes/${id}`),
}
