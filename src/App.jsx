import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import { isLoggedIn } from './utils/auth'
import AppLayout from './components/AppLayout'
import AddExpense from './pages/AddExpense'
import Transactions from './pages/Transactions'
import Charts from './pages/Charts'
import Budget from './pages/Budget'
import Predict from './pages/Predict'
import Profile from './pages/Profile'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={isLoggedIn() ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="add-expense" element={<AddExpense />} />
        <Route path="view-expenses" element={<Transactions />} />
        <Route path="set-budget" element={<Budget />} />
        <Route path="predict-expense" element={<Predict />} />
        <Route path="profile" element={<Profile />} />
        <Route path="charts" element={<Charts />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
