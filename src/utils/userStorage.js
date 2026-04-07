const USER_KEY = 'moneywise.user'
const SESSION_USER_KEY = 'moneywise.sessionUser'

export const loadRegisteredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

export const saveRegisteredUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const saveSessionUser = (user) => {
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user))
}

export const loadSessionUser = () => {
  try {
    const raw = localStorage.getItem(SESSION_USER_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const clearSessionUser = () => {
  localStorage.removeItem(SESSION_USER_KEY)
}

