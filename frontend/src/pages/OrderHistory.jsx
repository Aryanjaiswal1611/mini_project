import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { PageHeader, EmptyState, OrderStatusBadge } from '../components/UIComponents'
import { orderApi, feedbackApi } from '../services/api'

export default function OrderHistory() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    loadOrders()
  }, [isAuthenticated])

  const loadOrders = async () => {
    try {
      const data = await orderApi.getHistory()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      showToast('Failed to load orders', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitFeedback = async (orderId) => {
    const rating = window.prompt('Rate your experience (1-5 stars):', '5')
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) return

    const comment = window.prompt('Any comments?') || ''

    try {
      const data = await feedbackApi.submit({ orderId, rating: parseInt(rating), comment })
      if (data.success) {
        showToast('Thank you for your feedback!', 'success')
        loadOrders()
      } else {
        showToast(data.message || 'Error submitting feedback', 'error')
      }
    } catch (err) {
      showToast('Network error', 'error')
    }
  }

  const handleRateDriver = async (orderId) => {
    const rating = window.prompt('Rate your delivery driver (1-5 stars):', '5')
    if (!rating || isNaN(rating) || rating < 1 || rating > 5) return

    try {
      const data = await orderApi.rateDelivery(orderId, parseInt(rating))
      if (data.success) {
        showToast('Driver rated successfully!', 'success')
      } else {
        showToast(data.message || 'Error submitting driver rating', 'error')
      }
    } catch (err) {
      showToast('Network error', 'error')
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        title="My Orders"
        subtitle="Track all your past and current orders"
        icon="fa-history"
      />

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading orders…</p>
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon="fas fa-receipt"
              title="No orders yet"
              message="Place your first order and it will appear here."
              actionText="Browse Menu"
              actionLink="/menu"
            />
          ) : (
            <div className="admin-table-card">
              <h3>
                <i className="fas fa-list" style={{ color: 'var(--primary)' }}></i>
                Order History ({orders.length} orders)
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Date</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => {
                      const padId = String(order._id).padStart(6, '0').slice(-6)
                      const itemCount = order.items?.length || 0
                      const itemsList = order.items?.map(i => i.food_name).join(', ') || ''

                      return (
                        <tr key={order._id}>
                          <td>
                            <strong style={{ color: 'var(--primary)' }}>#{padId}</strong>
                          </td>
                          <td>{formatDate(order.createdAt)}</td>
                          <td>
                            <div style={{ maxWidth: '260px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                              {itemsList || '—'}
                            </div>
                            <div style={{ fontSize: '0.78rem', marginTop: '4px' }}>
                              <span className="badge" style={{ background: 'rgba(255,107,53,0.1)', color: 'var(--primary)' }}>
                                {itemCount} item{itemCount !== 1 ? 's' : ''}
                              </span>
                            </div>
                          </td>
                          <td>
                            <strong>₹{parseFloat(order.totalPrice).toFixed(2)}</strong>
                          </td>
                          <td>
                            <OrderStatusBadge status={order.orderStatus} />
                            <br />

                            {order.orderStatus === 'Delivered' ? (
                              <>
                                {order.feedbackId ? (
                                  <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.85rem', display: 'inline-block', marginTop: '8px' }}>
                                    Feedback Given
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleSubmitFeedback(order._id)}
                                    className="btn btn-primary"
                                    style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: '8px' }}
                                  >
                                    Rate Order
                                  </button>
                                )}
                                <button
                                  onClick={() => handleRateDriver(order._id)}
                                  className="btn btn-outline"
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: '8px', marginLeft: '4px' }}
                                >
                                  Rate Driver
                                </button>
                              </>
                            ) : (
                              <Link
                                to={`/tracking?order_id=${order._id}`}
                                className="btn btn-outline"
                                style={{ padding: '4px 8px', fontSize: '0.75rem', marginTop: '8px' }}
                              >
                                Track Order
                              </Link>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
