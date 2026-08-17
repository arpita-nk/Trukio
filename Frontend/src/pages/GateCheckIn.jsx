import { Button, ButtonGroup } from 'react-bootstrap'
import { GridIcon, ListIcon, ShieldIcon } from '../component/Icons'
import { useEffect, useState } from 'react'
import CheckInForm from '../Forms/CheckInForm'
import GateList from './GateList'
import { api } from '../context/api'

const tabs = [
  { key: 'checkin', label: 'Check-In', icon: ShieldIcon },
  { key: 'list', label: 'List View', icon: ListIcon },
  { key: 'dashboard', label: 'Dashboard', icon: GridIcon }
]
function GateCheckIn() {
  const [tab, setTab] = useState('checkin')
  const [statData, setstatData] = useState(null)

  useEffect(() => {
    api.dashboard().then((res) => {
      console.log('Dashboard response:', res)
      setstatData(res)
    })
  }, [])

  return (
    <div>
      <div className="page-head">
        <div>
          <h1>GateKeeper Module</h1>
          <div className="page-sub">Security Entry Management System</div>
        </div>
        <ButtonGroup>
          {tabs.map((tabItem) => (
            <Button
              key={tabItem.key}
              variant={tab === tabItem.key ? 'navy' : 'outline-secondary'}
              onClick={() => setTab(tabItem.key)}
              className="d-flex align-items-center gap-2"
            >
              <tabItem.icon width={15} height={15} />
              {tabItem.label}
            </Button>
          ))}
        </ButtonGroup>
      </div>
      {tab === 'checkin' && <CheckInForm />}
      {tab === 'dashboard' && (
        <GateList variant="dashboard" statData={statData} />
      )}
      {tab === 'list' && <GateList variant="list" statData={statData} />}
    </div>
  )
}

export default GateCheckIn
