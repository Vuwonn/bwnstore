'use client'

import { useEffect, useMemo, useState } from 'react'
import ProofImageViewer from '@/components/common/ProofImageViewer'

type Product = {
  id: string
  name: string
  description: string | null
  category: string
  category_id: string | null
  price: number
  currency: string
  image_url: string | null
  stock_quantity: number
  is_available: boolean
  categories?: {
    id: string
    title: string
    description: string | null
    image_url: string | null
  } | null
}

type Category = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  created_at: string
}

type CmsUser = {
  id: string
  username: string | null
  full_name: string | null
  is_admin: boolean
  created_at: string
}

type CmsOrder = {
  id: string
  order_number: string
  user_id: string
  total_amount: number
  order_status: 'pending' | 'approved' | 'completed'
  payment_method: string
  payment_status: string
  delivery_status: string
  customer_phone: string | null
  player_uid: string | null
  remarks: string | null
  payment_screenshot_url: string | null
  created_at: string
}

type ProductFormState = {
  id?: string
  name: string
  description: string
  category_id: string
  price: string
  currency: string
  image_url: string
  stock_quantity: string
  is_available: boolean
}

type CategoryFormState = {
  title: string
  description: string
  image_url: string
}

const emptyForm: ProductFormState = {
  name: '',
  description: '',
  category_id: '',
  price: '',
  currency: 'NPR',
  image_url: '',
  stock_quantity: '0',
  is_available: true,
}

const emptyCategoryForm: CategoryFormState = {
  title: '',
  description: '',
  image_url: '',
}

export default function ProductCMS() {
  const [activeSection, setActiveSection] = useState<'dashboard' | 'categories' | 'users' | 'orders'>('dashboard')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [users, setUsers] = useState<CmsUser[]>([])
  const [orders, setOrders] = useState<CmsOrder[]>([])
  const [form, setForm] = useState<ProductFormState>(emptyForm)
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(emptyCategoryForm)
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categorySaving, setCategorySaving] = useState(false)
  const [roleSavingId, setRoleSavingId] = useState<string | null>(null)
  const [orderSavingId, setOrderSavingId] = useState<string | null>(null)
  const [showItemModal, setShowItemModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)
  const [itemImageFile, setItemImageFile] = useState<File | null>(null)
  const [categoryImageFile, setCategoryImageFile] = useState<File | null>(null)
  const [uploadingItemImage, setUploadingItemImage] = useState(false)
  const [uploadingCategoryImage, setUploadingCategoryImage] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const isEditing = useMemo(() => Boolean(form.id), [form.id])

  const loadProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/products', { cache: 'no-store' })
      const result = (await response.json()) as { products?: Product[]; error?: string }
      if (!response.ok) throw new Error(result.error || 'Failed to load products')
      setProducts(result.products ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    setCategoriesLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/categories', { cache: 'no-store' })
      const result = (await response.json()) as { categories?: Category[]; error?: string }
      if (!response.ok) throw new Error(result.error || 'Failed to load categories')
      setCategories(result.categories ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const loadUsers = async () => {
    setUsersLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/users', { cache: 'no-store' })
      const result = (await response.json()) as { users?: CmsUser[]; error?: string }
      if (!response.ok) throw new Error(result.error || 'Failed to load users')
      setUsers(result.users ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setUsersLoading(false)
    }
  }

  const loadOrders = async () => {
    setOrdersLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/orders', { cache: 'no-store' })
      const result = (await response.json()) as { orders?: CmsOrder[]; error?: string }
      if (!response.ok) throw new Error(result.error || 'Failed to load orders')
      setOrders(result.orders ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders')
    } finally {
      setOrdersLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
    void loadCategories()
    void loadUsers()
    void loadOrders()
  }, [])

  const resetForm = () => {
    setForm(emptyForm)
    setItemImageFile(null)
  }

  const uploadImage = async (file: File, folder: 'products' | 'categories') => {
    const data = new FormData()
    data.append('file', file)
    data.append('folder', folder)

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: data,
    })
    const result = (await response.json()) as { publicUrl?: string; error?: string }
    if (!response.ok || !result.publicUrl) {
      throw new Error(result.error || 'Failed to upload image')
    }
    return result.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let productImageUrl = form.image_url.trim() || null
      if (itemImageFile) {
        setUploadingItemImage(true)
        productImageUrl = await uploadImage(itemImageFile, 'products')
      }

      const payload = {
        id: form.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: categories.find((c) => c.id === form.category_id)?.title || 'General',
        category_id: form.category_id || null,
        price: Number(form.price),
        currency: form.currency.trim() || 'NPR',
        image_url: productImageUrl,
        stock_quantity: Number(form.stock_quantity || 0),
        is_available: form.is_available,
      }

      const response = await fetch('/api/admin/products', {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Failed to save product')

      await loadProducts()
      resetForm()
      setShowItemModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setUploadingItemImage(false)
      setSaving(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategorySaving(true)
    setError(null)
    try {
      let categoryImageUrl = categoryForm.image_url.trim() || null
      if (categoryImageFile) {
        setUploadingCategoryImage(true)
        categoryImageUrl = await uploadImage(categoryImageFile, 'categories')
      }

      const response = await fetch('/api/admin/categories', {
        method: editingCategoryId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCategoryId || undefined,
          title: categoryForm.title,
          description: categoryForm.description,
          image_url: categoryImageUrl,
        }),
      })
      const result = (await response.json()) as { category?: Category; error?: string }
      if (!response.ok) throw new Error(result.error || 'Failed to create category')

      await loadCategories()
      if (!editingCategoryId && result.category?.id) {
        setForm((prev) => ({ ...prev, category_id: result.category?.id || prev.category_id }))
      }
      setCategoryForm(emptyCategoryForm)
      setCategoryImageFile(null)
      setEditingCategoryId(null)
      setShowCategoryModal(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category')
    } finally {
      setUploadingCategoryImage(false)
      setCategorySaving(false)
    }
  }

  const startEditCategory = (category: Category) => {
    setCategoryForm({
      title: category.title,
      description: category.description || '',
      image_url: category.image_url || '',
    })
    setCategoryImageFile(null)
    setEditingCategoryId(category.id)
    setShowCategoryModal(true)
  }

  const handleRoleToggle = async (userId: string, isAdmin: boolean) => {
    setRoleSavingId(userId)
    setError(null)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isAdmin }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Failed to update role')
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update role')
    } finally {
      setRoleSavingId(null)
    }
  }

  const handleOrderStatusUpdate = async (
    orderId: string,
    orderStatus: 'pending' | 'approved' | 'completed'
  ) => {
    setOrderSavingId(orderId)
    setError(null)
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Failed to update order status')
      await loadOrders()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status')
    } finally {
      setOrderSavingId(null)
    }
  }

  const startEdit = (product: Product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      category_id: product.category_id ?? '',
      price: String(product.price),
      currency: product.currency,
      image_url: product.image_url ?? '',
      stock_quantity: String(product.stock_quantity),
      is_available: product.is_available,
    })
    setItemImageFile(null)
    setShowItemModal(true)
  }

  const handleDelete = async (id: string) => {
    setError(null)
    try {
      const response = await fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const result = (await response.json()) as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Failed to delete product')
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    }
  }

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    return products.filter((product) => {
      const matchesCategory = filterCategory === 'all' || product.category_id === filterCategory
      if (!matchesCategory) return false
      if (!query) return true

      const haystack = `${product.name} ${product.category} ${product.categories?.title ?? ''}`.toLowerCase()
      return haystack.includes(query)
    })
  }, [products, filterCategory, searchTerm])

  const dashboardStats = useMemo(() => {
    const total = products.length
    const available = products.filter((p) => p.is_available).length
    const outOfStock = products.filter((p) => p.stock_quantity <= 0).length
    return { total, available, outOfStock }
  }, [products])

  return (
    <div className="grid min-h-[75vh] grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]">
      <aside className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">CMS Menu</p>
        <nav className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => setActiveSection('dashboard')}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
              activeSection === 'dashboard' ? 'bg-orange-100 text-orange-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('categories')}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
              activeSection === 'categories' ? 'bg-orange-100 text-orange-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('users')}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
              activeSection === 'users' ? 'bg-orange-100 text-orange-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            User Roles
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('orders')}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition ${
              activeSection === 'orders' ? 'bg-orange-100 text-orange-700' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Orders
          </button>
        </nav>
      </aside>

      <section className="space-y-6">
        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        {activeSection === 'dashboard' ? (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Total Items</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{dashboardStats.total}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Available</p>
                <p className="mt-2 text-2xl font-bold text-green-700">{dashboardStats.available}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-sm text-gray-500">Out of Stock</p>
                <p className="mt-2 text-2xl font-bold text-red-700">{dashboardStats.outOfStock}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row">
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search items..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 md:w-72"
                  />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2"
                  >
                    <option value="all">All game types</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    resetForm()
                    setShowItemModal(true)
                  }}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
                >
                  + Add Item
                </button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="px-3 py-2 font-semibold">Item</th>
                      <th className="px-3 py-2 font-semibold">Game Type</th>
                      <th className="px-3 py-2 font-semibold">Price</th>
                      <th className="px-3 py-2 font-semibold">Stock</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr>
                        <td className="px-3 py-3 text-gray-500" colSpan={6}>
                          Loading items...
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td className="px-3 py-3 text-gray-500" colSpan={6}>
                          No items found.
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 overflow-hidden rounded-md bg-gray-100">
                                {product.image_url ? (
                                  <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                                ) : null}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{product.name}</p>
                                <p className="text-xs text-gray-500">{product.description || 'No description'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-gray-700">{product.categories?.title || product.category || 'General'}</td>
                          <td className="px-3 py-3 text-gray-700">
                            {product.currency} {product.price.toLocaleString()}
                          </td>
                          <td className="px-3 py-3 text-gray-700">{product.stock_quantity}</td>
                          <td className="px-3 py-3">
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                product.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {product.is_available ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => startEdit(product)}
                                className="rounded border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(product.id)}
                                className="rounded bg-red-600 px-2 py-1 text-xs font-semibold text-white hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : activeSection === 'categories' ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Categories</h3>
                <p className="mt-1 text-sm text-gray-600">Manage game categories with image, title and description.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCategoryForm(emptyCategoryForm)
                  setCategoryImageFile(null)
                  setEditingCategoryId(null)
                  setShowCategoryModal(true)
                }}
                className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700"
              >
                + Add Category
              </button>
            </div>

            {categoriesLoading ? (
              <p className="mt-4 text-gray-600">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="mt-4 text-gray-600">No categories found.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => (
                  <div key={category.id} className="rounded-lg border border-gray-200 p-4">
                    <div className="mb-3 h-32 overflow-hidden rounded-md bg-gray-100">
                      {category.image_url ? (
                        <img src={category.image_url} alt={category.title} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <p className="font-semibold text-gray-900">{category.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{category.description || 'No description'}</p>
                    <button
                      type="button"
                      onClick={() => startEditCategory(category)}
                      className="mt-3 rounded border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeSection === 'users' ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">User Roles</h3>
            <p className="mt-1 text-sm text-gray-600">Promote or demote users for CMS admin access.</p>
            {usersLoading ? (
              <p className="mt-4 text-gray-600">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="mt-4 text-gray-600">No users found.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{user.full_name || user.username || user.id}</p>
                      <p className="text-sm text-gray-600">{user.is_admin ? 'Admin' : 'User'}</p>
                    </div>
                    <button
                      type="button"
                      disabled={roleSavingId === user.id}
                      onClick={() => handleRoleToggle(user.id, !user.is_admin)}
                      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {roleSavingId === user.id ? 'Saving...' : user.is_admin ? 'Demote to user' : 'Promote to admin'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">Orders</h3>
            <p className="mt-1 text-sm text-gray-600">Submitted orders with payment proof, phone number and remarks.</p>
            {ordersLoading ? (
              <p className="mt-4 text-gray-600">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="mt-4 text-gray-600">No orders found yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="px-3 py-2 font-semibold">Order</th>
                      <th className="px-3 py-2 font-semibold">Phone</th>
                      <th className="px-3 py-2 font-semibold">UID</th>
                      <th className="px-3 py-2 font-semibold">Amount</th>
                      <th className="px-3 py-2 font-semibold">Order Status</th>
                      <th className="px-3 py-2 font-semibold">Proof</th>
                      <th className="px-3 py-2 font-semibold">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-3 py-3 text-gray-700">
                          <p className="font-semibold text-gray-900">{order.order_number}</p>
                          <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                        </td>
                        <td className="px-3 py-3 text-gray-700">{order.customer_phone || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">{order.player_uid || '-'}</td>
                        <td className="px-3 py-3 text-gray-700">Rs. {order.total_amount.toLocaleString()}</td>
                        <td className="px-3 py-3 text-gray-700">
                          <select
                            value={order.order_status}
                            disabled={orderSavingId === order.id}
                            onChange={(e) =>
                              handleOrderStatusUpdate(
                                order.id,
                                e.target.value as 'pending' | 'approved' | 'completed'
                              )
                            }
                            className="rounded border border-gray-300 px-2 py-1 text-xs"
                          >
                            <option value="pending">pending</option>
                            <option value="approved">approved</option>
                            <option value="completed">completed</option>
                          </select>
                          <p className="mt-1 text-[11px] text-gray-500">
                            Payment: {order.payment_status} | Delivery: {order.delivery_status}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-gray-700">
                          {order.payment_screenshot_url ? (
                            <ProofImageViewer imageUrl={order.payment_screenshot_url} label="View screenshot" />
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-3 py-3 text-gray-700">{order.remarks || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {showItemModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Item' : 'Add Item'}</h2>
              <button
                type="button"
                onClick={() => {
                  setShowItemModal(false)
                  setItemImageFile(null)
                }}
                className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Item title"
                className="rounded-lg border border-gray-300 px-4 py-2"
                required
              />
              <div className="flex gap-2">
                <select
                  value={form.category_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, category_id: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                  disabled={categoriesLoading}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                onClick={() => {
                  setCategoryForm(emptyCategoryForm)
                  setCategoryImageFile(null)
                  setEditingCategoryId(null)
                  setShowCategoryModal(true)
                }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  + Category
                </button>
              </div>
              <input
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="Price"
                type="number"
                min="0"
                step="0.01"
                className="rounded-lg border border-gray-300 px-4 py-2"
                required
              />
              <input
                value={form.currency}
                onChange={(e) => setForm((prev) => ({ ...prev, currency: e.target.value }))}
                placeholder="Currency (NPR)"
                className="rounded-lg border border-gray-300 px-4 py-2"
              />
              <input
                value={form.stock_quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                placeholder="Stock quantity"
                type="number"
                min="0"
                className="rounded-lg border border-gray-300 px-4 py-2"
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Item image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setItemImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
                {(itemImageFile || form.image_url) && (
                  <img
                    src={itemImageFile ? URL.createObjectURL(itemImageFile) : form.image_url}
                    alt="Item preview"
                    className="h-20 w-20 rounded-md object-cover"
                  />
                )}
              </div>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
                className="md:col-span-2 rounded-lg border border-gray-300 px-4 py-2"
                rows={3}
              />
              <label className="md:col-span-2 inline-flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_available: e.target.checked }))}
                />
                Item is active
              </label>
              <div className="md:col-span-2 flex gap-3">
                <button
                  type="submit"
                disabled={saving || uploadingItemImage}
                  className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
                >
                {saving || uploadingItemImage ? 'Saving...' : isEditing ? 'Update Item' : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editingCategoryId ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryModal(false)
                  setCategoryImageFile(null)
                  setEditingCategoryId(null)
                }}
                className="rounded border border-gray-300 px-2 py-1 text-sm text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-3">
              <input
                value={categoryForm.title}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Category title"
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                required
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Category image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCategoryImageFile(e.target.files?.[0] || null)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
                {(categoryImageFile || categoryForm.image_url) && (
                  <img
                    src={categoryImageFile ? URL.createObjectURL(categoryImageFile) : categoryForm.image_url}
                    alt="Category preview"
                    className="h-20 w-20 rounded-md object-cover"
                  />
                )}
              </div>
              <textarea
                value={categoryForm.description}
                onChange={(e) => setCategoryForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Category description"
                className="w-full rounded-lg border border-gray-300 px-4 py-2"
                rows={3}
              />
              <button
                type="submit"
                disabled={categorySaving || uploadingCategoryImage}
                className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition hover:bg-orange-700 disabled:opacity-50"
              >
                {categorySaving || uploadingCategoryImage
                  ? 'Saving...'
                  : editingCategoryId
                    ? 'Update Category'
                    : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
