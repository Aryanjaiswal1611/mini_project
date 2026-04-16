import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderApi } from '../services/api'
import { PageHeader } from '../components/UIComponents'

export default function OrderSuccess() {
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  const orderId = searchParams.get('order_id')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (!orderId) {
      navigate('/')
      return
    }

    loadOrder()
    createConfetti()
  }, [orderId])

  const loadOrder = async () => {
    try {
      const data = await orderApi.getById(orderId)
      if (data.success) {
        setOrder(data.order)
      } else {
        navigate('/')
      }
    } catch (error) {
      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const createConfetti = () => {
    const colors = ['#ff6b35', '#ff8c5a', '#28a745', '#ffc107', '#17a2b8']
    for (let i = 0; i < 80; i++) {
      const conf = document.createElement('div')
      const size = 6 + Math.random() * 6
      const isCircle = Math.random() > 0.5
      conf.style.cssText = `
        position: fixed;
        top: -10px;
        left: ${Math.random() * 100}%;
        width: ${size}px;
        height: ${size}px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        border-radius: ${isCircle ? '50%' : '2px'};
        animation: confettiFall ${2 + Math.random() * 3}s linear ${Math.random() * 1.5}s forwards;
        z-index: 9999;
        pointer-events: none;
        opacity: 0.9;
      `
      document.body.appendChild(conf)
    }

    const style = document.createElement('style')
    style.textContent = '@keyframes confettiFall { to { top: 110vh; transform: rotate(720deg); opacity: 0; } }'
    document.head.appendChild(style)
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="success-page">
          <div className="spinner" style={{ margin: '0 auto' }}></div>
        </div>
      </div>
    )
  }

  const padId = String(order?._id || orderId).padStart(6, '0').slice(-6)

  return (
    <div className="page-wrapper">
      <div className="success-page">
        <div className="success-icon">
          <i className="fas fa-check"></i>
        </div>
        <h2>Order Placed!</h2>
        <p>Thank you, <strong>{user?.name}!</strong> Your order has been received and is being prepared.</p>

        <div className="order-id-card">
          <div className="label">Order ID</div>
          <div className="value">#{padId}</div>
        </div>

        <div className="order-id-card" style={{ marginTop: '-15px', background: '#e0f2fe', borderColor: '#7dd3fc' }}>
          <div className="label" style={{ color: '#0369a1' }}>Verification Code</div>
          <div className="value" style={{ color: '#0369a1', letterSpacing: '4px' }}>
            {order?.verificationCode}
          </div>
        </div>

        <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '25px' }}>
          Please share this 4-digit code with the rider when they arrive to confirm your delivery.
        </p>

        <div style={{ background: '#f8f4f0', borderRadius: '12px', padding: '20px', marginBottom: '28px', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Total Amount</span>
            <strong>₹{parseFloat(order?.totalPrice || 0).toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Delivery To</span>
            <span style={{ maxWidth: '200px', textAlign: 'right' }}>{order?.delivery_address}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Status</span>
            <span className="badge badge-pending">
              <i className="fas fa-clock"></i> {order?.orderStatus}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/order-history" className="btn btn-primary btn-lg">
            <i className="fas fa-list"></i> Track My Orders
          </Link>
          <Link to="/menu" className="btn btn-outline btn-lg">
            <i className="fas fa-utensils"></i> Order More
          </Link>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '28px' }}>
          <i className="fas fa-motorcycle" style={{ color: 'var(--primary)' }}></i>
          Estimated delivery: <strong>30–45 minutes</strong>
        </p>
      </div>
    </div>
  )
}
