import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { restaurantApi } from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function RestaurantSignup() {
    const navigate = useNavigate()
    const { showToast } = useToast()
    const [formData, setFormData] = useState({
        restaurantName: '',
        branchName: '',
        email: '',
        password: '',
        confirmPassword: ''
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

        setLoading(true)

        try {
            const data = await restaurantApi.signup({
                restaurantName: formData.restaurantName,
                branchName: formData.branchName,
                email: formData.email,
                password: formData.password
            })
            if (data.success) {
                showToast('Registration successful! Please login.', 'success')
                navigate('/restaurant/login')
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
                        <div className="auth-icon" style={{ background: 'rgba(255, 107, 53, 0.1)' }}>
                            <i className="fas fa-store" style={{ color: 'var(--primary)' }}></i>
                        </div>
                        <h2>Register Restaurant</h2>
                        <p>Join QuickBite as a restaurant partner</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Restaurant Name</label>
                            <div className="input-wrapper">
                                <i className="fas fa-store"></i>
                                <input
                                    type="text"
                                    name="restaurantName"
                                    value={formData.restaurantName}
                                    onChange={handleChange}
                                    placeholder="Enter restaurant name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Branch Name</label>
                            <div className="input-wrapper">
                                <i className="fas fa-building"></i>
                                <input
                                    type="text"
                                    name="branchName"
                                    value={formData.branchName}
                                    onChange={handleChange}
                                    placeholder="Enter branch/location name"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <div className="input-wrapper">
                                <i className="fas fa-envelope"></i>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
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
                                    <i className="fas fa-user-plus"></i> Register Restaurant
                                </>
                            )}
                        </button>
                    </form>

                    <div className="auth-footer">
                        <p>
                            Already have an account?{' '}
                            <Link to="/restaurant/login">Sign In</Link>
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
