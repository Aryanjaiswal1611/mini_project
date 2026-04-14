import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { restaurantApi, deliveryApi } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function RestaurantDashboard() {
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [restaurant, setRestaurant] = useState(null)
    const [orders, setOrders] = useState([])
    const [partners, setPartners] = useState([])
    const [loading, setLoading] = useState(true)
    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        checkAuth()
        loadOrders()
        loadPartners()
    }, [])

    const checkAuth = async () => {
        try {
            const data = await restaurantApi.checkAuth()
            if (data.success && data.loggedIn) {
                setRestaurant({ name: data.name, id: data.id })
                setIsActive(data.isActive)
            } else {
                navigate('/restaurant/login')
            }
        } catch (error) {
            navigate('/restaurant/login')
        }
    }

    const loadOrders = async () => {
        try {
            const data = await restaurantApi.getOrders()
            if (data.success) {
                setOrders(data.orders)
            }
        } catch (error) {
            console.error('Error loading orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadPartners = async () => {
        try {
            const data = await restaurantApi.getPartners()
            if (data.success) {
                setPartners(data.partners)
            }
        } catch (error) {
            console.error('Error loading partners:', error)
        }
    }

    const handleToggleStatus = async () => {
        try {
            const data = await restaurantApi.toggleStatus(!isActive)
            if (data.success) {
                setIsActive(!isActive)
                showToast(data.message, 'success')
            }
        } catch (error) {
            showToast('Failed to update status', 'error')
        }
    }

    const handleLogout = async () => {
        try {
            await restaurantApi.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('restaurant_token')
            localStorage.removeItem('restaurant_user')
            showToast('Logged out successfully', 'success')
            navigate('/restaurant/login')
        }
    }

    const handleAcceptOrder = async (orderId) => {
        try {
            const data = await restaurantApi.acceptOrder(orderId)
            if (data.success) {
                showToast('Order accepted!', 'success')
                loadOrders()
            }
        } catch (error) {
            showToast('Failed to accept order', 'error')
        }
    }

    const handleRejectOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to reject this order?')) return
        try {
            const data = await restaurantApi.rejectOrder(orderId)
            if (data.success) {
                showToast('Order rejected', 'info')
                loadOrders()
            }
        } catch (error) {
            showToast('Failed to reject order', 'error')
        }
    }

    const handleAssignPartner = async (orderId, partnerId) => {
        if (!partnerId) {
            showToast('Please select a delivery partner', 'error')
            return
        }
        try {
            const data = await restaurantApi.assignPartner(orderId, partnerId)
            if (data.success) {
                showToast(data.message, 'success')
                loadOrders()
            }
        } catch (error) {
            showToast('Failed to assign partner', 'error')
        }
    }

    const getStatusBadge = (status) => {
        const statusClass = {
            'Pending': 'badge-pending',
            'Accepted': 'badge-success',
            'Rejected': 'badge-danger',
            'Preparing': 'badge-info',
            'Out for Delivery': 'badge-warning',
            'Delivered': 'badge-success',
            'Cancelled': 'badge-danger'
        }
        return `badge ${statusClass[status] || ''}`
    }

    const pendingOrders = orders.filter(o => o.restaurantStatus === 'Pending')
    const activeOrders = orders.filter(o => ['Accepted', 'Preparing', 'Out for Delivery'].includes(o.restaurantStatus))

    return (
        <div className="page-wrapper">
            <div className="restaurant-dashboard">
                <div className="dashboard-header">
                    <div>
                        <h1><i className="fas fa-utensils"></i> Restaurant Dashboard</h1>
                        <p>Welcome, {restaurant?.name}</p>
                    </div>
                    <div className="dashboard-actions">
                        <Link to="/restaurant/menu" className="btn btn-outline">
                            <i className="fas fa-utensils"></i> Manage Menu
                        </Link>
                        <button
                            onClick={handleToggleStatus}
                            className={`btn ${isActive ? 'btn-success' : 'btn-secondary'}`}
                        >
                            <i className={`fas ${isActive ? 'fa-toggle-on' : 'fa-toggle-off'}`}></i>
                            {isActive ? 'Online' : 'Offline'}
                        </button>
                        <button onClick={handleLogout} className="btn btn-outline">
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </div>
                </div>

                <div className="dashboard-stats">
                    <div className="stat-card">
                        <i className="fas fa-clock"></i>
                        <div>
                            <h3>{pendingOrders.length}</h3>
                            <p>Pending Orders</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="fas fa-fire"></i>
                        <div>
                            <h3>{activeOrders.length}</h3>
                            <p>Active Orders</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <i className="fas fa-motorcycle"></i>
                        <div>
                            <h3>{partners.length}</h3>
                            <p>Available Riders</p>
                        </div>
                    </div>
                </div>

                <div className="dashboard-section">
                    <h2><i className="fas fa-bell"></i> Pending Orders ({pendingOrders.length})</h2>
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : pendingOrders.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-check-circle"></i>
                            <p>No pending orders</p>
                        </div>
                    ) : (
                        <div className="orders-grid">
                            {pendingOrders.map(order => (
                                <div key={order._id} className="order-card pending">
                                    <div className="order-card-header">
                                        <span className="order-id">#{String(order._id).slice(-6).toUpperCase()}</span>
                                        <span className={getStatusBadge(order.restaurantStatus)}>
                                            {order.restaurantStatus}
                                        </span>
                                    </div>
                                    <div className="order-items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <span>{item.quantity}x {item.food_name}</span>
                                                <span>₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-total">
                                        <strong>Total: ₹{order.totalPrice}</strong>
                                    </div>
                                    <div className="order-actions">
                                        <button
                                            onClick={() => handleAcceptOrder(order._id)}
                                            className="btn btn-success btn-sm"
                                        >
                                            <i className="fas fa-check"></i> Accept
                                        </button>
                                        <button
                                            onClick={() => handleRejectOrder(order._id)}
                                            className="btn btn-danger btn-sm"
                                        >
                                            <i className="fas fa-times"></i> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard-section">
                    <h2><i className="fas fa-fire"></i> Active Orders ({activeOrders.length})</h2>
                    {activeOrders.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-utensils"></i>
                            <p>No active orders</p>
                        </div>
                    ) : (
                        <div className="orders-grid">
                            {activeOrders.map(order => (
                                <div key={order._id} className="order-card active">
                                    <div className="order-card-header">
                                        <span className="order-id">#{String(order._id).slice(-6).toUpperCase()}</span>
                                        <span className={getStatusBadge(order.orderStatus)}>
                                            {order.orderStatus}
                                        </span>
                                    </div>
                                    <div className="order-items">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="order-item">
                                                <span>{item.quantity}x {item.food_name}</span>
                                                <span>₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-total">
                                        <strong>Total: ₹{order.totalPrice}</strong>
                                    </div>
                                    {order.orderStatus === 'Accepted' && (
                                        <div className="assign-partner">
                                            <label>Assign Delivery Partner:</label>
                                            <select
                                                onChange={(e) => handleAssignPartner(order._id, e.target.value)}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select partner</option>
                                                {partners.map(partner => (
                                                    <option key={partner._id} value={partner._id}>
                                                        {partner.name} ({partner.vehicle_type})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
