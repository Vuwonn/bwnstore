import Link from 'next/link'

type Product = {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  image_url: string | null
}

type ProductGridProps = {
  products: Product[]
  isLoggedIn: boolean
}

export default function ProductGrid({ products, isLoggedIn }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
        No products available yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <article key={product.id} className="rounded-lg bg-white p-4 shadow-sm">
          <div className="mb-3 flex h-40 items-center justify-center rounded-md bg-gray-100">
            {product.image_url ? (
              // Using native img keeps this component simple for now.
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full rounded-md object-cover"
              />
            ) : (
              <span className="text-sm text-gray-500">No image</span>
            )}
          </div>

          <h3 className="line-clamp-2 text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-gray-600">
            {product.description || "No description available"}
          </p>
          <p className="mt-3 text-lg font-bold text-orange-600">
            {product.currency} {product.price.toLocaleString()}
          </p>

          <div className="mt-4">
            {isLoggedIn ? (
              <Link
                href={`/checkout/${product.id}`}
                className="inline-flex w-full justify-center rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition hover:bg-orange-700"
              >
                Buy now
              </Link>
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(`/checkout/${product.id}`)}`}
                className="inline-flex w-full justify-center rounded-lg border border-orange-300 bg-orange-50 px-4 py-2 font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                Login to buy
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
