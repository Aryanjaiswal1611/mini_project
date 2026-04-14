import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { PageHeader, EmptyState } from '../components/UIComponents'

export default function Cart() {
  const { isAuthenticated } = useAuth()
  const { items, count, total, deliveryFee, grandTotal, loading, updateQuantity, removeFromCart } = useCart()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&q=75'
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="page-wrapper">
      <PageHeader
        title="My Cart"
        subtitle="Review your items before checkout"
        icon="fa-shopping-cart"
      />

      <div className="cart-section">
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading cart…</p>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon="fas fa-shopping-cart"
              title="Your cart is empty"
              message="Looks like you haven't added anything yet."
              actionText="Browse Menu"
              actionLink="/menu"
            />
          ) : (
            <div className="cart-layout">
              <div>
                <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: 'var(--shadow)', overflowX: 'auto' }}>
                  <table className="cart-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => (
                        <tr key={item.cart_id}>
                          <td>
                            <div className="cart-item-info">
                              <img
                                src={item.image}
                                alt={item.food_name}
                                className="cart-item-img"
                                onError={handleImageError}
                              />
                              <div>
                                <div className="cart-item-name">{item.food_name}</div>
                                <div className="cart-item-category">{item.category}</div>
                              </div>
                            </div>
                          </td>
                          <td>₹{parseFloat(item.price).toFixed(2)}</td>
                          <td>
                            <div className="qty-control">
                              <button
                                className="qty-btn"
                                onClick={() => updateQuantity(item.cart_id, -1)}
                              >
                                −
                              </button>
                              <span className="qty-display">{item.quantity}</span>
                              <button
                                className="qty-btn"
                                onClick={() => updateQuantity(item.cart_id, 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>₹{(item.price * item.quantity).toFixed(2)}</td>
                          <td>
                            <button
                              className="remove-btn"
                              onClick={() => removeFromCart(item.cart_id)}
                              title="Remove"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Link to="/menu" className="btn btn-outline">
                    <i className="fas fa-arrow-left"></i> Continue Shopping
                  </Link>
                </div>
              </div>

              <div className="cart-summary-card">
                <h3><i className="fas fa-receipt" style={{ color: 'var(--primary)' }}></i> Order Summary</h3>
                <div className="summary-row">
                  <span>Subtotal <small style={{ color: 'var(--text-muted)' }}>({items.length} items)</small></span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Delivery Charge</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Discount</span>
                  <span style={{ color: 'var(--success)' }}>– ₹0.00</span>
                </div>
                <div className="summary-row total">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
                <Link to="/checkout" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '20px' }}>
                  <i className="fas fa-lock"></i> Proceed to Checkout
                </Link>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '12px' }}>
                  <i className="fas fa-shield-alt"></i> Secure & safe checkout
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
