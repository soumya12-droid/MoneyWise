import { NavLink, useNavigate } from 'react-router-dom'
import { loadTheme, saveTheme } from '../utils/auth'

const links = [
  { label: 'Add Transactions', to: '/add-expense' },
  { label: 'View Expenses', to: '/view-expenses' },
  { label: 'Set Budget', to: '/set-budget' },
]

function Navbar() {
  const navigate = useNavigate()

  const handleThemeToggle = () => {
    const next = loadTheme() === 'dark' ? 'light' : 'dark'
    saveTheme(next)
    document.documentElement.dataset.theme = next
  }

  return (
    <header className="top-navbar">
      <button
        type="button"
        className="brand brand-btn"
        role="banner"
        onClick={() => navigate('/dashboard')}
      >
        MoneyWise
      </button>

      <nav className="nav-links nav-center" aria-label="Primary navigation">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="nav-actions" aria-label="User actions">
        <button
          type="button"
          className="icon-btn"
          onClick={() => navigate('/profile')}
          aria-label="Open profile"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.8 0-8.75 2.45-8.75 5.5v.75h17.5v-.75c0-3.05-3.95-5.5-8.75-5.5Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          type="button"
          className="icon-btn"
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
      </div>
    </header>
  )
}

export default Navbar
