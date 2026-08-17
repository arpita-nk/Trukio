import Nav from 'react-bootstrap/Nav'
import { NavLink } from 'react-router-dom'
import {
  ShieldIcon,
  PackageIcon,
  DocIcon,
  CheckCircleIcon,
  RouteIcon
} from './Icons.jsx'

const NAV = [
  { to: '/gate-check-in', label: 'Gate Check-In', icon: ShieldIcon },
  { to: '/parts-unload', label: 'Parts Unload', icon: PackageIcon },
  { to: '/sort-invoices', label: 'Sort Invoices', icon: DocIcon },
  { to: '/qc', label: 'QC', icon: CheckCircleIcon },
  { to: '/routed-parts-list', label: 'Routed Parts List', icon: RouteIcon }
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="d-flex align-items-center gap-2">
        <div className="brand-mark">D</div>
        <div>
          <div className="brand-name">DigiTrail</div>
          <div className="brand-sub">Gate Entry</div>
        </div>
      </div>

      <div className="nav-section-label">Gate Entry</div>
      <Nav className="flex-column" variant="pills">
        {NAV.map((item) => (
          <Nav.Item key={item.to}>
            <Nav.Link
              as={NavLink}
              to={item.to}
              className={({ isActive }) =>
                'd-flex align-items-center gap-2' + (isActive ? ' active' : '')
              }
            >
              <item.icon width={17} height={17} />
              {item.label}
            </Nav.Link>
          </Nav.Item>
        ))}
      </Nav>

      <div className="sidebar-footer">
        <div className="avatar">A</div>
        <div>
          <div className="name">Demo Admin</div>
          <div className="email">demo-admin@mysoreminds.in</div>
        </div>
      </div>
    </aside>
  )
}
