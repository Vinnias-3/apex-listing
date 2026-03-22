import { supabase } from '../lib/supabase'
import HeroSection from '../components/HeroSection'
import FreelancerCard from '../components/FreelancerCard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(5)

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
          <div className="flex justify-between items-center flex-wrap gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-blue-600">APEX Listing Company</h1>
              <p className="text-gray-600 text-sm md:text-base mt-1">Find trusted freelancers and businesses in Kenya</p>
            </div>
            <div className="flex gap-3">
              <a href="/freelancer/login" className="text-sm text-gray-500 hover:text-blue-600">Login</a>
              <a href="/freelancer/register" className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">Register</a>
            </div>
          </div>
        </div>
      </header>

      {/* Notification Bar */}
      {notifications && notifications.length > 0 && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="container mx-auto px-4 py-2">
            <div className="flex gap-3 overflow-x-auto">
              <span className="text-yellow-700 font-bold text-sm flex-shrink-0">📢 NOTICE:</span>
              <div className="flex gap-4">
                {notifications.map((n) => (
                  <div key={n.id} className="text-sm text-gray-700 whitespace-nowrap">
                    {n.content}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero + Search Section */}
      <HeroSection categories={categories} />

      {/* Freelancers Grid */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Freelancers</h2>
        
        {error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error loading freelancers. Please try again later.</p>
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <FreelancerCard key={listing.id} freelancer={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No freelancers listed yet. Check back soon!</p>
            <p className="text-sm text-gray-400 mt-2">Are you a freelancer? Register now to get started.</p>
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
    </main>
  )
}
