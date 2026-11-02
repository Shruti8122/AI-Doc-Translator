import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { loginUser, registerUser, logoutUser, getMe } from '../api'

const AuthContext = createContext(null)

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER': return { ...state, user: action.payload, loading: false }
    case 'LOGIN': return { ...state, user: action.payload.user, accessToken: action.payload.accessToken, loading: false }
    case 'LOGOUT': return { ...state, user: null, accessToken: null, loading: false }
    case 'SET_LOADING': return { ...state, loading: action.payload }
    case 'UPDATE_USER': return { ...state, user: { ...state.user, ...action.payload } }
    default: return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    accessToken: localStorage.getItem('accessToken') || null,
    loading: true
  })

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      getMe().then(data => {
        dispatch({ type: 'SET_USER', payload: data.user })
        localStorage.setItem('user', JSON.stringify(data.user))
      }).catch(() => {
        dispatch({ type: 'LOGOUT' })
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      })
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    dispatch({ type: 'LOGIN', payload: data })
    return data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const data = await registerUser(name, email, password)
    localStorage.setItem('accessToken', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)
    localStorage.setItem('user', JSON.stringify(data.user))
    dispatch({ type: 'LOGIN', payload: data })
    return data
  }, [])

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) await logoutUser(refreshToken)
    } catch {}
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }, [])

  const updateUser = useCallback((userData) => {
    localStorage.setItem('user', JSON.stringify({ ...state.user, ...userData }))
    dispatch({ type: 'UPDATE_USER', payload: userData })
  }, [state.user])

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser, dispatch }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
