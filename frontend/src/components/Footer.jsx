import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <i className="fas fa-fire-alt"></i> QuickBite
          </div>
          <p>Delivering happiness to your doorstep. Fresh, delicious food made with love and care.</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/cart">Cart</Link></li>
            <li><Link to="/order-history">My Orders</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/menu?category=Pizza">Pizza</Link></li>
            <li><Link to="/menu?category=Burgers">Burgers</Link></li>
            <li><Link to="/menu?category=Chinese">Chinese</Link></li>
            <li><Link to="/menu?category=Desserts">Desserts</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact Us</h4>
          <p><i className="fas fa-map-marker-alt"></i> 123 Food Street, Mumbai, India</p>
          <p><i className="fas fa-phone"></i> +91 98765 43210</p>
          <p><i className="fas fa-envelope"></i> hello@quickbite.in</p>
          <p><i className="fas fa-clock"></i> Open: 10 AM – 11 PM</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} QuickBite. All rights reserved. | Made with <i className="fas fa-heart" style={{ color: 'var(--primary)' }}></i> for college mini project</p>
      </div>
    </footer>
  )
}
