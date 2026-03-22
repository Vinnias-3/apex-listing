import { supabase } from '../lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Test if Supabase works
  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .limit(3)

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold text-blue-600">APEX Listing Company</h1>
      <p className="mt-2">Status: {error ? 'Database Error' : 'Connected to Supabase'}</p>
      <p className="mt-2">Active freelancers found: {listings?.length || 0}</p>
      <pre className="mt-4 bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(listings?.slice(0, 2), null, 2)}
      </pre>
    </main>
  )
}
