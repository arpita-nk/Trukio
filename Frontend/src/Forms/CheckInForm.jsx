import { Button, Card, Col, Form, InputGroup } from 'react-bootstrap'
import {
  CloudUploadIcon,
  DocIcon,
  PackageIcon,
  TruckIcon
} from '../component/Icons'
import { useCallback, useState } from 'react'
import { api } from '../context/api'
import useToast from '../context/useToast'
import GatePassResult from './GetPassResult'

function CheckInForm() {
  const toast = useToast()
  const [truckNumber, setTruckNumber] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const addFiles = (list) => {
    setFiles((prev) => [...prev, ...Array.from(list)])
  }

  const onDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }, [])

  const resetForm = () => {
    setTruckNumber('')
    setPoNumber('')
    setFiles([])
    setResult(null)
  }

  const submit = async (e) => {
    e.preventDefault()

    if (!truckNumber.trim() || !poNumber.trim()) {
      toast('Truck number and PO number are required', 'error')
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()

      formData.append('truck_number', truckNumber.trim())
      formData.append('po_number', poNumber.trim())

      files.forEach((file) => {
        formData.append('files', file)
      })

      // Debug FormData
      for (const [key, value] of formData.entries()) {
        console.log(key, value)
      }

      // Send FormData directly
      const gp = await api.createGatePass(formData)

      setResult(gp)

      toast('Gate Pass Generated & Saved Successfully')

      if (files.length) {
        toast('Printing directly to thermal printer...')
      }
    } catch (err) {
      toast(err.message || 'Failed to generate gate pass', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return <GatePassResult gatePass={result} onNewEntry={resetForm} />
  }

  return (
    <Form onSubmit={submit}>
      <Card>
        <Card.Header className="dt-header">
          <TruckIcon width={18} height={18} color="var(--dt-gold)" />
          <span>Vehicle Information</span>
        </Card.Header>
        <Card.Body>
          {/* <Row className="g-3"> */}
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-uppercase small fw-bold text-body-secondary">
                Truck Number (required)
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <TruckIcon width={16} height={16} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Enter Vehicle Plate Number"
                  value={truckNumber}
                  onChange={(e) => setTruckNumber(e.target.value.toUpperCase())}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="text-uppercase small fw-bold text-body-secondary">
                PO Number (required)
              </Form.Label>
              <InputGroup>
                <InputGroup.Text>
                  <DocIcon width={16} height={16} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Enter PO Number"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                />
              </InputGroup>
            </Form.Group>
          </Col>
          {/* </Row> */}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header className="dt-header">
          <CloudUploadIcon width={18} height={18} color="var(--dt-gold)" />
          <span>Invoice Documents</span>
        </Card.Header>
        <Card.Body>
          <Form.Label
            className="dropzone w-100 mb-0"
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            style={
              dragActive
                ? {
                    background: 'var(--dt-gold-100)',
                    borderColor: 'var(--dt-gold)'
                  }
                : undefined
            }
          >
            <div className="dz-icon">
              <CloudUploadIcon width={22} height={22} />
            </div>
            <div className="dz-title">Upload Invoices</div>
            <div className="dz-sub">
              PDF, JPG, or PNG &mdash; drag &amp; drop or click to browse
            </div>
            <Form.Control
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              className="d-none"
              onChange={(e) => e.target.files && addFiles(e.target.files)}
            />
          </Form.Label>

          {files.map((f, i) => (
            <div
              key={i}
              className="d-flex align-items-center gap-2 border rounded-3 px-3 py-2 mt-2"
            >
              <DocIcon width={15} height={15} />
              <span className="flex-grow-1 text-truncate small fw-semibold">
                {f.name}
              </span>
              <Button
                variant="link"
                size="sm"
                className="text-danger p-0"
                onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
              >
                Remove
              </Button>
            </div>
          ))}
        </Card.Body>
      </Card>

      <div className="mt-3">
        <Button
          variant="primary"
          type="submit"
          size="lg"
          className="w-100 d-flex align-items-center justify-content-center gap-2"
          disabled={submitting}
        >
          <PackageIcon width={17} height={17} />
          {submitting ? 'Generating...' : 'Generate Gatepass'}
        </Button>
      </div>
    </Form>
  )
}

export default CheckInForm
