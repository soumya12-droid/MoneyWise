import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

function AppLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
