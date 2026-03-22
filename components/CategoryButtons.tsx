'use client'

interface CategoryButtonsProps {
  categories: string[]
}

export default function CategoryButtons({ categories }: CategoryButtonsProps) {
  const filterByCategory = (category: string) => {
    const cards = document.querySelectorAll('.freelancer-card')
    cards.forEach(card => {
      const cardCategory = card.getAttribute('data-category')
      if (cardCategory === category) {
        ;(card as HTMLElement).style.display = ''
      } else {
        ;(card as HTMLElement).style.display = 'none'
      }
    })
    const searchInput = document.getElementById('searchInput') as HTMLInputElement
    if (searchInput) searchInput.value = ''
  }

  return (
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
  )
}
