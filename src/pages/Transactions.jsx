import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadMonthlyBudget, loadTransactions, saveTransactions } from '../utils/moneywiseStorage'
import ExpenseChartsCanvas from '../components/ExpenseChartsCanvas'

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

const formatINR = (value) => {
  const n = Number(value)
  if (!Number.isFinite(n)) return '₹0'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n)
}

function formatDate(dateISO) {
  if (!dateISO) return ''
  const d = new Date(dateISO)
  if (Number.isNaN(d.getTime())) return dateISO
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Transactions() {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState([])
  const [budget, setBudget] = useState(0)
  const [typeFilter, setTypeFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({
    amount: '',
    category: 'Food',
    date: '',
    notes: '',
    type: 'expense',
  })
  const [editError, setEditError] = useState('')
  const editAmountRef = useRef(null)

  useEffect(() => {
    setTransactions(loadTransactions())
    setBudget(loadMonthlyBudget())
  }, [])

  useEffect(() => {
    const handleStorage = () => {
      setTransactions(loadTransactions())
      setBudget(loadMonthlyBudget())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    if (!editing) return undefined

    editAmountRef.current?.focus()

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        closeEdit()
      }
    }

    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [editing])

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    return { income, expenses, balance: income - expenses }
  }, [transactions])

  const monthlySpent = useMemo(() => {
    const now = new Date()
    return transactions
      .filter((t) => {
        if (t.type !== 'expense') return false
        const d = new Date(t.date)
        return !Number.isNaN(d.getTime()) &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
      })
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
  }, [transactions])

  const budgetRemaining = budget - monthlySpent

  const visibleTransactions = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = transactions.filter((t) => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
      if (!q) return true
      const blob = `${t.category} ${t.notes || ''} ${t.type}`.toLowerCase()
      return blob.includes(q)
    })

    const sorted = [...filtered]
    sorted.sort((a, b) => {
      if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date)
      if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date)
      if (sortBy === 'amount-desc') return Number(b.amount || 0) - Number(a.amount || 0)
      if (sortBy === 'amount-asc') return Number(a.amount || 0) - Number(b.amount || 0)
      return 0
    })
    return sorted
  }, [transactions, typeFilter, categoryFilter, sortBy, search])

  const upsertTransactions = (next) => {
    setTransactions(next)
    saveTransactions(next)
  }

  const handleDelete = (id) => {
    const ok = window.confirm('Delete this transaction?')
    if (!ok) return
    const next = transactions.filter((t) => t.id !== id)
    upsertTransactions(next)
  }

  const openEdit = (t) => {
    setEditError('')
    setEditing(t)
    setEditForm({
      amount: String(t.amount),
      category: t.category,
      date: t.date,
      notes: t.notes || '',
      type: t.type,
    })
  }

  const closeEdit = () => {
    setEditing(null)
    setEditError('')
  }

  const handleEditSave = (event) => {
    event.preventDefault()
    const amount = Number(editForm.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setEditError('Please enter a valid amount greater than 0.')
      return
    }
    if (!editForm.date) {
      setEditError('Please select a date.')
      return
    }
    if (!editing) return

    const updated = {
      ...editing,
      amount,
      category: editForm.category,
      date: editForm.date,
      notes: editForm.notes.trim(),
      type: editForm.type,
    }
    const next = transactions.map((t) => (t.id === editing.id ? updated : t))
    upsertTransactions(next)
    closeEdit()
  }

  return (
    <section className="page-card">
      <h1>View Expenses</h1>
      <p className="muted-text">Manage transactions with edit, delete, filters, sorting, and search.</p>

      <div className="summary-row" aria-label="Transaction totals">
        <div className="summary-item">
          <div className="summary-label">Total Income</div>
          <div className="summary-value">{formatINR(totals.income)}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Total Expenses</div>
          <div className="summary-value">{formatINR(totals.expenses)}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Net Balance</div>
          <div className="summary-value">{formatINR(totals.balance)}</div>
        </div>
      </div>

      <div className={`summary-item budget-status ${budget > 0 && budgetRemaining < 0 ? 'summary-warn' : ''}`}>
        <div className="summary-label">Budget Status (This Month)</div>
        {budget > 0 ? (
          <div className="summary-value">
            {budgetRemaining >= 0
              ? `Remaining ${formatINR(budgetRemaining)}`
              : `Exceeded by ${formatINR(Math.abs(budgetRemaining))}`}
          </div>
        ) : (
          <div className="summary-value">Budget not set</div>
        )}
      </div>

      <div className="toolbar">
        <input
          className="toolbar-input"
          placeholder="Search category / notes / type"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="toolbar-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select
          className="toolbar-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select className="toolbar-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="date-desc">Date: Newest</option>
          <option value="date-asc">Date: Oldest</option>
          <option value="amount-desc">Amount: High to Low</option>
          <option value="amount-asc">Amount: Low to High</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">No transactions yet</div>
          <div className="empty-desc">Go to `Add Transactions` to create your first entry.</div>
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="table" aria-label="Transactions table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>{formatDate(t.date)}</td>
                    <td>
                      <span
                        className={`pill ${t.type === 'income' ? 'pill-income' : 'pill-expense'}`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td>{t.category}</td>
                    <td className="amount-cell">
                      {t.type === 'expense' ? `- ${formatINR(t.amount)}` : formatINR(t.amount)}
                    </td>
                    <td className="notes-cell">{t.notes || '-'}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="action-btn" onClick={() => openEdit(t)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="action-btn action-delete"
                          onClick={() => handleDelete(t.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="section-split" />

          <section className="inline-section" aria-label="Charts section">
            <div className="section-head">
              <h2 className="section-title">Charts</h2>
              <button type="button" className="btn-secondary" onClick={() => navigate('/charts')}>
                Open full charts
              </button>
            </div>
            <ExpenseChartsCanvas transactions={transactions} compact />
          </section>
        </>
      )}

      {editing && (
        <div className="modal-backdrop" role="presentation" onClick={closeEdit}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Edit Transaction</h3>
            <form className="form-grid" onSubmit={handleEditSave}>
              <div className="field">
                <label htmlFor="editAmount">Amount</label>
                <input
                  ref={editAmountRef}
                  id="editAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm((p) => ({ ...p, amount: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="editType">Type</label>
                <select
                  id="editType"
                  value={editForm.type}
                  onChange={(e) => setEditForm((p) => ({ ...p, type: e.target.value }))}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="editCategory">Category</label>
                <select
                  id="editCategory"
                  value={editForm.category}
                  onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="editDate">Date</label>
                <input
                  id="editDate"
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>
              <div className="field field-full">
                <label htmlFor="editNotes">Notes</label>
                <textarea
                  id="editNotes"
                  value={editForm.notes}
                  onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                />
              </div>
              {editError && <p className="error-text form-error">{editError}</p>}
              <div className="form-actions field-full">
                <button type="submit">Save Changes</button>
                <button type="button" className="btn-secondary" onClick={closeEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}

export default Transactions
