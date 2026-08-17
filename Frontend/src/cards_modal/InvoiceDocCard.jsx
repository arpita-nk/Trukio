import { Alert, Badge, Button, Card, FormCheck, Table } from 'react-bootstrap'
import { AlertIcon, DocIcon, PrintIcon } from '../component/Icons'
import { EditableCell, EditableRow } from '../helpers'
import { useState } from 'react'
import { api } from '../context/api'

function InvoiceDocCard({ doc, onPatchInvoice, onPatchPart, toast }) {
  const [selected, setSelected] = useState([])

  const toggleAll = (checked) => {
    setSelected(checked ? doc.parts.map((p) => p.id) : [])
  }
  const toggleOne = (id, checked) => {
    setSelected((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    )
  }

  const printSelected = async () => {
    if (!selected.length) return
    try {
      await api.printParts(selected)
      toast(
        `Printing directly to thermal printer... (${selected.length} label${selected.length > 1 ? 's' : ''})`
      )
      selected.forEach((id) => window.open(api.partQrUrl(id), '_blank'))
      setSelected([])
    } catch (err) {
      toast(err.message || 'Print failed', 'error')
    }
  }

  const hasMismatch = doc.parts.some((p) => p.mismatch)

  return (
    <Card>
      <Card.Header className="dt-header dt-header-navy">
        <DocIcon width={18} height={18} />
        <span className="flex-grow-1">{doc.filename}</span>
        <Badge
          bg={doc.processing_status === 'PROCESSED' ? 'success' : 'warning'}
          text={doc.processing_status === 'PROCESSED' ? undefined : 'dark'}
        >
          {doc.processing_status.replace(/_/g, ' ')}
        </Badge>
      </Card.Header>

      <div className="table-responsive">
        <Table className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value (click any value to edit)</th>
            </tr>
          </thead>
          <tbody>
            <EditableRow
              label="Po Number"
              value={doc.po_number}
              onSave={(v) => onPatchInvoice('po_number', v)}
            />
            <EditableRow
              label="Invoice Number"
              value={doc.invoice_number}
              onSave={(v) => onPatchInvoice('invoice_number', v)}
            />
            <EditableRow
              label="Invoice Date"
              value={doc.invoice_date}
              onSave={(v) => onPatchInvoice('invoice_date', v)}
            />
            <EditableRow
              label="Supplier Name"
              value={doc.supplier_name}
              onSave={(v) => onPatchInvoice('supplier_name', v)}
            />
            <tr>
              <td>Verification Status</td>
              <td>
                <Badge
                  bg={
                    doc.verification_status === 'MISMATCH'
                      ? 'danger'
                      : 'success'
                  }
                >
                  {doc.verification_status}
                </Badge>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>

      <Card.Body className="pb-2">
        <div className="d-flex justify-content-between align-items-center">
          <div className="stat-label mb-0">Tabular Data (Parts)</div>
          <Button
            variant="navy"
            size="sm"
            className="d-flex align-items-center gap-2"
            onClick={printSelected}
            disabled={!selected.length}
          >
            <PrintIcon width={14} height={14} />
            Print Selected ({selected.length})
          </Button>
        </div>
        {hasMismatch && (
          <Alert
            variant="warning"
            className="d-flex align-items-center gap-2 mt-3 mb-0 py-2"
          >
            <AlertIcon width={16} height={16} />
            Datas are differ from master data please verify
          </Alert>
        )}
      </Card.Body>

      <div className="table-responsive">
        <Table hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>
                <FormCheck
                  checked={
                    selected.length === doc.parts.length && doc.parts.length > 0
                  }
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </th>
              <th>Part Number</th>
              <th>Quantity</th>
              <th>Internal Part Number</th>
              <th>Status</th>
              <th>Gate (GRN/QC)</th>
            </tr>
          </thead>
          <tbody>
            {doc.parts.map((p) => (
              <tr key={p.id} className={p.mismatch ? 'row-mismatch' : ''}>
                <td>
                  <FormCheck
                    checked={selected.includes(p.id)}
                    onChange={(e) => toggleOne(p.id, e.target.checked)}
                  />
                </td>
                <td
                  className={
                    'font-mono' + (p.mismatch ? ' text-danger fw-bold' : '')
                  }
                >
                  {p.part_number}
                </td>
                <td>{p.quantity.toLocaleString()}</td>
                <td>
                  <EditableCell
                    value={p.internal_part_number}
                    onSave={(v) => onPatchPart(p.id, 'internal_part_number', v)}
                  />
                </td>
                <td>
                  <Badge bg={p.invoice_status === 'QC' ? 'info' : 'secondary'}>
                    {p.invoice_status}
                  </Badge>
                </td>
                <td>
                  <Badge bg="info">{p.gate_stage}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </Card>
  )
}

export default InvoiceDocCard
