import { redirect } from 'next/navigation'
import ProductCMS from '@/components/features/products/ProductCMS'
import { getCurrentUserAndAdminStatus } from '@/lib/auth/admin'

export default async function CmsPage() {
  const { user, isAdmin } = await getCurrentUserAndAdminStatus()

  if (!user) {
    redirect('/login')
  }
  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Product CMS</h1>
      <ProductCMS />
    </main>
  )
}
