import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import Header from './component/Header.jsx'
import Sidebar from './component/Sidebar.jsx'
import GateCheckIn from './pages/GateCheckIn.jsx'
import PartsUnload from './pages/PartsUnload.jsx'
import SortInvoices from './pages/SortInvoices.jsx'
import RoutedPartsList from './pages/RoutedPartsList.jsx'
import QC from './pages/Qc.jsx'

const TITLES = {
  '/gate-check-in': 'Gate check in',
  '/parts-unload': 'Parts Unload',
  '/sort-invoices': 'Sort Invoices',
  '/qc': 'QC',
  '/routed-parts-list': 'Routed Parts List'
}

export default function App() {
  const location = useLocation()
  const title = TITLES[location.pathname] || 'Gate check in'

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-col">
        <Header title={title} />
        <div className="page-content">
          <Routes>
            <Route
              path="/"
              element={<Navigate to="/gate-check-in" replace />}
            />
            <Route path="/gate-check-in" element={<GateCheckIn />} />
            <Route path="/parts-unload" element={<PartsUnload />} />
            <Route path="/sort-invoices" element={<SortInvoices />} />
            <Route path="/qc" element={<QC />} />
            <Route path="/routed-parts-list" element={<RoutedPartsList />} />
            <Route
              path="*"
              element={<Navigate to="/gate-check-in" replace />}
            />
          </Routes>
        </div>
      </div>
    </div>
  )
}
