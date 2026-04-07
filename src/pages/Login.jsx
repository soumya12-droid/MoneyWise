import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadTheme, login, saveTheme } from '../utils/auth'
import {
  loadRegisteredUser,
  saveRegisteredUser,
  saveSessionUser,
} from '../utils/userStorage'

function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [formData, setFormData] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setError('')
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please enter email and password.')
      return
    }

    if (mode === 'signup') {
      if (!formData.name.trim()) {
        setError('Please enter your name.')
        return
      }

      const user = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        createdAt: new Date().toISOString(),
      }
      saveRegisteredUser(user)
      saveSessionUser(user)
      login()
      navigate('/dashboard', { replace: true })
      return
    }

    const registered = loadRegisteredUser()

    if (!registered) {
      setError('No account found. Please sign up first.')
      return
    }

    const emailOk = registered.email === formData.email.trim()
    const passwordOk = registered.password === formData.password

    if (!emailOk || !passwordOk) {
      setError('Invalid email or password.')
      return
    }

    saveSessionUser(registered)
    login()
    navigate('/dashboard', { replace: true })
  }

  const handleThemeToggle = () => {
    const next = loadTheme() === 'dark' ? 'light' : 'dark'
    saveTheme(next)
    document.documentElement.dataset.theme = next
  }

  return (
    <main className="auth-page">
      <button
        type="button"
        className="icon-btn auth-theme-toggle"
        onClick={handleThemeToggle}
        aria-label="Toggle theme"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 18.5A6.5 6.5 0 1 1 18.5 12 6.5 6.5 0 0 1 12 18.5Zm0-11A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Zm0-5.25a1 1 0 0 1 1 1V4a1 1 0 0 1-2 0V3.25a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1V22a1 1 0 0 1-2 0v-.75a1 1 0 0 1 1-1ZM2.25 12a1 1 0 0 1 1-1H4a1 1 0 0 1 0 2h-.75a1 1 0 0 1-1-1Zm18 0a1 1 0 0 1 1-1H22a1 1 0 0 1 0 2h-.75a1 1 0 0 1-1-1ZM4.4 4.4a1 1 0 0 1 1.41 0l.53.53a1 1 0 1 1-1.41 1.41l-.53-.53a1 1 0 0 1 0-1.41Zm13.26 13.26a1 1 0 0 1 1.41 0l.53.53a1 1 0 1 1-1.41 1.41l-.53-.53a1 1 0 0 1 0-1.41ZM19.6 4.4a1 1 0 0 1 0 1.41l-.53.53a1 1 0 0 1-1.41-1.41l.53-.53a1 1 0 0 1 1.41 0ZM6.34 17.66a1 1 0 0 1 0 1.41l-.53.53a1 1 0 0 1-1.41-1.41l.53-.53a1 1 0 0 1 1.41 0Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <section className="auth-card">
        <div className="login-brand-row">
          <img src="/moneywise-logo.png" alt="MoneyWise logo" className="login-brand-logo" />
          <h1>MoneyWise</h1>
        </div>
        <p>{mode === 'login' ? 'Log in to continue.' : 'Create an account to continue.'}</p>

        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => {
              setError('')
              setMode('login')
            }}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setError('')
              setMode('signup')
            }}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
              />
            </>
          )}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          {error && <p className="error-text">{error}</p>}

          <button type="submit">{mode === 'login' ? 'Login' : 'Sign up'}</button>
        </form>
      </section>
    </main>
  )
}

export default Login
