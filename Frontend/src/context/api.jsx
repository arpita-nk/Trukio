const BASE = import.meta.env.VITE_API_URL

async function handle(res) {
  if (!res.ok) {
    let detail = 'Request failed'
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch (_) {
      /* ignore */
    }
    throw new Error(detail)
  }
  return res.json()
}

export const api = {
  createGatePass: (formData) =>
    fetch(`${BASE}/gate-passes`, { method: 'POST', body: formData }).then(
      handle
    ),

  listGatePasses: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return fetch(`${BASE}/gate-passes${qs ? `?${qs}` : ''}`).then(handle)
  },

  getGatePass: (code) =>
    fetch(`${BASE}/gate-passes/${encodeURIComponent(code)}`).then(handle),

  progressGatePass: (code) =>
    fetch(`${BASE}/gate-passes/${encodeURIComponent(code)}/progress`, {
      method: 'POST'
    }).then(handle),

  barcodeUrl: (code) =>
    `${BASE}/gate-passes/${encodeURIComponent(code)}/barcode.png`,

  dashboard: (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return fetch(`${BASE}/dashboard${qs ? `?${qs}` : ''}`).then(handle)
  },

  getAllInvoices: () => fetch(`${BASE}/invoices`).then(handle),

  getInvoices: (code) =>
    fetch(`${BASE}/gate-passes/${encodeURIComponent(code)}/invoices`).then(
      handle
    ),

  getAllParts: () => fetch(`${BASE}/parts/all`).then(handle),

  updateInvoice: (id, payload) =>
    fetch(`${BASE}/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle),

  updatePart: (id, payload) =>
    fetch(`${BASE}/parts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle),

  printParts: (ids) =>
    fetch(`${BASE}/parts/print`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ids)
    }).then(handle),

  partQrUrl: (id) => `${BASE}/parts/${id}/qr.png`,

  lookupPart: (partNumber) =>
    fetch(
      `${BASE}/parts/lookup?part_number=${encodeURIComponent(partNumber)}`
    ).then(handle),

  routePart: (id, payload) =>
    fetch(`${BASE}/parts/${id}/route`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(handle),

  pendingParts: (gatePassId) => {
    const qs = new URLSearchParams({ gate_pass_id: gatePassId }).toString()
    return fetch(`${BASE}/parts/pending?${qs}`).then(handle)
  },

  partsOverview: (search) => {
    const qs = search ? `?${new URLSearchParams({ search }).toString()}` : ''
    return fetch(`${BASE}/parts/overview${qs}`).then(handle)
  },

  completePart: (id) =>
    fetch(`${BASE}/parts/${id}/complete`, { method: 'POST' }).then(handle)
}
