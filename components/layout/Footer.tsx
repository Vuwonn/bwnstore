import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="mt-12 bg-gray-900 py-10 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <p className="text-2xl font-bold text-orange-400">NexStore</p>
            <p className="mt-2 text-sm text-gray-300">We are here to deliver your gaming top-up orders instantly.</p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">Quick Links</p>
            <div className="mt-3 space-y-2 text-sm text-gray-200">
              <Link href="/" className="block transition hover:text-orange-400">
                Home
              </Link>
              <Link href="/dashboard/orders" className="block transition hover:text-orange-400">
                My Orders
              </Link>
              <Link href="/dashboard/cms" className="block transition hover:text-orange-400">
                CMS
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">Follow Us</p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <a href="#" className="rounded-md bg-white/10 px-3 py-1.5 transition hover:bg-orange-500/70">
                Facebook
              </a>
              <a href="#" className="rounded-md bg-white/10 px-3 py-1.5 transition hover:bg-orange-500/70">
                Instagram
              </a>
              <a href="#" className="rounded-md bg-white/10 px-3 py-1.5 transition hover:bg-orange-500/70">
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} NexStore. All rights reserved.
        </div>
      </div>
    </footer>
  )
}