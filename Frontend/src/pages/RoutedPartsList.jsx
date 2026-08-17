import { useCallback, useEffect, useState } from 'react'
import Card from 'react-bootstrap/Card'
import Nav from 'react-bootstrap/Nav'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Table from 'react-bootstrap/Table'
import Badge from 'react-bootstrap/Badge'
import { api } from '../context/api.jsx'
import { SearchIcon, PackageIcon } from '../component/Icons.jsx'

const TABS = [
  { key: 'grn', label: 'GRN Approved Parts' },
  { key: 'pending', label: 'Pending / QC Parts' },
  { key: 'quarantined', label: 'Quarantined Parts' },
  { key: 'completed', label: 'Completed Parts' }
]

export default function RoutedPartsList() {
  const [tab, setTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [data, setData] = useState({ counts: {}, rows: {} })

  const load = useCallback(() => {
    api.partsOverview(search || undefined).then(setData)
  }, [search])

  useEffect(() => {
    load()
  }, [load])

  const rows = data.rows?.[tab] || []

  return (
    <div>
      <div className="page-head">
        <div>
          <h1 className="page-title">Parts Status Overview</h1>
          <div className="page-sub">
            View all parts processed through QC routing.
          </div>
        </div>
        <InputGroup style={{ maxWidth: 320 }}>
          <InputGroup.Text>
            <SearchIcon width={16} height={16} />
          </InputGroup.Text>
          <Form.Control
            placeholder="Search parts, invoices or gate pass..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>
      </div>

      <Card>
        <Card.Header className="bg-white border-bottom-0 pb-0">
          <Nav
            variant="tabs"
            activeKey={tab}
            onSelect={(k) => setTab(k)}
            className="border-bottom-0"
          >
            {TABS.map((t) => (
              <Nav.Item key={t.key}>
                <Nav.Link
                  eventKey={t.key}
                  className="d-flex align-items-center gap-2"
                >
                  {t.label}
                  <Badge bg={tab === t.key ? 'primary' : 'secondary'} pill>
                    {data.counts?.[t.key] ?? 0}
                  </Badge>
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Header>

        <div className="table-responsive">
          <Table className="mb-0 align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Gate Pass ID</th>
                <th>Invoice No.</th>
                <th>Part Number</th>
                <th>Quantity</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.part_id}>
                  <td>
                    <div className="fw-bold">{r.date}</div>
                    <div className="small text-body-secondary">{r.time}</div>
                  </td>
                  <td className="font-mono">{r.gate_pass_id}</td>
                  <td>{r.invoice_no}</td>
                  <td>
                    {r.mismatch ? (
                      <span className="font-mono fw-bold text-danger bg-danger-subtle px-2 py-1 rounded-2">
                        {r.part_number}
                      </span>
                    ) : (
                      <span className="font-mono fw-bold">{r.part_number}</span>
                    )}
                  </td>
                  <td>{r.quantity.toLocaleString()}</td>
                  <td className="text-body-secondary">
                    {r.description || '\u2014'}
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <PackageIcon width={26} height={26} />
                      <div className="et-title">No parts in this state</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
