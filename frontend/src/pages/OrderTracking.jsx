import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { orderApi } from '../services/api'
import { connectSocket } from '../services/socket'
import { PageHeader } from '../components/UIComponents'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const restaurantIcon = new L.DivIcon({
    html: '<i class="fas fa-utensils" style="color: #ff6b35; font-size: 24px;"></i>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
})

const customerIcon = new L.DivIcon({
    html: '<i class="fas fa-home" style="color: #2196f3; font-size: 24px;"></i>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
})

const riderIcon = new L.DivIcon({
    html: '<i class="fas fa-motorcycle" style="color: #4caf50; font-size: 24px;"></i>',
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
})

function MapUpdater({ center }) {
    const map = useMap()
    useEffect(() => {
        map.setView(center, map.getZoom())
    }, [center, map])
    return null
}

export default function OrderTracking() {
    const [searchParams] = useSearchParams()
    const { isAuthenticated } = useAuth()
    const { showToast } = useToast()
    const navigate = useNavigate()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [riderLocation, setRiderLocation] = useState(null)
    const [mapCenter, setMapCenter] = useState([28.6139, 77.2090])

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

        const socketInstance = connectSocket()
        socketInstance.emit('join_order_room', orderId)

        socketInstance.on('location_update', (data) => {
            setRiderLocation({ lat: data.lat, lng: data.lng })
            setMapCenter([data.lat, data.lng])
        })

        socketInstance.on('status_update', (data) => {
            showToast(`Order status updated to: ${data.status}`, 'info')
            loadOrder()
        })

        return () => {
            socketInstance.off('location_update')
            socketInstance.off('status_update')
        }
    }, [orderId])

    const loadOrder = async () => {
        try {
            const data = await orderApi.getById(orderId)
            if (data.success) {
                setOrder(data.order)
                if (data.order.delivery_location) {
                    setMapCenter([data.order.delivery_location.lat, data.order.delivery_location.lng])
                }
            } else {
                navigate('/')
            }
        } catch (error) {
            navigate('/')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="page-wrapper">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading order details...</p>
                </div>
            </div>
        )
    }

    const backendPhases = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered']
    const displayPhases = ['Order Placed', 'Preparing', 'Out for Delivery', 'Delivered']
    const icons = ['fa-clipboard-check', 'fa-fire-burner', 'fa-motorcycle', 'fa-box-open']

    let currentIndex = backendPhases.indexOf(order?.orderStatus)
    if (order?.orderStatus === 'Cancelled') currentIndex = -1

    const progressWidth = currentIndex >= 0 ? `${(currentIndex / (backendPhases.length - 1)) * 100}%` : '0%'

    const padId = String(order?._id || orderId).padStart(6, '0').slice(-6)

    return (
        <div className="page-wrapper">
            <PageHeader
                title={`Track Order #${padId}`}
                subtitle="Real-time order tracking"
                icon="fa-location-dot"
            />

            <section className="section">
                <div className="container">
                    {order?.orderStatus === 'Cancelled' && (
                        <div style={{
                            background: 'rgba(220, 53, 69, 0.1)',
                            color: '#dc3545',
                            padding: '15px',
                            borderRadius: '8px',
                            textAlign: 'center',
                            marginBottom: '20px',
                            fontWeight: 600
                        }}>
                            This order has been cancelled.
                        </div>
                    )}

                    <div style={{
                        height: '400px',
                        width: '100%',
                        borderRadius: '12px',
                        marginBottom: '20px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                        overflow: 'hidden'
                    }}>
                        <MapContainer
                            center={mapCenter}
                            zoom={14}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <MapUpdater center={mapCenter} />

                            {order?.restaurant_location && (
                                <Marker
                                    position={[order.restaurant_location.lat, order.restaurant_location.lng]}
                                    icon={restaurantIcon}
                                >
                                    <Popup>Restaurant</Popup>
                                </Marker>
                            )}

                            {order?.delivery_location && (
                                <Marker
                                    position={[order.delivery_location.lat, order.delivery_location.lng]}
                                    icon={customerIcon}
                                >
                                    <Popup>Your Location</Popup>
                                </Marker>
                            )}

                            {order?.orderStatus === 'Out for Delivery' && riderLocation && (
                                <Marker position={[riderLocation.lat, riderLocation.lng]} icon={riderIcon}>
                                    <Popup>Delivery Partner</Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>

                    {order?.orderStatus === 'Out for Delivery' && (
                        <div style={{
                            background: '#e0f2fe',
                            padding: '15px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            border: '1px solid #bae6fd'
                        }}>
                            <p style={{ fontWeight: 600, color: '#0369a1', marginBottom: '5px' }}>
                                <i className="fas fa-satellite-dish fa-spin"></i> Live Tracking Active
                            </p>
                            <p style={{ fontSize: '0.85rem', color: '#0c4a6e' }}>
                                {riderLocation ? 'Rider is on the way...' : 'Waiting for rider location...'}
                            </p>
                        </div>
                    )}

                    <div className="tracking-card" style={{ opacity: order?.orderStatus === 'Cancelled' ? 0.5 : 1 }}>
                        <div className="track-steps">
                            <div className="track-progress" style={{
                                width: progressWidth,
                                background: order?.orderStatus === 'Delivered' ? '#28a745' : 'var(--primary)'
                            }}></div>
                            {displayPhases.map((phase, index) => {
                                let stepClass = ''
                                if (order?.orderStatus === 'Cancelled') {
                                    stepClass = index === 0 ? 'completed' : ''
                                } else if (index < currentIndex || order?.orderStatus === 'Delivered') {
                                    stepClass = 'completed'
                                } else if (index === currentIndex && order?.orderStatus !== 'Delivered') {
                                    stepClass = 'active'
                                }

                                return (
                                    <div key={index} className={`track-step ${stepClass}`}>
                                        <div className="track-icon">
                                            <i className={`fas ${icons[index]}`}></i>
                                        </div>
                                        <h4>{phase}</h4>
                                        {index === currentIndex && order?.orderStatus !== 'Delivered' && (
                                            <p>Current Status</p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="admin-table-card" style={{ marginTop: '30px' }}>
                        <h3>
                            <i className="fas fa-receipt" style={{ color: 'var(--primary)' }}></i>
                            Order Details
                        </h3>
                        <div style={{ marginTop: '15px' }}>
                            <div className="detail-row">
                                <span className="detail-label">Status</span>
                                <span className="detail-value">
                                    <span className={`badge badge-${order?.orderStatus?.toLowerCase().replace(' ', '-')}`}>
                                        {order?.orderStatus}
                                    </span>
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Order Date</span>
                                <span className="detail-value">
                                    {new Date(order?.createdAt).toLocaleString('en-IN')}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Payment Method</span>
                                <span className="detail-value">{order?.payment_method}</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Verification Code</span>
                                <span className="detail-value" style={{ letterSpacing: '3px', color: 'var(--primary)' }}>
                                    {order?.verificationCode}
                                </span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Delivery Address</span>
                                <span className="detail-value">{order?.delivery_address}</span>
                            </div>
                            <div className="detail-row" style={{
                                marginTop: '20px',
                                borderTop: '1px dashed var(--border)',
                                paddingTop: '15px'
                            }}>
                                <span className="detail-label">Total Amount</span>
                                <span className="detail-value" style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>
                                    ₹{parseFloat(order?.totalPrice).toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <Link to="/order-history" className="btn btn-outline">
                                Back to My Orders
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
