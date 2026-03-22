'use client'

import { useState } from 'react'
import ContactButton from './ContactButton'
import ContactModal from './ContactModal'

interface Freelancer {
  id: string
  full_name: string
  business_name: string
  phone: string
  email: string
  location: string
  category: string
  description: string
  price_range: string
  experience: string
  status: string
  balance: number
  expires_at: string
}

interface FreelancerCardProps {
  freelancer: Freelancer
}

export default function FreelancerCard({ freelancer }: FreelancerCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const listingName = freelancer.business_name || freelancer.full_name

  return (
    <>
      <div
        className="freelancer-card bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300"
        data-category={freelancer.category}
      >
        <div className="p-5">
          <h3 className="text-xl font-bold mb-1">{listingName}</h3>
          <p className="text-blue-600 text-sm mb-2">{freelancer.category}</p>
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">{freelancer.description}</p>
          <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
            <span>📍 {freelancer.location}</span>
            <span>⭐ {freelancer.experience || '1+'} years</span>
          </div>
          <div className="mt-3 pt-3 border-t">
            <p className="font-semibold text-gray-800 mb-2">{freelancer.price_range || 'Price on request'}</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
            >
              Contact {listingName}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white p-3 border-b flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <ContactModal
                listingId={freelancer.id}
                listingName={listingName}
                onClose={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </>
  )
}
