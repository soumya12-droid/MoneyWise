import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../utils/auth'
import { clearSessionUser, loadRegisteredUser, loadSessionUser } from '../utils/userStorage'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const session = loadSessionUser()
    const registered = loadRegisteredUser()
    setUser(session || registered)
  }, [])

  const handleLogout = () => {
    clearSessionUser()
    logout()
    navigate('/', { replace: true })
    // Force location update so auth-protected routes are reset immediately.
    window.setTimeout(() => {
      window.location.assign('/')
    }, 0)
  }

  return (
    <section className="page-card">
      <h1>Profile</h1>
      <p className="muted-text">Your locally saved account details.</p>

      {!user ? (
        <div className="empty-state">
          <div className="empty-title">No user found</div>
          <div className="empty-desc">Please sign up / log in again.</div>
        </div>
      ) : (
        <div className="profile-grid">
          <div className="profile-item">
            <div className="profile-label">Email</div>
            <div className="profile-value">{user.email}</div>
          </div>
          <div className="profile-item">
            <div className="profile-label">Password</div>
            <div className="profile-value">{user.password}</div>
          </div>
          <div className="profile-item">
            <div className="profile-label">Name</div>
            <div className="profile-value">{user.name || '—'}</div>
          </div>
        </div>
      )}

      <div className="form-actions field-full" style={{ marginTop: '1rem' }}>
        <button type="button" onClick={handleLogout}>
          Logout
        </button>
        <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>
    </section>
  )
}

export default Profile

