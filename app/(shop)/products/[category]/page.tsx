import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import CategoryOrder from '@/components/features/products/CategoryOrder'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

type CategoryRow = {
  id: string
  title: string
  description: string | null
  image_url: string | null
}

type ProductRow = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image_url: string | null
  stock_quantity: number
}

type Params = {
  params: Promise<{ category: string }>
}

export default async function CategoryPage({ params }: Params) {
  const { category: categoryParam } = await params
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const { data: categoryRows } = await supabase
    .from('categories')
    .select('id,title,description,image_url')
    .order('title', { ascending: true })

  const category = ((categoryRows ?? []) as CategoryRow[]).find(
    (row) => row.id === categoryParam || slugify(row.title) === categoryParam.toLowerCase()
  )

  if (!category) {
    notFound()
  }

  const { data: products } = await supabase
    .from('products')
    .select('id,name,description,price,currency,image_url,stock_quantity')
    .eq('category_id', category.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-6xl p-6">
        <section className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr]">
            <div className="h-44 bg-gray-100 md:h-full">
              {category.image_url ? (
                <img src={category.image_url} alt={category.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center bg-linear-to-r from-orange-100 to-orange-200 text-lg font-bold text-orange-700">
                  {category.title}
                </div>
              )}
            </div>
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900">{category.title}</h1>
              <p className="mt-2 text-gray-600">{category.description || 'Select package and complete your top-up.'}</p>
            </div>
          </div>
        </section>

        <CategoryOrder
          products={(products ?? []) as ProductRow[]}
          categoryTitle={category.title}
          categorySlug={categoryParam}
          isLoggedIn={Boolean(user)}
        />
      </main>
      <Footer />
    </div>
  )
}
