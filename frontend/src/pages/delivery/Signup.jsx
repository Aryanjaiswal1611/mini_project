import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { deliveryApi } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function DeliverySignup() {
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        vehicle_type: 'bike'
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            showToast('Passwords do not match', 'error')
            return
        }

        if (formData.password.length < 6) {
            showToast('Password must be at least 6 characters', 'error')
            return
        }

        if (!/^\d{10}$/.test(formData.phone)) {
            showToast('Please enter a valid 10-digit phone number', 'error')
            return
        }

        setLoading(true)

        try {
            const data = await deliveryApi.signup({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                password: formData.password,
                vehicle_type: formData.vehicle_type
            })
            if (data.success) {
                localStorage.setItem('delivery_token', data.token)
                localStorage.setItem('delivery_user', JSON.stringify(data.partner))
                showToast('Registration successful!', 'success')
                navigate('/delivery/dashboard')
            } else {
                showToast(data.message || 'Registration failed', 'error')
            }
        } catch (error) {
            showToast('Network error. Please try again.', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-icon" style={{ background: 'rgba(76, 175, 80, 0.1)' }}>
                            <i className="fas fa-motorcycle" style={{ color: '#4caf50' }}></i>
                        </div>
                        <h2>Become a Delivery Partner</h2>
                        <p>Start earning with QuickBite</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <div className="input-wrapper">
                                <i className="fas fa-user"></i>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email</label>
                                <div className="input-wrapper">
                                    <i className="fas fa-envelope"></i>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Phone</label>
                                <div className="input-wrapper">
                                    <i className="fas fa-phone"></i>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="10-digit number"
                                        pattern="[0-9]{10}"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Vehicle Type</label>
                            <div className="input-wrapper">
                                <i className="fas fa-motorcycle"></i>
                                <select
                                    name="vehicle_type"
                                    value={formData.vehicle_type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="bike">Bike</option>
                                    <option value="scooter">Scooter</option>
                                    <option value="cycle">Bicycle</option>
                                    <option value="car">Car</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Password</label>
                            <div className="input-wrapper">
                                <i className="fas fa-lock"></i>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Confirm Password</label>
                            <div className="input-wrapper">
                                <i className="fas fa-lock"></i>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="spinner" style={{ width: '18px', height: '18px' }}></span>
                                    Registering...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-user-plus"></i> Register as Partner
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/delivery/login">Sign In</Link>
                        </p>
                        <Link to="/login" className="back-link">
                            <i className="fas fa-arrow-left"></i> Back to Customer Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
