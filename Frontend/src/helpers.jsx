import { useRef, useState } from 'react'
import { Button, FormControl, InputGroup } from 'react-bootstrap'
import { MicIcon } from './component/Icons'

function EditableRow({ label, value, onSave }) {
  return (
    <tr>
      <td>{label}</td>
      <td>
        <EditableCell value={value} onSave={onSave} />
      </td>
    </tr>
  )
}

function EditableCell({ value, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value || '')

  if (editing) {
    return (
      <FormControl
        autoFocus
        size="sm"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false)
          if (draft !== (value || '')) onSave(draft)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.target.blur()
          if (e.key === 'Escape') {
            setDraft(value || '')
            setEditing(false)
          }
        }}
      />
    )
  }

  return (
    <span
      className={'editable-cell' + (!value ? ' empty' : '')}
      onClick={() => {
        setDraft(value || '')
        setEditing(true)
      }}
    >
      {value || '\u2014 (click to add)'}
    </span>
  )
}

function VoiceTextarea({ value, onChange, placeholder }) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)
  const baseTextRef = useRef('')

  const supported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  const toggleListening = () => {
    if (!supported) return
    if (listening) {
      recognitionRef.current?.stop()
      return
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    baseTextRef.current = value ? value + ' ' : ''

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
      }
      onChange((baseTextRef.current + transcript).trimStart())
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <InputGroup>
      <FormControl
        as="textarea"
        rows={3}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {supported && (
        <Button
          variant="outline-secondary"
          className={'btn-mic' + (listening ? ' listening' : '')}
          onClick={toggleListening}
          title={listening ? 'Stop dictation' : 'Dictate with voice'}
        >
          <MicIcon width={17} height={17} />
        </Button>
      )}
    </InputGroup>
  )
}

export { EditableRow, EditableCell, VoiceTextarea }
