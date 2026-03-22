import { supabase } from '../lib/supabase'
import HeroSection from '../components/HeroSection'
import ContactButton from '../components/ContactButton'

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  // Fetch active listings
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

  // Debug: Log if no listings
  if (!listings || listings.length === 0) {
    console.log('No active listings found in Supabase')
  }

  const categories = [
    'Graphic Design', 'Web Development', 'Plumbing', 'Photography',
    'Writing', 'Cleaning', 'Electrician', 'Catering', 'Digital Marketing',
    'Video Editing', 'Translation', 'Event Planning'
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-blue-600">APEX Listing Company</h1>
              <p className="text-gray-600 mt-1">Find trusted freelancers and businesses in Kenya</p>
            </div>
            <div className="flex gap-3">
              <a href="/freelancer/login" className="text-sm text-gray-500 hover:text-blue-600">Freelancer Login</a>
              <a href="/freelancer/register" className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Register</a>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Area */}
      {notifications && notifications.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex gap-2 overflow-x-auto">
              <span className="text-yellow-700 font-bold text-sm flex-shrink-0">📢 NOTICE:</span>
              {notifications.map((n) => (
                <div key={n.id} className="text-sm text-gray-700">
                  {n.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Hero Section with Search - Client Component */}
      <HeroSection categories={categories} />

      {/* Listings */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Freelancers</h2>
        {listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="freelancer-card bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                data-category={listing.category}
              >
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-1">{listing.business_name || listing.full_name}</h3>
                  <p className="text-blue-600 text-sm mb-2">{listing.category}</p>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{listing.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>📍 {listing.location}</span>
                    <span>⭐ {listing.experience || '1+'} years</span>
                  </div>
                  <div className="mt-3 pt-3 border-t">
                    <p className="font-semibold text-gray-800 mb-2">{listing.price_range || 'Price on request'}</p>
                    <ContactButton listingName={listing.business_name || listing.full_name} phone={listing.phone} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No freelancers listed yet. Check back soon!</p>
            <p className="text-sm text-gray-400 mt-2">If you're a freelancer, register and get approved by admin.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="font-bold text-lg">APEX Listing Company</p>
          <p className="text-sm text-gray-400 mt-2">© 2025 All Rights Reserved</p>
          <p className="text-sm text-gray-400 mt-2">
            Contact: 0748702891 | hardinhiggins60@gmail.com
          </p>
          <p className="text-xs text-gray-500 mt-4">
            Freelancers pay 500 KES registration fee. Listing active for 4 months. 8% commission on jobs.
          </p>
        </div>
      </footer>

      <style>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  )
}
