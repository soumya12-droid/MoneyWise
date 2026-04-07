const TRANSACTIONS_KEY = 'moneywise.transactions'
const BUDGET_KEY = 'moneywise.monthlyBudget'

export const loadTransactions = () => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveTransactions = (transactions) => {
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
}

export const addTransaction = (transaction) => {
  const existing = loadTransactions()
  const next = [transaction, ...existing]
  saveTransactions(next)
  return next
}

export const loadMonthlyBudget = () => {
  const raw = localStorage.getItem(BUDGET_KEY)
  if (!raw) return 0
  const n = Number(raw)
  return Number.isFinite(n) ? n : 0
}

export const saveMonthlyBudget = (budget) => {
  const n = Number(budget)
  localStorage.setItem(BUDGET_KEY, String(Number.isFinite(n) ? n : 0))
}

