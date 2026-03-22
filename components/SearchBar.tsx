'use client'

import { useState } from 'react'

interface SearchBarProps {
  categories: string[]
}

export default function SearchBar({ categories }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const handleSearch = () => {
    const cards = document.querySelectorAll('.freelancer-card')
    cards.forEach(card => {
      const text = card.textContent?.toLowerCase() || ''
      const matchesSearch = text.includes(searchTerm.toLowerCase())
      const category = card.getAttribute('data-category')
      const matchesCategory = !selectedCategory || category === selectedCategory
      ;(card as HTMLElement).style.display = (matchesSearch && matchesCategory) ? '' : 'none'
    })
  }

  const handleReset = () => {
    setSearchTerm('')
    setSelectedCategory('')
    const cards = document.querySelectorAll('.freelancer-card')
    cards.forEach(card => {
      ;(card as HTMLElement).style.display = ''
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-center max-w-2xl mx-auto">
      <input
        type="text"
        placeholder="Search by category, name, or location..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value)
          setTimeout(handleSearch, 100)
        }}
        className="p-3 rounded-lg w-full md:w-96 text-gray-800"
      />
      <select
        value={selectedCategory}
        onChange={(e) => {
          setSelectedCategory(e.target.value)
          setTimeout(handleSearch, 100)
        }}
        className="p-3 rounded-lg text-gray-800"
      >
        <option value="">All Categories</option>
        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
      </select>
      <button
        onClick={handleReset}
        className="bg-yellow-500 text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400"
      >
        Reset
      </button>
    </div>
  )
}
