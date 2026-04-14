import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import Menu from './pages/Menu'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderSuccess from './pages/OrderSuccess'
import OrderHistory from './pages/OrderHistory'
import OrderTracking from './pages/OrderTracking'

// Restaurant Portal
import RestaurantLogin from './pages/restaurant/Login'
import RestaurantSignup from './pages/restaurant/Signup'
import RestaurantDashboard from './pages/restaurant/Dashboard'
import RestaurantMenu from './pages/restaurant/Menu'

// Delivery Portal
import DeliveryLogin from './pages/delivery/Login'
import DeliverySignup from './pages/delivery/Signup'
import DeliveryDashboard from './pages/delivery/Dashboard'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { checkAuth } = useAuth()

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <div className="app">
      <Routes>
        {/* Restaurant Portal Routes */}
        <Route path="/restaurant/login" element={<RestaurantLogin />} />
        <Route path="/restaurant/signup" element={<RestaurantSignup />} />
        <Route path="/restaurant/dashboard" element={
          <ProtectedRoute roles={['restaurant']}>
            <RestaurantDashboard />
          </ProtectedRoute>
        } />
        <Route path="/restaurant/menu" element={
          <ProtectedRoute roles={['restaurant']}>
            <RestaurantMenu />
          </ProtectedRoute>
        } />

        {/* Delivery Portal Routes */}
        <Route path="/delivery/login" element={<DeliveryLogin />} />
        <Route path="/delivery/signup" element={<DeliverySignup />} />
        <Route path="/delivery/dashboard" element={
          <ProtectedRoute roles={['delivery']}>
            <DeliveryDashboard />
          </ProtectedRoute>
        } />

        {/* Main App Routes */}
        <Route path="*" element={
          <>
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                <Route path="/order-success" element={
                  <ProtectedRoute>
                    <OrderSuccess />
                  </ProtectedRoute>
                } />
                <Route path="/order-history" element={
                  <ProtectedRoute>
                    <OrderHistory />
                  </ProtectedRoute>
                } />
                <Route path="/tracking" element={
                  <ProtectedRoute>
                    <OrderTracking />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  )
}

export default App
