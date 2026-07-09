import { NavLink } from 'react-router-dom'

export function Sidebar() {
  const links = [
    { to: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/agendamentos', icon: 'bi-calendar-check', label: 'Agendamentos' },
    { to: '/pacientes', icon: 'bi-people', label: 'Pacientes' },
    { to: '/servicos', icon: 'bi-scissors', label: 'Serviços' },
    { to: '/especialidades', icon: 'bi-award', label: 'Especialidades' },
    { to: '/perfil', icon: 'bi-person-circle', label: 'Meu Perfil' },
  ]

  return (
    <div className="sidebar d-flex flex-column p-3" style={{ width: 220, minHeight: 'calc(100vh - 56px)' }}>
      <nav className="nav flex-column gap-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) => `nav-link d-flex align-items-center gap-2${isActive ? ' active' : ''}`}
          >
            <i className={`bi ${l.icon}`}></i>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
