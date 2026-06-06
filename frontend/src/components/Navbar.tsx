import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const recruiterLinks = [
  { to: '/recruiter', label: 'Dashboard' },
  { to: '/recruiter/jobs', label: 'Jobs' },
  { to: '/recruiter/applications', label: 'Applications' },
  { to: '/recruiter/interviews', label: 'Interviews' },
  { to: '/recruiter/offers', label: 'Offers' },
  { to: '/recruiter/reports', label: 'Reports' },
]

const candidateLinks = [
  { to: '/candidate', label: 'Dashboard' },
  { to: '/candidate/jobs', label: 'Browse Jobs' },
  { to: '/candidate/applications', label: 'My Applications' },
  { to: '/candidate/interviews', label: 'Interviews' },
  { to: '/candidate/offers', label: 'Offers' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const links = user?.role === 'RECRUITER' ? recruiterLinks : candidateLinks

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-14 gap-6">
        <span className="font-bold text-primary-600 text-lg mr-4">RMS</span>
        <div className="flex gap-1 flex-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                pathname === l.to
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {user?.avatarUrl && (
            <img src={user.avatarUrl} alt="" className="w-7 h-7 rounded-full" />
          )}
          <span className="text-sm text-gray-700">{user?.fullName}</span>
          <button
            onClick={logout}
            className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
