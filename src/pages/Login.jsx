import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../utils/auth'
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

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>MoneyWise</h1>
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
