import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addTransaction, loadTransactions } from '../utils/moneywiseStorage'

const CATEGORIES = [
  'Food',
  'Travel',
  'Bills',
  'Shopping',
  'Health',
  'Education',
  'Entertainment',
  'Rent',
  'Utilities',
  'Salary',
  'Other',
]

const getTodayISO = () => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function AddExpense() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    amount: '',
    category: 'Food',
    date: getTodayISO(),
    notes: '',
    type: 'expense',
  })
  const [error, setError] = useState('')

  const parsedAmount = useMemo(() => {
    if (form.amount === '') return null
    const num = Number(form.amount)
    return Number.isFinite(num) ? num : null
  }, [form.amount])

  const handleChange = (event) => {
    const { name, value } = event.target
    setError('')
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (parsedAmount === null) {
      setError('Please enter a valid amount.')
      return
    }

    if (parsedAmount <= 0) {
      setError('Amount must be greater than 0.')
      return
    }

    if (!form.category) {
      setError('Please select a category.')
      return
    }

    if (!form.date) {
      setError('Please select a date.')
      return
    }

    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`

    const transaction = {
      id,
      amount: parsedAmount,
      category: form.category,
      date: form.date,
      type: form.type,
      notes: form.notes.trim(),
    }

    // Keep this explicit so we have the latest array when debugging Step 4 later.
    const existing = loadTransactions()
    void existing

    addTransaction(transaction)
    navigate('/view-expenses', { replace: true })
  }

  return (
    <section className="page-card">
      <h1>Add Transactions</h1>
      <p className="muted-text">Add a transaction and it will be saved to localStorage.</p>

      <form onSubmit={handleSubmit} className="form-grid" aria-label="Add transaction form">
        <div className="field">
          <label htmlFor="amount">Amount</label>
          <input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="e.g. 1999.00"
            value={form.amount}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="type">Type</label>
          <select id="type" name="type" value={form.type} onChange={handleChange} required>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="date">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="field field-full">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Optional details (e.g., invoice number, why it happened)"
          />
        </div>

        {error && <p className="error-text form-error">{error}</p>}

        <div className="form-actions field-full">
          <button type="submit">Add Transaction</button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate('/view-expenses')}
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  )
}

export default AddExpense
