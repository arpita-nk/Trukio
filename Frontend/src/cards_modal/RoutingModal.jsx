import { Alert, Button, Form, Modal } from 'react-bootstrap'
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '../component/Icons'
import { VoiceTextarea } from '../helpers'
import useToast from '../context/useToast'
import { useEffect, useReducer, useState } from 'react'
import { api } from '../context/api'

function lookupReducer(state, action) {
  switch (action.type) {
    case 'RESET':
      return { detail: null, error: null }
    case 'SUCCESS':
      return { detail: action.payload, error: null }
    case 'FAILURE':
      return { detail: null, error: action.payload }
    default:
      return state
  }
}

function RoutingModal({ partNumber, onClose, onRouted }) {
  const toast = useToast()

  const [lookupState, dispatch] = useReducer(lookupReducer, {
    detail: null,
    error: null
  })

  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { detail, error } = lookupState

  // --------------------------------------------------
  // Lookup part WITHOUT Gate Pass
  // --------------------------------------------------

  useEffect(() => {
    let cancelled = false

    dispatch({ type: 'RESET' })

    api
      .lookupPart(partNumber)
      .then((result) => {
        if (cancelled) return
        dispatch({ type: 'SUCCESS', payload: result })
      })
      .catch((err) => {
        if (cancelled) return
        dispatch({
          type: 'FAILURE',
          payload: err.message || 'Part not found'
        })
      })

    return () => {
      cancelled = true
    }
  }, [partNumber])

  // --------------------------------------------------
  // Route part
  // --------------------------------------------------
  const decide = async (action) => {
    if (action === 'QUARANTINE' && !description.trim()) {
      toast('A description is mandatory for quarantine', 'error')
      return
    }
    setSubmitting(true)
    try {
      await api.routePart(detail.part.id, {
        action,
        description: description.trim() || undefined
      })
      toast(
        action === 'GRN' ? 'Part routed to GRN' : 'Part moved to quarantine'
      )
      onRouted()
    } catch (err) {
      toast(err.message || 'Could not update routing', 'error')
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <Modal show onHide={onClose} centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="h5 mb-0">Routing Path</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        {detail && (
          <>
            {/* Part Details */}

            <div className="kv-box">
              <div className="kv-row">
                <span className="k">Part Number:</span>

                <span className="v">{detail.part.part_number}</span>
              </div>

              <div className="kv-row">
                <span className="k">Gate Pass ID:</span>

                <span className="v">{detail.gate_pass_id || 'N/A'}</span>
              </div>

              <div className="kv-row">
                <span className="k">Invoice No:</span>

                <span className="v">{detail.invoice_number || 'N/A'}</span>
              </div>

              <div className="kv-row">
                <span className="k">Quantity:</span>

                <span className="v">
                  {Number(detail.part.quantity || 0).toLocaleString()}
                </span>
              </div>

              <div className="kv-row">
                <span className="k">Routing Status:</span>

                <span className="v">{detail.part.routing_status || 'N/A'}</span>
              </div>
            </div>

            {/* Timeline */}

            <div className="timeline">
              {detail.events.map((ev, i) => (
                <div className="timeline-item" key={i}>
                  <div
                    className={
                      'timeline-dot' +
                      (ev.stage === 'Quarantined' ? ' danger' : '')
                    }
                  >
                    {ev.stage === 'Quarantined' ? (
                      <XCircleIcon width={15} height={15} />
                    ) : (
                      <CheckCircleIcon width={15} height={15} />
                    )}
                  </div>

                  <div>
                    <div className="timeline-title">{ev.stage}</div>

                    <div className="timeline-sub">
                      {ev.description ? ev.description + ' — ' : ''}

                      {new Date(ev.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}

              {detail.part.routing_status === 'PENDING_QC' && (
                <div className="timeline-item">
                  <div className="timeline-dot pending">
                    <ClockIcon width={15} height={15} />
                  </div>

                  <div>
                    <div className="timeline-title muted">Pending Decision</div>

                    <div className="timeline-sub">
                      Awaiting QC inspection outcome
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Routing Actions */}

            {detail.part.routing_status === 'PENDING_QC' ? (
              <>
                <Form.Label className="small fw-bold text-body-secondary">
                  Update Routing State
                </Form.Label>

                <VoiceTextarea
                  value={description}
                  onChange={setDescription}
                  placeholder="Enter description (mandatory for quarantine)"
                />

                <div className="d-flex gap-2 mt-3">
                  <Button
                    variant="success"
                    className="flex-fill d-flex align-items-center justify-content-center gap-2"
                    onClick={() => decide('GRN')}
                    disabled={submitting}
                  >
                    <CheckCircleIcon width={16} height={16} />
                    To GRN
                  </Button>

                  <Button
                    variant="danger"
                    className="flex-fill d-flex align-items-center justify-content-center gap-2"
                    onClick={() => decide('QUARANTINE')}
                    disabled={submitting}
                  >
                    <XCircleIcon width={16} height={16} />
                    Quarantine
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-body-secondary small">
                This part has already been routed
                {detail.part.routing_status === 'QUARANTINED'
                  ? ' to quarantine.'
                  : ' to GRN.'}
              </div>
            )}
          </>
        )}
      </Modal.Body>
    </Modal>
  )
}

export default RoutingModal
