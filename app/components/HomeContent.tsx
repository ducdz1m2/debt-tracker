'use client'

import { useState, useEffect } from 'react'
import DebtList from './DebtList'
import LogoutButton from './LogoutButton'
import NotificationPermissionButton from './TestNotificationButton'
import ProductCard from './ProductCard'
import ProductForm from './ProductForm'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

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

interface CartItem {
  id: string
  title: string
  price: number
  image_url?: string
  isManual?: boolean
}

interface User {
  id: string
  username: string
}

export default function HomeContent({ initialDebts }: HomeContentProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [showAssigneeModal, setShowAssigneeModal] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  // Manual entry form
  const [manualTitle, setManualTitle] = useState('')
  const [manualPrice, setManualPrice] = useState('')

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    const username = localStorage.getItem('username')
    if (userId) {
      setCurrentUserId(userId)
      setCurrentUsername(username || null)
      loadProducts(userId)
      loadUsers(userId)
    }
  }, [])

  const loadProducts = async (userId: string) => {
    const res = await fetch(`/api/products/list?userId=${userId}`)
    const data = await res.json()
    if (data.products) {
      setProducts(data.products)
    }
  }

  const loadUsers = async (userId: string) => {
    const res = await fetch(`/api/friends/list?userId=${userId}`)
    const data = await res.json()
    if (data.friends) {
      setUsers(data.friends)
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
    setCart([...cart, { ...product, id: `product-${product.id}` }])
  }

  const handleAddManualToCart = () => {
    if (!manualTitle || !manualPrice) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    setCart([...cart, {
      id: `manual-${Date.now()}`,
      title: manualTitle,
      price: parseFloat(manualPrice),
      isManual: true
    }])

    setManualTitle('')
    setManualPrice('')
    setShowManualEntry(false)
  }

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Giỏ nợ trống!')
      return
    }
    setShowAssigneeModal(true)
  }

  const handleConfirmDebt = async () => {
    if (selectedAssignees.length === 0) {
      alert('Vui lòng chọn người nợ')
      return
    }

    setLoading(true)

    const totalAmount = cart.reduce((sum, p) => sum + p.price, 0)
    const splitAmount = totalAmount / selectedAssignees.length
    const descriptions = cart.map(p => p.title).join(', ')

    // Create debt records for each selected person
    const debtRecords = selectedAssignees.map(userId => {
      const user = users.find(u => u.id === userId)
      return {
        amount: splitAmount,
        description: descriptions,
        debt_date: new Date().toISOString().split('T')[0],
        debtor_name: user?.username || 'Unknown',
        created_by: currentUsername || 'Unknown',
        assigned_to: userId,
        status: 'pending',
      }
    })

    const { error } = await supabase
      .from('debts')
      .insert(debtRecords)

    if (error) {
      alert('Lỗi khi tạo nợ: ' + error.message)
    } else {
      const message = selectedAssignees.length === 1
        ? 'Đã tạo nợ thành công!'
        : `Đã tạo ${selectedAssignees.length} khoản nợ thành công! Mỗi người nợ ${splitAmount.toLocaleString('vi-VN')}đ.`
      alert(message)
      setCart([])
      setSelectedAssignees([])
      setShowAssigneeModal(false)
      window.location.reload()
    }

    setLoading(false)
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
          {/* Left Column - Cart */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-700">🛒 Giỏ nợ ({cart.length})</h2>
                <button
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  {showManualEntry ? 'Đóng' : '+ Nhập thủ công'}
                </button>
              </div>

              {showManualEntry && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={manualTitle}
                      onChange={(e) => setManualTitle(e.target.value)}
                      placeholder="Tên khoản nợ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <input
                      type="number"
                      value={manualPrice}
                      onChange={(e) => setManualPrice(e.target.value)}
                      placeholder="Số tiền"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <button
                      onClick={handleAddManualToCart}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                    >
                      Thêm vào giỏ
                    </button>
                  </div>
                </div>
              )}

              {cart.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4">
                    {cart.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-10 h-10 object-cover rounded" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">📦</div>
                          )}
                          <span className="text-sm">{item.title}</span>
                        </div>
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
                    onClick={handleCheckout}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Xác nhận tạo nợ
                  </button>
                </>
              ) : (
                <div className="text-center text-gray-500 py-4">
                  Giỏ nợ trống
                </div>
              )}
            </div>
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

        {/* Assignee Selection Modal */}
        {showAssigneeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full mx-4">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">Chọn người nợ</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {users.map(user => (
                  <label key={user.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                    <input
                      type="checkbox"
                      value={user.id}
                      checked={selectedAssignees.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAssignees([...selectedAssignees, user.id])
                        } else {
                          setSelectedAssignees(selectedAssignees.filter(id => id !== user.id))
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span>{user.username}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAssigneeModal(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmDebt}
                  disabled={loading || selectedAssignees.length === 0}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? 'Đang tạo...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
