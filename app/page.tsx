import { createServerClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/features/products/ProductGrid'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default async function HomePage() {
  const supabase = createServerClient()
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_available', true)
    .limit(8)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <section className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg p-12 text-white mb-8">
          <h1 className="text-5xl font-bold mb-4">Welcome to NexStore</h1>
          <p className="text-xl">Your one-stop shop for gaming items</p>
        </section>

        <section>
          <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
          <ProductGrid products={products || []} />
        </section>
      </main>
      <Footer />
    </div>
  )
}