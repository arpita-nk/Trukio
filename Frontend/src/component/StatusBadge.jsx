import { Badge } from 'react-bootstrap'

const STATUS_VARIANT = {
  CHECKIN: 'info',
  'UNLOADING-START': 'warning',
  'UNLOADING-OVER': 'purple',
  CHECKOUT: 'success'
}

export function StatusBadge({ status }) {
  const variant = STATUS_VARIANT[status] || 'secondary'

  return (
    <Badge bg={variant} text={variant === 'warning' ? 'dark' : undefined}>
      {status}
    </Badge>
  )
}
