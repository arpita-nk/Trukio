import SidebarMenu from './Sidebarmenu'
import Header from './Header'

const AdminLayout = ({ children, title }) => {
  return (
    <div className="app-layout">
      <SidebarMenu />
      <Header title={title} />
    </div>
  )
}

export default AdminLayout
