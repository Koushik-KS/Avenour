import { NavLink } from 'react-router-dom'
import {
  House,
  BookOpen,
  Camera,
  MessageCircle,
  UserRound,
} from 'lucide-react'
import './BottomNav.css'

const navigation = [
  { label: 'Home', path: '/', icon: House },
  { label: 'Diary', path: '/diary', icon: BookOpen },
  { label: 'Scanner', path: '/scanner', icon: Camera, center: true },
  { label: 'AI Coach', path: '/coach', icon: MessageCircle },
  { label: 'Profile', path: '/profile', icon: UserRound },
]

function BottomNav() {
  return (
    <nav className="bottom-nav">
      {navigation.map(({ label, path, icon: Icon, center }) => (
        <NavLink
          key={label}
          to={path}
          className={({ isActive }) =>
            `bottom-nav-item ${center ? 'scanner-nav-item' : ''} ${
              isActive ? 'active' : ''
            }`
          }
        >
          <span className={`bottom-nav-icon ${center ? 'scanner-icon' : ''}`}>
            <Icon size={center ? 24 : 23} strokeWidth={2.2} />
          </span>

          <span className="bottom-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav