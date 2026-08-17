import Navbar from 'react-bootstrap/Navbar'
import Button from 'react-bootstrap/Button'
import { PrintIcon } from './Icons.jsx'

export default function Header({ title }) {
  return (
    <Navbar className="topbar" bg="white" expand>
      <Navbar.Brand className="fw-bold">
        Digi<span className="accent">Trail</span>
      </Navbar.Brand>
      <div className="fw-semibold text-body-emphasis mx-auto d-none d-md-block">
        {title}
      </div>
      <div className="d-flex align-items-center gap-2 ms-auto">
        <span className="status-pill">
          <span className="status-dot" />
          Live
        </span>
        <Button
          variant="outline-secondary"
          size="sm"
          title="Print"
          className="d-flex align-items-center"
        >
          <PrintIcon width={16} height={16} />
        </Button>
      </div>
    </Navbar>
  )
}
