'use client'

import { useState } from 'react'

interface HeroSectionProps {
  categories: string[]
}

export default function HeroSection({ categories }: HeroSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const filterCards = () => {
    const cards = document.querySelectorAll('.freelancer-card')
    cards.forEach(card => {
      const text = card.textContent?.toLowerCase() || ''
      const category = card.getAttribute('data-category')
      const matchesSearch = text.includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || category === selectedCategory
      ;(card as HTMLElement).style.display = (matchesSearch && matchesCategory) ? '' : 'none'
    })
  }

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setTimeout(filterCards, 50)
  }

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setTimeout(filterCards, 50)
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('')
    const cards = document.querySelectorAll('.freelancer-card')
    cards.forEach(card => {
      ;(card as HTMLElement).style.display = ''
    })
  }

  const filterByCategory = (category: string) => {
    setSelectedCategory(category)
    setSearchTerm('')
    setTimeout(() => {
      const cards = document.querySelectorAll('.freelancer-card')
      cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category')
        if (cardCategory === category) {
          ;(card as HTMLElement).style.display = ''
        } else {
          ;(card as HTMLElement).style.display = 'none'
        }
      })
    }, 50)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Find the Best Talent in Kenya</h2>
          <p className="text-xl mb-8">Connect with verified freelancers and service providers</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search by category, name, or location..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="p-3 rounded-lg w-full md:w-96 text-gray-800"
            />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="p-3 rounded-lg text-gray-800"
            >
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <button
              onClick={resetFilters}
              className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      {/* Categories Quick Links */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => filterByCategory(cat)}
              className="bg-gray-200 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-full text-sm transition"
            >
              {cat}
            </button>
          ))}
        </div>
      </section>
    </>
  )
}
