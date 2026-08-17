import {
  Button,
  Card,
  Col,
  FormControl,
  InputGroup,
  Row
} from 'react-bootstrap'
import { DocIcon, SearchIcon } from '../component/Icons'
import { StatusBadge } from '../component/StatusBadge'
import { useEffect, useState } from 'react'
import useToast from '../context/useToast'
import { api } from '../context/api'
import InvoiceDocCard from '../cards_modal/InvoiceDocCard'
import InvoiceSummaryCard from '../cards_modal/InvoiceSummaryCard'

function SortInvoices() {
  const toast = useToast()

  const [query, setQuery] = useState('')
  const [gatePass, setGatePass] = useState(null)
  // All invoices
  const [invoices, setInvoices] = useState([])
  // Currently selected invoice
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [loading, setLoading] = useState(false)

  // LOAD ALL INVOICES WHEN PAGE LOADS
  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true)

      try {
        const data = await api.getAllInvoices()

        console.log('GET ALL INVOICES RESPONSE:', data)

        setInvoices(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to load invoices:', err)
        toast(err.message || 'Failed to load invoices', 'error')
        setInvoices([])
      } finally {
        setLoading(false)
      }
    }

    loadInvoices()
  }, [toast])

  // SEARCH GATE PASS
  const search = async () => {
    const value = query.trim()

    if (!value) return

    setLoading(true)

    try {
      const gp = await api.getGatePass(value)

      const docs = await api.getInvoices(gp.gate_pass_id)

      setGatePass(gp)
      setInvoices(docs)
      setQuery(gp.gate_pass_id)

      // Clear previously selected invoice
      setSelectedInvoice(null)

      toast(`Loaded gate pass: ${gp.gate_pass_id}`)
    } catch (err) {
      toast(err.message || 'Gate pass not found', 'error')

      setGatePass(null)
      setInvoices([])
      setSelectedInvoice(null)
    } finally {
      setLoading(false)
    }
  }

  // BACK TO ALL INVOICES
  const backToInvoices = () => {
    setSelectedInvoice(null)
  }

  // PATCH INVOICE
  const patchInvoiceField = async (docId, field, value) => {
    try {
      const updated = await api.updateInvoice(docId, {
        [field]: value
      })

      // Update invoice list
      setInvoices((prev) => prev.map((d) => (d.id === docId ? updated : d)))

      // Update selected invoice also
      setSelectedInvoice((prev) => (prev?.id === docId ? updated : prev))
    } catch (err) {
      toast(err.message || 'Failed to update invoice', 'error')
    }
  }

  // PATCH PART
  const patchPartField = async (docId, partId, field, value) => {
    try {
      const updated = await api.updatePart(partId, {
        [field]: value
      })

      // Update invoice list
      setInvoices((prev) =>
        prev.map((doc) =>
          doc.id !== docId
            ? doc
            : {
                ...doc,
                parts: doc.parts.map((part) =>
                  part.id === partId ? updated : part
                )
              }
        )
      )

      // Update selected invoice
      setSelectedInvoice((prev) => {
        if (!prev || prev.id !== docId) {
          return prev
        }

        return {
          ...prev,
          parts: prev.parts.map((part) => (part.id === partId ? updated : part))
        }
      })
    } catch (err) {
      toast(err.message || 'Failed to update part', 'error')
    }
  }

  // SELECTED INVOICE VIEW
  if (selectedInvoice) {
    return (
      <div>
        <div className="page-head">
          <div>
            <h1 className="page-title">Invoice Details</h1>

            <div className="page-sub">
              Review and edit invoice and part information.
            </div>
          </div>

          <Button
            variant="outline-secondary"
            size="sm"
            onClick={backToInvoices}
          >
            ← Back to Invoices
          </Button>
        </div>

        {gatePass && (
          <Card className="mb-3">
            <Card.Body>
              <Row className="g-3 align-items-center">
                <Col sm="auto">
                  <div className="stat-label">Gate Pass ID</div>

                  <div className="fw-bold font-mono">
                    {gatePass.gate_pass_id}
                  </div>
                </Col>

                <Col sm="auto">
                  <div className="stat-label">Vehicle</div>

                  <div className="fw-bold font-mono">
                    {gatePass.truck_number}
                  </div>
                </Col>

                <Col sm="auto" className="ms-auto">
                  <StatusBadge status={gatePass.status} />
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        <InvoiceDocCard
          key={selectedInvoice.id}
          doc={selectedInvoice}
          onPatchInvoice={(field, value) =>
            patchInvoiceField(selectedInvoice.id, field, value)
          }
          onPatchPart={(partId, field, value) =>
            patchPartField(selectedInvoice.id, partId, field, value)
          }
          toast={toast}
        />
      </div>
    )
  }

  // MAIN INVOICE LIST VIEW
  return (
    <div>
      {/* PAGE HEADER */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Sorting Invoices</h1>

          <div className="page-sub">Review and sort all invoice documents.</div>
        </div>

        {gatePass && (
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setGatePass(null)
              setQuery('')
              setSelectedInvoice(null)

              // Reload all invoices
              api
                .getAllInvoices()
                .then((data) => setInvoices(Array.isArray(data) ? data : []))
                .catch(() => setInvoices([]))
            }}
          >
            Back to All Invoices
          </Button>
        )}
      </div>

      {/* SEARCH */}
      <Card className="mb-4">
        <Card.Header className="dt-header">
          <SearchIcon width={17} height={17} color="var(--dt-gold)" />

          <span>Find Gate Pass</span>
        </Card.Header>

        <Card.Body>
          <div className="d-flex gap-2">
            <InputGroup className="flex-grow-1">
              <FormControl
                placeholder="Scan or enter Gate Pass ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
              />
            </InputGroup>

            <Button variant="primary" onClick={search} disabled={loading}>
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* GATE PASS INFORMATION AFTER SEARCH */}
      {gatePass && (
        <Card className="mb-4">
          <Card.Body>
            <Row className="g-3 align-items-center">
              <Col sm="auto">
                <div className="stat-label">Gate Pass ID</div>

                <div className="fw-bold font-mono">{gatePass.gate_pass_id}</div>
              </Col>

              <Col sm="auto">
                <div className="stat-label">Vehicle</div>

                <div className="fw-bold font-mono">{gatePass.truck_number}</div>
              </Col>

              <Col sm="auto" className="ms-auto">
                <StatusBadge status={gatePass.status} />
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* INVOICE CARDS */}
      {loading ? (
        <div className="text-center py-5 text-body-secondary">
          Loading invoices...
        </div>
      ) : invoices.length ? (
        <Row xs={1} sm={2} lg={4} className="g-3">
          {invoices.map((doc) => (
            <Col key={doc.id}>
              <InvoiceSummaryCard
                invoice={doc}
                onClick={() => {
                  console.log('Selected invoice:', doc)

                  // Open InvoiceDocCard
                  setSelectedInvoice(doc)
                }}
              />
            </Col>
          ))}
        </Row>
      ) : (
        <div className="empty-state">
          <DocIcon width={30} height={30} />
          <div className="et-title">No invoice documents</div>
          No invoices are available.
        </div>
      )}
    </div>
  )
}

export default SortInvoices
