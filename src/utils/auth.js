const AUTH_KEY = 'isLoggedIn'
const THEME_KEY = 'moneywise.theme'

export const login = () => {
  localStorage.setItem(AUTH_KEY, 'true')
}

export const logout = () => {
  localStorage.removeItem(AUTH_KEY)
}

export const isLoggedIn = () => localStorage.getItem(AUTH_KEY) === 'true'

export const loadTheme = () => localStorage.getItem(THEME_KEY) || 'light'
export const saveTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme)
}
