import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import FoodCard from '../components/FoodCard'
import { PageHeader } from '../components/UIComponents'
import { foodApi } from '../services/api'

const catIcons = {
  'Pizza': 'fa-pizza-slice',
  'Burgers': 'fa-hamburger',
  'Chinese': 'fa-bowl-rice',
  'Drinks': 'fa-glass-water',
  'Desserts': 'fa-ice-cream',
  'Snacks': 'fa-cheese'
}

export default function Menu() {
  const [foods, setFoods] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const category = searchParams.get('category')
    if (category) {
      setActiveCategory(category)
    }
  }, [searchParams])

  const loadData = async () => {
    try {
      const [foodRes, catRes] = await Promise.all([
        foodApi.getAll(),
        foodApi.getCategories()
      ])

      if (foodRes.success) {
        setFoods(foodRes.foods)
      }
      if (catRes.success) {
        setCategories(catRes.categories)
      }
    } catch (error) {
      console.error('Failed to load menu:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFoods = useMemo(() => {
    return foods.filter(food => {
      const categoryMatch = activeCategory === 'All' || food.category === activeCategory
      const searchMatch = !searchTerm || 
        food.food_name.toLowerCase().includes(searchTerm.toLowerCase())
      return categoryMatch && searchMatch
    })
  }, [foods, activeCategory, searchTerm])

  return (
    <div className="page-wrapper">
      <PageHeader
        title="Our Menu"
        subtitle="Fresh, flavourful food – something for everyone"
        icon="fa-utensils"
      />

      <section className="section">
        <div className="container">
          {/* Search */}
          <div className="search-wrapper">
            <i className="fas fa-search"></i>
            <input
              type="text"
              className="search-input"
              placeholder="Search for pizzas, burgers, biryani…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filters */}
          <div className="category-filters">
            <button
              className={`filter-btn ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              <i className="fas fa-th-large"></i> All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                <i className={`fas ${catIcons[cat] || 'fa-utensil-spoon'}`}></i> {cat}
              </button>
            ))}
          </div>

          {/* Food Grid */}
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading menu…</p>
            </div>
          ) : filteredFoods.length > 0 ? (
            <div className="food-grid">
              {filteredFoods.map(food => (
                <FoodCard key={food._id} food={food} />
              ))}
            </div>
          ) : (
            <div id="noResults" style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <i className="fas fa-search" style={{ fontSize: '3rem', marginBottom: '16px', display: 'block', color: 'var(--border)' }}></i>
              <h3>No dishes found</h3>
              <p>Try a different search term or category</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
