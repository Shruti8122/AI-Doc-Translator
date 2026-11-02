import axios from 'axios'

const client = axios.create({ baseURL: '/api' })

let store
export function injectStore(s) {
  store = s
}

client.interceptors.request.use(config => {
  const state = store?.getState?.() || store
  const token = state?.auth?.accessToken || localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) throw new Error('No refresh token')
        const { data } = await axios.post('/api/auth/refresh', { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        return client(originalRequest)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// === Existing API methods (keep unchanged) ===
export async function uploadFile(file) {
  const form = new FormData()
  form.append('file', file)
  const { data } = await client.post('/upload', form)
  return data
}

export async function startTranslation(taskId, sourceLang, targetLang, sourceLangName, targetLangName) {
  const { data } = await client.post('/start-translation', {
    task_id: taskId,
    source_lang: sourceLang,
    target_lang: targetLang,
    source_lang_name: sourceLangName || '',
    target_lang_name: targetLangName || '',
  })
  return data
}

export async function getProgress(taskId) {
  const { data } = await client.get(`/progress/${taskId}`)
  return data
}

export function getResultUrl(taskId) {
  return `/api/result/${taskId}`
}

export function getDownloadUrl(taskId) {
  return `/api/result/${taskId}/download`
}

export async function fetchLanguages() {
  const { data } = await client.get('/languages')
  return data
}

// === Auth API ===
export async function registerUser(name, email, password) {
  const { data } = await client.post('/auth/register', { name, email, password })
  return data
}

export async function loginUser(email, password) {
  const { data } = await client.post('/auth/login', { email, password })
  return data
}

export async function refreshToken(refreshToken) {
  const { data } = await client.post('/auth/refresh', { refreshToken })
  return data
}

export async function logoutUser(refreshToken) {
  const { data } = await client.post('/auth/logout', { refreshToken })
  return data
}

export async function getMe() {
  const { data } = await client.get('/auth/me')
  return data
}

// === Profile API ===
export async function getProfile() {
  const { data } = await client.get('/profile')
  return data
}

export async function updateProfile(name, email) {
  const { data } = await client.put('/profile', { name, email })
  return data
}

export async function uploadAvatar(file) {
  const form = new FormData()
  form.append('avatar', file)
  const { data } = await client.post('/profile/avatar', form)
  return data
}

export async function changePassword(currentPassword, newPassword) {
  const { data } = await client.put('/profile/password', { currentPassword, newPassword })
  return data
}

export async function updateSettings(settings) {
  const { data } = await client.put('/profile/settings', settings)
  return data
}

// === History API ===
export async function getHistory(params = {}) {
  const { data } = await client.get('/history', { params })
  return data
}

export async function deleteHistory(id) {
  const { data } = await client.delete(`/history/${id}`)
  return data
}

export async function clearHistory() {
  const { data } = await client.delete('/history')
  return data
}

export async function forgotPassword(email) {
  const { data } = await client.post('/auth/forgot-password', { email })
  return data
}

export async function resetPassword(token, password) {
  const { data } = await client.post('/auth/reset-password', { token, password })
  return data
}

export { client }
