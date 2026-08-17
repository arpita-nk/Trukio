import { Card } from 'react-bootstrap'
import {
  CheckCircleIcon,
  ClockIcon,
  DocIcon,
  TruckIcon
} from '../component/Icons'

function InvoiceSummaryCard({ invoice, onClick }) {
  const parts = invoice.parts || []

  const partsLeft = parts.filter((part) => !part.printed).length

  const processingStatus = invoice.processing_status || 'QUEUED_FOR_AI'

  const gateStage = parts.length > 0 ? parts[0].gate_stage : null

  const getProcessingLabel = (status) => {
    switch (status) {
      case 'PROCESSED':
        return 'PROCESSED'

      case 'QUEUED_FOR_AI':
        return 'PROCESSING'

      default:
        return status
    }
  }

  const getStageLabel = (stage) => {
    switch (stage) {
      case 'UNLOADING-START':
        return 'UNLOADING-START'

      case 'UNLOADING-OVER':
        return 'UNLOADING-OVER'

      case 'QC':
        return 'QC'

      case 'GRN':
        return 'GRN'

      default:
        return stage
    }
  }

  return (
    <Card
      className="invoice-summary-card h-100"
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <Card.Body className="p-3">
        {/* Header */}
        <div className="d-flex align-items-center gap-2 mb-2">
          <div className="invoice-icon">
            <DocIcon width={18} height={18} color="var(--dt-blue)" />
          </div>

          <div
            className="invoice-filename text-truncate"
            title={invoice.filename}
          >
            Inv: {invoice.filename || `Invoice #${invoice.id}`}
          </div>
        </div>

        {/* Gate Pass */}
        <div className="invoice-meta">
          <span className="meta-icon">
            <DocIcon width={13} height={13} />
          </span>

          <span>
            GP:{' '}
            {invoice.gate_pass?.gate_pass_id ||
              invoice.gate_pass_id ||
              invoice.gate_pass_pk ||
              '-'}
          </span>
        </div>

        {/* Vehicle */}
        {invoice.gate_pass?.truck_number && (
          <div className="invoice-meta">
            <TruckIcon width={13} height={13} />

            <span>{invoice.gate_pass.truck_number}</span>
          </div>
        )}

        {/* Status row */}
        <div className="d-flex align-items-center justify-content-between mt-3 gap-2">
          {/* Processing */}
          <span
            className={
              processingStatus === 'PROCESSED'
                ? 'invoice-status processed'
                : 'invoice-status processing'
            }
          >
            {processingStatus === 'PROCESSED' ? (
              <CheckCircleIcon width={13} height={13} />
            ) : (
              <ClockIcon width={13} height={13} />
            )}

            {getProcessingLabel(processingStatus)}
          </span>

          {/* Gate Stage */}
          {gateStage && (
            <span className="invoice-stage">{getStageLabel(gateStage)}</span>
          )}
        </div>

        {/* Parts */}
        <div className="mt-2">
          <span className="parts-left">{partsLeft} PARTS LEFT</span>
        </div>
      </Card.Body>
    </Card>
  )
}

export default InvoiceSummaryCard
