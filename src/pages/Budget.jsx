import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadMonthlyBudget, loadTransactions, saveMonthlyBudget } from '../utils/moneywiseStorage'

const formatINR = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n)
}

const isInCurrentMonth = (dateISO) => {
  const d = new Date(dateISO)
  if (Number.isNaN(d.getTime())) return false
  const now = new Date()
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

function Budget() {
  const navigate = useNavigate()
  const [budgetInput, setBudgetInput] = useState('')
  const [savedBudget, setSavedBudget] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const current = loadMonthlyBudget()
    setSavedBudget(current)
    setBudgetInput(current > 0 ? String(current) : '')
    setTransactions(loadTransactions())
  }, [])

  const monthlySpent = useMemo(
    () =>
      transactions
        .filter((t) => t.type === 'expense' && isInCurrentMonth(t.date))
        .reduce((sum, t) => sum + Number(t.amount || 0), 0),
    [transactions],
  )

  const remaining = savedBudget - monthlySpent
  const isExceeded = savedBudget > 0 && remaining < 0

  const handleSave = (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    const parsed = Number(budgetInput)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError('Enter a valid budget amount greater than 0.')
      return
    }

    saveMonthlyBudget(parsed)
    setSavedBudget(parsed)
    setMessage('Monthly budget saved.')
  }

  return (
    <section className="page-card">
      <h1>Set Budget</h1>
      <p className="muted-text">Define your monthly budget and track if you exceed it.</p>

      <form onSubmit={handleSave} className="form-grid" aria-label="Set budget form">
        <div className="field">
          <label htmlFor="monthlyBudget">Monthly Budget</label>
          <input
            id="monthlyBudget"
            type="number"
            min="0"
            step="0.01"
            value={budgetInput}
            onChange={(e) => {
              setError('')
              setMessage('')
              setBudgetInput(e.target.value)
            }}
            placeholder="e.g. 25000"
            required
          />
        </div>

        <div className="field form-actions">
          <button type="submit">Save Budget</button>
        </div>
      </form>

      {error && <p className="error-text form-error" style={{ marginTop: '0.75rem' }}>{error}</p>}
      {message && <p className="success-text" style={{ marginTop: '0.75rem' }}>{message}</p>}

      <div className={`summary-row summary-row-3-custom`} style={{ marginTop: '1rem' }}>
        <div className="summary-item">
          <div className="summary-label">Current Budget</div>
          <div className="summary-value">{savedBudget > 0 ? formatINR(savedBudget) : 'Not set'}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">This Month Spending</div>
          <div className="summary-value">{formatINR(monthlySpent)}</div>
        </div>
        <div className={`summary-item ${isExceeded ? 'summary-warn' : 'summary-ok'}`}>
          <div className="summary-label">{isExceeded ? 'Exceeded By' : 'Remaining'}</div>
          <div className="summary-value">
            {savedBudget > 0 ? formatINR(Math.abs(remaining)) : 'Set budget first'}
          </div>
        </div>
      </div>

      <div className="section-split" />
      <section className="inline-section" aria-label="Predict expenses section under budget">
        <div className="section-head">
          <h2 className="section-title">Predict Expenses</h2>
          <button type="button" className="btn-secondary" onClick={() => navigate('/predict-expense')}>
            Predict
          </button>
        </div>
        <p className="muted-text" style={{ marginBottom: 0 }}>
          Forecast next-month spending from your past data.
        </p>
      </section>
    </section>
  )
}

export default Budget
