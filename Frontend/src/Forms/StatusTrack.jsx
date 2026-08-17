import { Button, Card, FormControl, InputGroup } from 'react-bootstrap'
import { CameraIcon, SearchIcon } from '../component/Icons'
import useToast from '../context/useToast'
import { useState } from 'react'

function StatusTrack() {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [gatePass, setGatePass] = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)

  return (
    <div>
      <Card>
        <Card.Header className="dt-header">
          <SearchIcon width={17} height={17} color="var(--dt-gold)" />
          <span>Find Gate Pass</span>
        </Card.Header>
        <Card.Body>
          <div className="d-flex gap-2">
            <InputGroup className="flex-grow-1">
              <FormControl
                placeholder="Scan or enter Gate Pass ID..."
                // value={query}
                // onChange={(e) => setQuery(e.target.value)}
                // onKeyDown={(e) => e.key === 'Enter' && search()}
              />
            </InputGroup>
            <Button
              variant="primary"
              // onClick={() => search()}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>

            <Button
              variant="outline-secondary"
              className="d-flex align-items-center gap-2 text-nowrap"
              onClick={() => setScanning((s) => !s)}
            >
              <CameraIcon width={16} height={16} />
              {scanning ? 'Close Camera' : 'Scan'}
            </Button>
          </div>
        </Card.Body>
      </Card>
      {/* {gatePass && (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
              <div>
                <div className="status-tracker-id">{gatePass.gate_pass_id}</div>
                <div className="status-tracker-meta">
                  Vehicle: {gatePass.truck_number} &bull; PO:{' '}
                  {gatePass.po_number}
                </div>
              </div>
              <div className="text-end">
                <div className="stat-label">Current Status</div>
                <div className="mt-1">
                  <StatusBadge status={gatePass.status} />
                </div>
              </div>
            </div>

            {nextState ? (
              <Alert variant="light" className="border text-center mb-0">
                <div className="stat-label mb-1">Next Allowed State:</div>
                <div className="fs-4 fw-bold font-mono mb-3">{nextState}</div>
                <Button
                  variant="success"
                  className="d-inline-flex align-items-center gap-2"
                  onClick={progress}
                >
                  Progress to {nextState}
                  <ArrowRightIcon width={16} height={16} />
                </Button>
              </Alert>
            ) : (
              <Alert variant="success" className="text-center mb-0">
                <CheckCircleIcon width={28} height={28} />
                <div className="fs-4 fw-bold mt-2">COMPLETED</div>
                <div className="small mt-1">
                  This Gate Pass has reached the final status and cannot be
                  progressed further.
                </div>
              </Alert>
            )}
          </Card.Body>
        </Card>
      )} */}
    </div>
  )
}

export default StatusTrack
