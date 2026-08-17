import { useCallback, useEffect, useState } from 'react'
import {
  Col,
  InputGroup,
  Row,
  Form,
  ButtonGroup,
  Button,
  Card,
  Table
} from 'react-bootstrap'
import {
  CheckCircleIcon,
  ClockIcon,
  DocIcon,
  GridIcon,
  PackageIcon,
  SearchIcon,
  TruckIcon
} from '../component/Icons'
import { StatusBadge } from '../component/StatusBadge'
import { api } from '../context/api'

const STAT_DEFS = [
  {
    key: 'total',
    label: 'Total Gate Passes',
    icon: DocIcon,
    color: 'var(--dt-blue)',
    bg: 'var(--dt-blue-100)'
  },
  {
    key: 'checkin',
    label: 'Check-In',
    icon: TruckIcon,
    color: 'var(--dt-blue)',
    bg: 'var(--dt-blue-100)'
  },
  {
    key: 'unloading_start',
    label: 'Unloading Start',
    icon: PackageIcon,
    color: 'var(--dt-amber)',
    bg: 'var(--dt-amber-100)'
  },
  {
    key: 'unloading_over',
    label: 'Unloading Over',
    icon: PackageIcon,
    color: 'var(--dt-purple)',
    bg: 'var(--dt-purple-100)'
  },
  {
    key: 'checkout',
    label: 'Checkout',
    icon: CheckCircleIcon,
    color: 'var(--dt-green)',
    bg: 'var(--dt-green-100)'
  }
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

const STATUS_FOR_STAT = {
  checkin: 'CHECKIN',
  unloading_start: 'UNLOADING-START',
  unloading_over: 'UNLOADING-OVER',
  checkout: 'CHECKOUT'
}

function fmtElapsed(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

function GateList({ variant, statData }) {
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState(todayStr())
  const [dateTo, setDateTo] = useState(todayStr())
  const [dateMode, setDateMode] = useState('today')
  const [data, setData] = useState(statData)
  const [selectedStat, setSelectedStat] = useState(null)
  const [tick, setTick] = useState(0)

  const load = useCallback(() => {
    api
      .dashboard({
        search: search || undefined,
        date_from: dateFrom,
        date_to: dateTo
      })
      .then(setData)
  }, [search, dateFrom, dateTo])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const setDateModeQuick = (mode) => {
    setDateMode(mode)
    const d = new Date()
    if (mode === 'yesterday') d.setDate(d.getDate() - 1)
    const s = d.toISOString().slice(0, 10)
    setDateFrom(s)
    setDateTo(s)
  }

  const rows = statData?.rows || []
  const filteredRows = selectedStat
    ? rows.filter((r) => r.status === STATUS_FOR_STAT[selectedStat])
    : rows

  return (
    <div>
      {variant === 'dashboard' && (
        <div className="d-flex align-items-center gap-2 mb-3">
          <GridIcon width={20} height={20} color="var(--dt-gold)" />
          <div>
            <h3 className="mb-0 h5 fw-bold">Gate Pass Dashboard</h3>
            <div className="page-sub">
              Live monitoring &amp; analytics for all gate operations
            </div>
          </div>
        </div>
      )}

      <Row className="g-2 align-items-center mb-3">
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <SearchIcon width={16} height={16} />
            </InputGroup.Text>
            <Form.Control
              placeholder="Search by truck number or gate pass ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col xs="auto" className="small fw-bold text-body-secondary">
          Filter Date:
        </Col>
        <Col xs="auto">
          <ButtonGroup size="sm">
            <Button
              variant={dateMode === 'today' ? 'primary' : 'outline-secondary'}
              onClick={() => setDateModeQuick('today')}
            >
              Today
            </Button>
            <Button
              variant={
                dateMode === 'yesterday' ? 'primary' : 'outline-secondary'
              }
              onClick={() => setDateModeQuick('yesterday')}
            >
              Yesterday
            </Button>
          </ButtonGroup>
        </Col>
        <Col xs="auto">
          <Form.Control
            type="date"
            size="sm"
            value={dateFrom}
            onChange={(e) => {
              setDateMode('custom')
              setDateFrom(e.target.value)
            }}
          />
        </Col>
        <Col xs="auto" className="text-body-secondary small">
          to
        </Col>
        <Col xs="auto">
          <Form.Control
            type="date"
            size="sm"
            value={dateTo}
            onChange={(e) => {
              setDateMode('custom')
              setDateTo(e.target.value)
            }}
          />
        </Col>
        <Col xs="auto">
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => {
              setSearch('')
              setDateModeQuick('today')
              setSelectedStat(null)
            }}
          >
            Clear
          </Button>
        </Col>
      </Row>

      <Row xs={2} md={5} className="g-3 mb-3">
        {STAT_DEFS.map((s) => (
          <Col key={s.key}>
            <div
              className={
                'stat-card' +
                (s.key !== 'total' ? ' selectable' : '') +
                (selectedStat === s.key ? ' selected' : '')
              }
              onClick={() =>
                s.key !== 'total' &&
                setSelectedStat(selectedStat === s.key ? null : s.key)
              }
            >
              <div
                className="stat-icon"
                style={{ background: s.bg, color: s.color }}
              >
                <s.icon width={19} height={19} />
              </div>
              <div className="stat-value">{statData?.card?.[s.key] ?? 0}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </Col>
        ))}
      </Row>

      {variant === 'list' ? (
        <Card>
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead>
                <tr>
                  <th>Truck / Gate Pass</th>
                  <th>Status</th>
                  <th>Entry Time</th>
                  <th>Elapsed</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((r) => (
                  <tr key={r.gate_pass_id}>
                    <td>{r.truck_number}</td>
                    <td>
                      <StatusBadge status={r.status} />
                    </td>
                    <td>{r.gate_pass_id}</td>
                  </tr>
                ))}
                {!filteredRows.length && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-body-secondary py-4"
                    >
                      No gate passes found for this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      ) : (
        <Row xs={1} md={3} className="g-3">
          {filteredRows.map((r) => (
            <Col key={r.gate_pass_id}>
              <div
                className="gp-card h-100"
                style={
                  r.status === 'CHECKOUT'
                    ? { borderColor: 'var(--dt-green)' }
                    : undefined
                }
              >
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="gp-truck-icon">
                    <TruckIcon width={18} height={18} />
                  </div>
                  <div>
                    <span className="gp-truck-number">{r.truck_number}</span>
                    <div className="gp-id">{r.gate_pass_id}</div>
                  </div>
                  <span className="ms-auto">
                    <StatusBadge status={r.status} />
                  </span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <ClockIcon width={16} height={16} color="var(--dt-blue)" />
                  <span className="elapsed-time">
                    {fmtElapsed(
                      r.elapsed_seconds + (r.status !== 'CHECKOUT' ? tick : 0)
                    )}
                  </span>
                  <span className="small text-body-secondary">
                    {r.status === 'CHECKOUT' ? 'Total Time' : 'Elapsed'}
                  </span>
                </div>
                <div className="small text-body-secondary mt-2">
                  Entry: {new Date(r.entry_time).toLocaleString()}
                </div>
              </div>
            </Col>
          ))}
          {!filteredRows.length && (
            <Col xs={12}>
              <div className="empty-state">
                <PackageIcon width={34} height={34} />
                <div className="et-title">No gate passes yet</div>
                Create one from the Check-In tab.
              </div>
            </Col>
          )}
        </Row>
      )}
    </div>
  )
}

export default GateList
