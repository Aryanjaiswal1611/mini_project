import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/menu')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await login(email, password)
      if (data.success) {
        showToast('Login successful! Redirecting…', 'success')
        const redirect = data.redirect || '/menu'
        setTimeout(() => navigate(redirect), 800)
      } else {
        setError(data.message || 'Login failed.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo"><i className="fas fa-fire-alt"></i> QuickBite</div>
        <h2 className="auth-title">Welcome Back!</h2>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle"></i>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading} style={{ marginTop: '8px' }}>
            {loading ? (
              <><i className="fas fa-spinner fa-spin"></i> Signing in…</>
            ) : (
              <><i className="fas fa-sign-in-alt"></i> Login</>
            )}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one for free</Link>
        </div>
        <div className="auth-footer" style={{ marginTop: '10px' }}>
          <Link to="/restaurant/login" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <i className="fas fa-store"></i> Restaurant Login
          </Link>
          <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>|</span>
          <Link to="/delivery/login" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            <i className="fas fa-motorcycle"></i> Delivery Login
          </Link>
        </div>
      </div>
    </div>
  )
}
