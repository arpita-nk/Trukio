import { useEffect, useState } from 'react'
import Card from 'react-bootstrap/Card'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Button from 'react-bootstrap/Button'

import { api } from '../context/api.jsx'
import useToast from '../context/useToast.jsx'
import { PackageIcon, RouteIcon, SearchIcon } from '../component/Icons.jsx'
import RoutingModal from '../cards_modal/RoutingModal.jsx'
import { Table } from 'react-bootstrap'

export default function QC() {
  const toast = useToast()
  const [partNumber, setPartNumber] = useState('')
  const [modalPart, setModalPart] = useState(null)
  const [loadingParts, setLoadingParts] = useState(false)
  const [filteredParts, setFilteredParts] = useState([])

  const loadParts = async () => {
    setLoadingParts(true)

    try {
      const result = await api.getAllParts()

      setFilteredParts(result)
    } catch (err) {
      console.error('Failed to load parts:', err)

      setFilteredParts([])

      toast(err.message || 'Could not load parts', 'error')
    } finally {
      setLoadingParts(false)
    }
  }

  useEffect(() => {
    loadParts()
  }, [])

  const openPart = (pn) => {
    const value = pn?.trim()

    if (!value) return

    setModalPart(value)
  }

  const submitPartScan = () => {
    const value = partNumber.trim()

    if (!value) {
      toast('Enter or scan a part number', 'error')
      return
    }

    openPart(value)
  }

  const refreshAfterRoute = () => {
    setModalPart(null)
    setPartNumber('')
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Part Routing</h1>
          <div className="page-sub">
            Scan or enter a Part Number to inspect and route the part.
          </div>
        </div>
      </div>

      <Card>
        <Card.Header className="dt-header">
          <RouteIcon width={17} height={17} color="var(--dt-gold)" />
          <span>Part Routing</span>
        </Card.Header>

        <Card.Body>
          <div className="text-body-secondary small mb-3">
            Scan a part QR code to process automatically, or enter the Part
            Number manually to search.
          </div>

          <Form.Label className="small fw-bold text-uppercase text-body-secondary">
            Part Number *
          </Form.Label>

          <div className="d-flex gap-2">
            <InputGroup className="flex-grow-1">
              <InputGroup.Text>
                <SearchIcon width={16} height={16} />
              </InputGroup.Text>

              <Form.Control
                placeholder="Scan or enter Part Number..."
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    submitPartScan()
                  }
                }}
                autoFocus
              />
            </InputGroup>

            <Button
              variant="navy"
              className="d-flex align-items-center gap-2"
              onClick={submitPartScan}
            >
              <SearchIcon width={15} height={15} />
              Scan
            </Button>

            {/* <ScanCameraButton /> */}
          </div>
        </Card.Body>
      </Card>

      <Card className="mt-3">
        <Card.Header className="dt-header">
          <PackageIcon width={17} height={17} color="var(--dt-gold)" />

          <span>All Parts ({filteredParts.length})</span>
        </Card.Header>

        <div className="table-responsive">
          <Table hover className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Part Number</th>
                <th>Gate Pass ID</th>
                <th>Invoice</th>
                <th>Quantity</th>
                <th>Routing Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loadingParts && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-body-secondary py-4"
                  >
                    Loading parts...
                  </td>
                </tr>
              )}

              {!loadingParts &&
                filteredParts.map((part) => (
                  <tr key={part.id}>
                    <td className="font-mono fw-bold">{part.part_number}</td>

                    <td className="font-mono">{part.gate_pass_id || '—'}</td>

                    <td>{part.invoice_number || '—'}</td>

                    <td>{Number(part.quantity || 0).toLocaleString()}</td>

                    <td>{part.routing_status || '—'}</td>

                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => openPart(part.part_number)}
                      >
                        Route Part
                      </Button>
                    </td>
                  </tr>
                ))}

              {!loadingParts && !filteredParts.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center text-body-secondary py-4"
                  >
                    No parts found.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      {modalPart && (
        <RoutingModal
          partNumber={modalPart}
          onClose={() => setModalPart(null)}
          onRouted={refreshAfterRoute}
        />
      )}
    </div>
  )
}
