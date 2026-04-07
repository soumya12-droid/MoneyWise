import { useEffect, useMemo, useState } from 'react'
import { loadMonthlyBudget, loadTransactions } from '../utils/moneywiseStorage'

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

function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [budget, setBudget] = useState(0)

  useEffect(() => {
    setTransactions(loadTransactions())
    setBudget(loadMonthlyBudget())
  }, [])

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    const monthlySpent = transactions
      .filter((t) => t.type === 'expense' && isInCurrentMonth(t.date))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    return { income, expenses, balance: income - expenses, monthlySpent }
  }, [transactions])

  const budgetRemaining = budget - totals.monthlySpent
  const budgetLabel =
    budget <= 0 ? 'Not set' : budgetRemaining >= 0 ? 'Remaining' : 'Exceeded'
  const budgetValue =
    budget <= 0
      ? 'Set your monthly budget'
      : budgetRemaining >= 0
        ? formatINR(budgetRemaining)
        : formatINR(Math.abs(budgetRemaining))

  return (
    <section className="page-card">
      <h1>Dashboard</h1>
      <p className="muted-text">Your high-level snapshot of MoneyWise.</p>

      <div className="summary-row summary-row-4" aria-label="Dashboard summary cards">
        <div className="summary-item">
          <div className="summary-label">Total Balance</div>
          <div className="summary-value">{formatINR(totals.balance)}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Total Income</div>
          <div className="summary-value">{formatINR(totals.income)}</div>
        </div>
        <div className="summary-item">
          <div className="summary-label">Total Expenses</div>
          <div className="summary-value">{formatINR(totals.expenses)}</div>
        </div>
        <div
          className={`summary-item ${
            budget <= 0
              ? ''
              : budgetRemaining >= 0
                ? 'summary-ok'
                : 'summary-warn'
          }`}
        >
          <div className="summary-label">
            Budget Status <span className="summary-sub">({budgetLabel})</span>
          </div>
          <div className="summary-value">{budgetValue}</div>
          {budget > 0 && (
            <div className="summary-foot">
              Monthly spending: <strong>{formatINR(totals.monthlySpent)}</strong> /{' '}
              {formatINR(budget)}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default Dashboard
