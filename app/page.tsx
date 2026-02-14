import { createServerClient } from '@/lib/supabase/server'
import StorefrontPanel from '@/components/features/products/StorefrontPanel'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

type StoreCategory = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  matchValue: string
}

type StoreProduct = {
  id: string
  name: string
  description: string | null
  category: string
  category_id: string | null
  price: number
  currency: string
  image_url: string | null
}

export default async function HomePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: productData, error: productError } = await supabase
    .from('products')
    .select('id,name,description,category,category_id,price,currency,image_url,is_available')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(40)

  let products = (productData ?? []) as StoreProduct[]

  // Fallback for older schemas that may not have category_id yet.
  if (productError) {
    const { data: fallbackProducts } = await supabase
      .from('products')
      .select('id,name,description,category,price,currency,image_url,is_available')
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(40)

    products = ((fallbackProducts ?? []) as Array<Omit<StoreProduct, 'category_id'>>).map((p) => ({
      ...p,
      category_id: null,
    }))
  }

  const { data: categoryData } = await supabase
    .from('categories')
    .select('id,title,description,image_url')
    .order('title', { ascending: true })

  let categories = ((categoryData ?? []) as Array<Omit<StoreCategory, 'matchValue'>>).map((c) => ({
    ...c,
    matchValue: c.id,
  }))

  // If categories are missing, derive them from product.category text.
  if (categories.length === 0) {
    categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).map((categoryName) => ({
      id: categoryName,
      title: categoryName,
      description: null,
      image_url: null,
      matchValue: categoryName,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <StorefrontPanel categories={categories} products={products} isLoggedIn={Boolean(user)} />
      </main>
      <Footer />
    </div>
  )
}