import { Badge, Button, Card, Col, Row } from 'react-bootstrap'
import { DocIcon, PrintIcon } from '../component/Icons'
import { api } from '../context/api'
import { StatusBadge } from '../component/StatusBadge'

function GatePassResult({ gatePass, onNewEntry }) {
  const doc = gatePass.documents?.[0]
  return (
    <Card border="success">
      <Card.Body>
        <Row className="g-3">
          <Col sm={6}>
            <div className="stat-label">PO Number</div>
            <div className="fs-5 fw-bold">{gatePass.po_number}</div>
          </Col>
          <Col sm={6}>
            <div className="stat-label">Invoice Documents</div>
            <div className="fs-5 fw-bold">
              {gatePass.documents.length} File(s)
            </div>
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center mt-4">
          <span className="stat-label mb-0">Current Status</span>
          <StatusBadge status={gatePass.status} />
        </div>

        {doc && (
          <>
            <div className="stat-label mt-4 mb-2">Document List</div>
            <div className="d-flex align-items-center gap-2 border rounded-3 px-3 py-2">
              <DocIcon width={15} height={15} />
              <span className="flex-grow-1 text-truncate small fw-semibold">
                {doc.filename}
              </span>
              <Badge bg="warning" text="dark">
                {doc.processing_status === 'PROCESSED'
                  ? 'Processed'
                  : 'Queued for AI'}
              </Badge>
            </div>
          </>
        )}

        <div className="text-center my-4">
          <img
            src={api.barcodeUrl(gatePass.gate_pass_id)}
            alt={gatePass.gate_pass_id}
            style={{ maxWidth: 320, width: '100%' }}
          />
          <div className="font-mono fs-4 fw-bold mt-1">
            {gatePass.gate_pass_id}
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            className="flex-fill"
            onClick={onNewEntry}
          >
            New Entry
          </Button>
          <Button
            variant="navy"
            className="flex-fill d-flex align-items-center justify-content-center gap-2"
            onClick={() =>
              window.open(api.barcodeUrl(gatePass.gate_pass_id), '_blank')
            }
          >
            <PrintIcon width={16} height={16} />
            Print Label
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}

export default GatePassResult
