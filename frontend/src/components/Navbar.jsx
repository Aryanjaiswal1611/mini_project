import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const { count } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [location])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <i className="fas fa-fire-alt"></i> QuickBite
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            <i className="fas fa-home"></i> Home
          </Link>
          <Link to="/menu" className={isActive('/menu') ? 'active' : ''}>
            <i className="fas fa-utensils"></i> Menu
          </Link>
          {isAuthenticated && (
            <Link to="/order-history" className={isActive('/order-history') ? 'active' : ''}>
              <i className="fas fa-history"></i> My Orders
            </Link>
          )}
        </div>

        <div className="nav-actions">
          <Link to="/cart" className="cart-btn" title="My Cart">
            <i className="fas fa-shopping-cart"></i>
            {count > 0 && <span className="cart-badge">{count}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="user-menu">
              <button
                className="user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <i className="fas fa-user-circle"></i>
                <span>{user?.name || 'Account'}</span>
                <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem' }}></i>
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <Link to="/order-history">
                    <i className="fas fa-history"></i> My Orders
                  </Link>
                  <button onClick={handleLogout}>
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  )
}
