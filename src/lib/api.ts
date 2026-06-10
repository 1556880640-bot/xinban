const API_BASE = '/api'

// Get stored auth token
function getToken(): string | null {
  return localStorage.getItem('xinban_token')
}

// Set auth token
export function setToken(token: string) {
  localStorage.setItem('xinban_token', token)
}

// Clear auth token
export function clearToken() {
  localStorage.removeItem('xinban_token')
  localStorage.removeItem('xinban_user')
}

// Get stored user
export function getStoredUser(): any {
  const raw = localStorage.getItem('xinban_user')
  return raw ? JSON.parse(raw) : null
}

// Set stored user
export function setStoredUser(user: any) {
  localStorage.setItem('xinban_user', JSON.stringify(user))
}

// API request helper
async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  // Don't set Content-Type for FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || '请求失败')
  }
  return data
}

// Auth APIs
export const auth = {
  register: (data: { username: string; password: string; email?: string; inviteCode?: string }) =>
    request<{ token: string; user: any }>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { username: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  getMe: () => request('/auth/me'),

  submitInviteCode: (inviteCode: string) =>
    request('/auth/invite', { method: 'POST', body: JSON.stringify({ inviteCode }) }),

  getInviteStats: () => request<{ count: number }>('/auth/invite-stats'),
}

// Echo APIs
export const echoes = {
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return request<{ participants: string[]; messageCount: number }>('/echoes/upload', {
      method: 'POST',
      body: formData,
    })
  },

  create: (data: { name: string; targetPerson: string; chatContent: string }) =>
    request<any>('/echoes/create', { method: 'POST', body: JSON.stringify(data) }),

  list: () => request<any[]>('/echoes'),

  get: (id: string) => request<any>(`/echoes/${id}`),

  update: (id: string, data: any) =>
    request(`/echoes/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: string) => request(`/echoes/${id}`, { method: 'DELETE' }),
}

// Message APIs
export const messages = {
  list: (echoId: string) => request<any[]>(`/messages/${echoId}`),

  send: (echoId: string, content: string) =>
    request<any>(`/messages/${echoId}`, { method: 'POST', body: JSON.stringify({ content }) }),
}

// Contest APIs
export const contest = {
  submit: (data: { url: string; platform: string }) =>
    request('/contest/submit', { method: 'POST', body: JSON.stringify(data) }),

  mySubmissions: () => request<any[]>('/contest/my-submissions'),
}
