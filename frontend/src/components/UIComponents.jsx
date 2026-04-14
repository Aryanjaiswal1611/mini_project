import { Link } from 'react-router-dom'

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  )
}

export function PageHeader({ title, subtitle, icon }) {
  return (
    <div className="page-header">
      <h1><i className={icon}></i> {title}</h1>
      <p>{subtitle}</p>
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <span>{title}</span>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, message, actionText, actionLink }) {
  return (
    <div className="empty-cart">
      <i className={icon}></i>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary btn-lg">
          <i className="fas fa-utensils"></i> {actionText}
        </Link>
      )}
    </div>
  )
}

export function OrderStatusBadge({ status }) {
  const statusClasses = {
    'Placed': 'badge-pending',
    'Preparing': 'badge-preparing',
    'Out for Delivery': 'badge-delivery',
    'Delivered': 'badge-delivered',
    'Cancelled': 'badge-cancelled'
  }

  return (
    <span className={`badge ${statusClasses[status] || 'badge-pending'}`}>
      {status}
    </span>
  )
}
