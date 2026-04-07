import { useEffect, useMemo, useState } from 'react'
import { loadTransactions } from '../utils/moneywiseStorage'

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0)

const monthKey = (dateISO) => {
  const d = new Date(dateISO)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function Predict() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    setTransactions(loadTransactions())
  }, [])

  const expenseTransactions = useMemo(
    () => transactions.filter((t) => t.type === 'expense' && Number(t.amount || 0) > 0),
    [transactions],
  )

  const monthlyExpenseSeries = useMemo(() => {
    const map = new Map()
    for (const t of expenseTransactions) {
      const key = monthKey(t.date)
      if (!key) continue
      map.set(key, (map.get(key) || 0) + Number(t.amount || 0))
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [expenseTransactions])

  const categoryMonthlyAverage = useMemo(() => {
    const perCategoryPerMonth = new Map()
    for (const t of expenseTransactions) {
      const key = monthKey(t.date)
      if (!key) continue
      if (!perCategoryPerMonth.has(t.category)) perCategoryPerMonth.set(t.category, new Map())
      const monthMap = perCategoryPerMonth.get(t.category)
      monthMap.set(key, (monthMap.get(key) || 0) + Number(t.amount || 0))
    }

    const averages = []
    for (const [category, monthMap] of perCategoryPerMonth.entries()) {
      const values = [...monthMap.values()]
      const avg = values.reduce((sum, v) => sum + v, 0) / values.length
      averages.push({ category, avg, monthsCount: values.length })
    }

    return averages.sort((a, b) => b.avg - a.avg)
  }, [expenseTransactions])

  const predictedTotalNextMonth = useMemo(() => {
    if (monthlyExpenseSeries.length === 0) return 0
    const total = monthlyExpenseSeries.reduce((sum, [, value]) => sum + value, 0)
    return total / monthlyExpenseSeries.length
  }, [monthlyExpenseSeries])

  return (
    <section className="page-card">
      <h1>Predict Expense</h1>
      <p className="muted-text">
        Prediction uses simple averages from your past expenses (no ML): average = sum / count.
      </p>

      {expenseTransactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-title">Not enough data to predict</div>
          <div className="empty-desc">Add some expense transactions across months first.</div>
        </div>
      ) : (
        <>
          <div className="summary-row summary-row-3-custom">
            <div className="summary-item">
              <div className="summary-label">Predicted Total Next Month</div>
              <div className="summary-value">{formatINR(predictedTotalNextMonth)}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Months Considered</div>
              <div className="summary-value">{monthlyExpenseSeries.length}</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">Categories Considered</div>
              <div className="summary-value">{categoryMonthlyAverage.length}</div>
            </div>
          </div>

          <div className="section-split" />

          <h2 className="section-title">Predicted Category Breakdown</h2>
          <div className="table-wrap">
            <table className="table" aria-label="Predicted category breakdown">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Avg/Month</th>
                  <th>Months Used</th>
                </tr>
              </thead>
              <tbody>
                {categoryMonthlyAverage.map((item) => (
                  <tr key={item.category}>
                    <td>{item.category}</td>
                    <td className="amount-cell">{formatINR(item.avg)}</td>
                    <td>{item.monthsCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}

export default Predict
