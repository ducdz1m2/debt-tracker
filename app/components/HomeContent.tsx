'use client'

import { useState, useEffect } from 'react'
import DebtForm from './DebtForm'
import DebtList from './DebtList'
import LogoutButton from './LogoutButton'
import NotificationPermissionButton from './TestNotificationButton'
import ProductCard from './ProductCard'
import ProductForm from './ProductForm'
import Link from 'next/link'

interface HomeContentProps {
  initialDebts: any[]
}

interface Product {
  id: string
  title: string
  price: number
  image_url?: string
  purchase_location?: string
  created_by: string
}

export default function HomeContent({ initialDebts }: HomeContentProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<Product[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    if (userId) {
      setCurrentUserId(userId)
      loadProducts(userId)
    }
  }, [])

  const loadProducts = async (userId: string) => {
    const res = await fetch(`/api/products/list?userId=${userId}`)
    const data = await res.json()
    if (data.products) {
      setProducts(data.products)
    }
  }

  const handleCreateProduct = async (product: { title: string; price: string; imageUrl: string; purchaseLocation: string }) => {
    const userId = localStorage.getItem('user_id')
    if (!userId) return

    const res = await fetch('/api/products/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        title: product.title,
        price: product.price,
        imageUrl: product.imageUrl,
        purchaseLocation: product.purchaseLocation,
      }),
    })

    if (res.ok) {
      alert('Đã thêm sản phẩm!')
      setShowProductForm(false)
      loadProducts(userId)
    } else {
      alert('Lỗi thêm sản phẩm')
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const userId = localStorage.getItem('user_id')
    if (!userId) return

    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return

    const res = await fetch('/api/products/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId }),
    })

    if (res.ok) {
      alert('Đã xóa sản phẩm!')
      loadProducts(userId)
    } else {
      alert('Lỗi xóa sản phẩm')
    }
  }

  const handleAddToCart = (product: Product) => {
    setCart([...cart, product])
  }

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const handleCreateDebtFromCart = () => {
    if (cart.length === 0) {
      alert('Giỏ nợ trống!')
      return
    }

    const totalAmount = cart.reduce((sum, p) => sum + p.price, 0)
    const descriptions = cart.map(p => p.title).join(', ')

    // Pre-fill DebtForm with cart data
    // This is a simplified approach - in a real app, you'd pass this data to DebtForm
    alert(`Tổng: ${totalAmount.toLocaleString('vi-VN')}đ\nSản phẩm: ${descriptions}\n\nVui lòng nhập thông tin người nợ trong form bên dưới.`)

    // Clear cart after creating debt
    setCart([])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            📝 Ghi Nợ Sinh Hoạt
          </h1>
          <div className="flex gap-2">
            <Link href="/friends" className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors" title="Bạn bè">
              👥
            </Link>
            <Link href="/history" className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors" title="Lịch sử">
              📜
            </Link>
            <Link href="/stats" className="bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-colors" title="Thống kê">
              📊
            </Link>
            <Link href="/profile" className="bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors" title="Profile">
              👤
            </Link>
            <NotificationPermissionButton />
            <LogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Debt Form */}
          <div>
            <DebtForm />

            {/* Cart Section */}
            {cart.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">🛒 Giỏ nợ ({cart.length})</h2>
                <div className="space-y-2 mb-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{item.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600">{item.price.toLocaleString('vi-VN')}đ</span>
                        <button
                          onClick={() => handleRemoveFromCart(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-2 mb-4">
                  <div className="flex justify-between font-bold">
                    <span>Tổng:</span>
                    <span className="text-blue-600">{cart.reduce((sum, p) => sum + p.price, 0).toLocaleString('vi-VN')}đ</span>
                  </div>
                </div>
                <button
                  onClick={handleCreateDebtFromCart}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Tạo nợ từ giỏ
                </button>
              </div>
            )}
          </div>

          {/* Right Column - Products */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">📦 Sản phẩm</h2>
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
              >
                {showProductForm ? 'Đóng' : '+ Thêm sản phẩm'}
              </button>
            </div>

            {showProductForm && (
              <ProductForm onCreateProduct={handleCreateProduct} />
            )}

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isCreator={product.created_by === currentUserId}
                    onDelete={handleDeleteProduct}
                    onAddToCart={handleAddToCart}
                  />
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  Chưa có sản phẩm nào
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Danh sách nợ</h2>
          <DebtList initialDebts={initialDebts} />
        </div>
      </div>
    </div>
  )
}
