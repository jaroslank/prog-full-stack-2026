import api from './axios'

export interface Profissional {
  id?: number
  nome?: string
  email: string
  foto?: string
}

export const profissionalApi = {
  listar: () => api.get<Profissional[]>('/profissionais'),
  buscar: (id: number) => api.get<Profissional>(`/profissionais/${id}`),
  criar: (p: { nome?: string; email: string; senha: string }) =>
    api.post<Profissional>('/profissionais', p),
  atualizar: (id: number, p: Partial<Profissional & { senha?: string }>) =>
    api.put<Profissional>(`/profissionais/${id}`, p),
  uploadFoto: (id: number, file: File) => {
    const form = new FormData()
    form.append('foto', file)
    return api.patch<Profissional>(`/profissionais/${id}/foto`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deletar: (id: number) => api.delete(`/profissionais/${id}`),
}

export const login = (email: string, senha: string) =>
  api.post<{ token: string }>('/login', { email, senha })
