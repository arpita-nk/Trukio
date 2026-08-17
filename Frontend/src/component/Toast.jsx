import { createContext, useCallback, useRef, useState } from 'react'
import BsToast from 'react-bootstrap/Toast'
import ToastContainer from 'react-bootstrap/ToastContainer'

export const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const push = useCallback((message, type = 'success') => {
    const id = ++idRef.current

    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        type
      }
    ])

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3200)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={push}>
      {children}

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 1080 }}
      >
        {toasts.map((toast) => (
          <BsToast
            key={toast.id}
            bg={toast.type === 'error' ? 'danger' : 'success'}
            className="dt-toast text-white"
            onClose={() => dismiss(toast.id)}
            show
            autohide
            delay={3200}
          >
            <BsToast.Body className="d-flex align-items-center gap-2">
              <span>{toast.type === 'error' ? '⚠' : '✓'}</span>

              {toast.message}
            </BsToast.Body>
          </BsToast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  )
}
