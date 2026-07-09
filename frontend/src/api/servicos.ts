import api from './axios'
import type { Especialidade } from './especialidades'

export interface Servico {
  id?: number
  nome: string
  preco: number
  especialidade?: Especialidade
}

export const servicoApi = {
  listar: () => api.get<Servico[]>('/servicos'),
  buscar: (id: number) => api.get<Servico>(`/servicos/${id}`),
  criar: (s: Servico) => api.post<Servico>('/servicos', s),
  atualizar: (id: number, s: Partial<Servico>) => api.put<Servico>(`/servicos/${id}`, s),
  deletar: (id: number) => api.delete(`/servicos/${id}`),
}
