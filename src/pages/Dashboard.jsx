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

const getMonthKey = (dateISO) => {
  const d = new Date(dateISO)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${d.getMonth()}`
}

function SummaryCards({ totals }) {
  return (
    <div className="summary-row" aria-label="Dashboard summary cards">
      <div className="summary-item">
        <div className="summary-label">Total Balance</div>
        <div className="summary-value">{formatINR(totals.balance)}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Total Income</div>
        <div className="summary-value">{formatINR(totals.income)}</div>
      </div>
      <div className="summary-item">
        <div className="summary-label">Total Expense</div>
        <div className="summary-value">{formatINR(totals.expenses)}</div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [budget, setBudget] = useState(0)

  useEffect(() => {
    setTransactions(loadTransactions())
    setBudget(loadMonthlyBudget())
  }, [])

  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'expense'),
    [transactions],
  )

  const totals = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)
    const expenses = expenseTransactions.reduce((sum, t) => sum + Number(t.amount || 0), 0)

    const monthlySpent = expenseTransactions
      .filter((t) => isInCurrentMonth(t.date))
      .reduce((sum, t) => sum + Number(t.amount || 0), 0)

    return { income, expenses, balance: income - expenses, monthlySpent }
  }, [transactions, expenseTransactions])

  const budgetRemaining = budget - totals.monthlySpent
  const percentageUsed =
    budget > 0 ? Math.min(100, (totals.monthlySpent / budget) * 100) : 0

  const progressTone =
    percentageUsed >= 90 ? 'progress-red' : percentageUsed >= 70 ? 'progress-yellow' : 'progress-green'

  const monthlyComparison = useMemo(() => {
    const now = new Date()
    const currentKey = `${now.getFullYear()}-${now.getMonth()}`
    const lastKey = `${now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()}-${
      now.getMonth() === 0 ? 11 : now.getMonth() - 1
    }`

    const monthlyMap = new Map()
    for (const t of expenseTransactions) {
      const key = getMonthKey(t.date)
      if (!key) continue
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + Number(t.amount || 0))
    }

    const current = monthlyMap.get(currentKey) || 0
    const last = monthlyMap.get(lastKey) || 0
    let change = 0
    if (last === 0) {
      change = current > 0 ? 100 : 0
    } else {
      change = ((current - last) / last) * 100
    }
    return { current, last, change }
  }, [expenseTransactions])

  const topCategoryInsight = useMemo(() => {
    if (expenseTransactions.length === 0) return 'No expense data yet'
    const byCategory = new Map()
    for (const t of expenseTransactions) {
      byCategory.set(t.category, (byCategory.get(t.category) || 0) + Number(t.amount || 0))
    }
    let maxCategory = 'Other'
    let maxAmount = -1
    for (const [category, amount] of byCategory.entries()) {
      if (amount > maxAmount) {
        maxCategory = category
        maxAmount = amount
      }
    }
    return `${maxCategory} is your highest expense category`
  }, [expenseTransactions])

  const budgetInsight =
    percentageUsed >= 80
      ? 'You are close to your budget limit ⚠️'
      : percentageUsed >= 50
        ? "You're doing okay, keep an eye on spending 👀"
        : 'Great job! Your spending is well within budget 💰'

  return (
    <section className="page-card">
      <h1>Dashboard</h1>
      <p className="muted-text">Your high-level snapshot of MoneyWise.</p>

      <SummaryCards totals={totals} />

      <section className="summary-item dashboard-block">
        <div className="section-head">
          <h2 className="section-title">Budget Summary</h2>
        </div>
        <div className="budget-meta-row">
          <div className="summary-label">Remaining Budget</div>
          <div className="summary-value">
            {budget > 0 ? formatINR(budgetRemaining) : 'Set a monthly budget'}
          </div>
        </div>
        <div className="summary-foot">
          {formatINR(totals.monthlySpent)} / {formatINR(budget)} used
        </div>
        <div className="progress-track" role="progressbar" aria-valuenow={Math.round(percentageUsed)}>
          <div
            className={`progress-fill ${progressTone}`}
            style={{ width: `${percentageUsed.toFixed(0)}%` }}
          />
        </div>
        <div className="summary-foot">{percentageUsed.toFixed(0)}%</div>
      </section>

      <section className="summary-item dashboard-block">
        <div className="section-head">
          <h2 className="section-title">Insights</h2>
        </div>
        <div className="insights-list">
          <div className="insight-line">
            <strong>⚠️ Budget:</strong> {budgetInsight}
          </div>
          <div className="insight-line">
            <strong>📊 Monthly Comparison:</strong>{' '}
            {monthlyComparison.current > monthlyComparison.last
              ? `You spent ${Math.abs(monthlyComparison.change).toFixed(1)}% more than last month`
              : `You spent ${Math.abs(monthlyComparison.change).toFixed(1)}% less than last month`}
          </div>
          <div className="insight-line">
            <strong>💡 Category:</strong> {topCategoryInsight}
          </div>
        </div>
      </section>
    </section>
  )
}

export default Dashboard
