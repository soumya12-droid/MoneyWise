import { useEffect, useState } from 'react'
import ExpenseChartsCanvas from '../components/ExpenseChartsCanvas'
import { loadTransactions } from '../utils/moneywiseStorage'

function Charts() {
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    setTransactions(loadTransactions())
  }, [])

  return (
    <section className="page-card">
      <h1>Charts</h1>
      <p className="muted-text">Category-wise pie chart and monthly bar chart from your expense data.</p>
      <ExpenseChartsCanvas transactions={transactions} />
    </section>
  )
}

export default Charts
