// src/stores/authStore.ts

import { create } from 'zustand'
import { api } from '../services/api'
import { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ user: User; token: string }>
  signup: (
    email: string,
    password: string,
    role: 'student' | 'teacher',
    name: string
  ) => Promise<{ user: User; token: string }>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      const form = new URLSearchParams()
      form.set('username', email)   // must be "username"
      form.set('password', password)

      const res = await api.post<{
        user: User
        access_token: string
      }>('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })

      const { user, access_token } = res.data
      set({ user, token: access_token, isAuthenticated: true })

      // Attach token for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      localStorage.setItem(
        'auth',
        JSON.stringify({ user, token: access_token })
      )

      return { user, token: access_token }
    } catch (err) {
      console.error('Login failed:', err)
      throw err
    }
  },

  signup: async (email, password, role, name) => {
    try {
      const res = await api.post<{
        user: User
        access_token: string
      }>('/auth/signup', { email, password, role, name })

      const { user, access_token } = res.data
      set({ user, token: access_token, isAuthenticated: true })

      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      localStorage.setItem(
        'auth',
        JSON.stringify({ user, token: access_token })
      )

      return { user, token: access_token }
    } catch (err) {
      console.error('Signup failed:', err)
      throw err
    }
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('auth')
  },
}))

// Rehydrate on app start
const saved = localStorage.getItem('auth')
if (saved) {
  const { user, token } = JSON.parse(saved)
  useAuthStore.setState({ user, token, isAuthenticated: true })
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}
