'use client'

import Link from 'next/link'
import { Search, Home, Package, User, LogOut, ShoppingCart } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-orange-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">
            NexStore
          </Link>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search product"
                className="px-4 py-2 rounded-lg text-gray-800 w-64"
              />
              <Search className="absolute right-3 top-2.5 text-gray-500 w-5 h-5" />
            </div>

            <Link href="/" className="flex items-center hover:text-orange-200 transition">
              <Home className="w-5 h-5 mr-1" />
              Home
            </Link>

            <Link href="/dashboard/orders" className="flex items-center hover:text-orange-200 transition">
              <Package className="w-5 h-5 mr-1" />
              My Orders
            </Link>

            <Link href="/cart" className="flex items-center hover:text-orange-200 transition">
              <ShoppingCart className="w-5 h-5 mr-1" />
              Cart
            </Link>

            <Link href="/dashboard/profile" className="flex items-center hover:text-orange-200 transition">
              <User className="w-5 h-5 mr-1" />
              Account
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center hover:text-orange-200 transition"
            >
              <LogOut className="w-5 h-5 mr-1" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}