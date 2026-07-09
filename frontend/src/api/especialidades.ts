import api from './axios'

export interface Especialidade {
  id?: number
  nome: string
}

export const especialidadeApi = {
  listar: () => api.get<Especialidade[]>('/especialidades'),
  buscar: (id: number) => api.get<Especialidade>(`/especialidades/${id}`),
  criar: (e: Especialidade) => api.post<Especialidade>('/especialidades', e),
  atualizar: (id: number, e: Partial<Especialidade>) => api.put<Especialidade>(`/especialidades/${id}`, e),
  deletar: (id: number) => api.delete(`/especialidades/${id}`),
}
