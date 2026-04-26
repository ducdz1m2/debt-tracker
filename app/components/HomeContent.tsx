'use client'

import { useState, useEffect } from 'react'
import DebtList from './DebtList'
import LogoutButton from './LogoutButton'
import NotificationPermissionButton from './TestNotificationButton'
import ProductCard from './ProductCard'
import ProductForm from './ProductForm'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import Swal from 'sweetalert2'

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
  quantity: number
}

interface User {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
}

export default function HomeContent({ initialDebts }: HomeContentProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [showProductForm, setShowProductForm] = useState(false)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [showAssigneeModal, setShowAssigneeModal] = useState(false)
  const [showEditProductModal, setShowEditProductModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editImageUrl, setEditImageUrl] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editPurchaseLocation, setEditPurchaseLocation] = useState('')
  const [editUploading, setEditUploading] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
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
      // Deduplicate by ID
      const uniqueUsers = Array.from(new Map((data.friends as User[]).map((u: User) => [u.id, u])).values())
      setUsers(uniqueUsers)
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
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã thêm sản phẩm!',
        timer: 1500,
        showConfirmButton: false
      })
      setShowProductForm(false)
      loadProducts(userId)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Lỗi thêm sản phẩm'
      })
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    const userId = localStorage.getItem('user_id')
    if (!userId) return

    const result = await Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc muốn xóa sản phẩm này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Có, xóa!',
      cancelButtonText: 'Hủy'
    })

    if (!result.isConfirmed) return

    const res = await fetch('/api/products/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId }),
    })

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã xóa sản phẩm!',
        timer: 1500,
        showConfirmButton: false
      })
      loadProducts(userId)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Lỗi xóa sản phẩm'
      })
    }
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setEditTitle(product.title)
    setEditPrice(product.price.toString())
    setEditImageUrl(product.image_url || '')
    setEditPurchaseLocation(product.purchase_location || '')
    setEditImageFile(null)
    setShowEditProductModal(true)
  }

  const handleEditImageUpload = async (file: File) => {
    if (!file) return

    setEditUploading(true)
    try {
      const userId = localStorage.getItem('user_id')
      if (!userId) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, file)

      if (uploadError) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Lỗi upload ảnh: ' + uploadError.message
        })
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath)

      setEditImageUrl(publicUrl)
      setEditImageFile(null)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Lỗi upload ảnh'
      })
    } finally {
      setEditUploading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingProduct || !editTitle || !editPrice) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Vui lòng điền đầy đủ thông tin'
      })
      return
    }

    setEditLoading(true)
    const userId = localStorage.getItem('user_id')
    if (!userId) return

    const res = await fetch('/api/products/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        productId: editingProduct.id,
        title: editTitle,
        price: editPrice,
        imageUrl: editImageUrl,
        purchaseLocation: editPurchaseLocation,
      }),
    })

    if (res.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Đã cập nhật sản phẩm!',
        timer: 1500,
        showConfirmButton: false
      })
      setShowEditProductModal(false)
      setEditingProduct(null)
      loadProducts(userId)
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Lỗi cập nhật sản phẩm'
      })
    }
    setEditLoading(false)
  }

  const handleCancelEdit = () => {
    setShowEditProductModal(false)
    setEditingProduct(null)
    setEditTitle('')
    setEditPrice('')
    setEditImageUrl('')
    setEditPurchaseLocation('')
    setEditImageFile(null)
  }

  const handleAddToCart = (product: Product) => {
    // Check if product already exists in cart
    const existingIndex = cart.findIndex(item => item.title === product.title && item.price === product.price)
    if (existingIndex >= 0) {
      // Increase quantity
      const updatedCart = [...cart]
      updatedCart[existingIndex].quantity += 1
      setCart(updatedCart)
    } else {
      // Add new item with quantity 1
      setCart([...cart, { ...product, id: `product-${product.id}`, quantity: 1 }])
    }
  }

  const handleAddManualToCart = () => {
    if (!manualTitle || !manualPrice) {
      Swal.fire({
        icon: 'warning',
        title: 'Thiếu thông tin',
        text: 'Vui lòng điền đầy đủ thông tin'
      })
      return
    }

    // Check if manual entry already exists in cart
    const existingIndex = cart.findIndex(item => item.title === manualTitle && item.price === parseFloat(manualPrice))
    if (existingIndex >= 0) {
      // Increase quantity
      const updatedCart = [...cart]
      updatedCart[existingIndex].quantity += 1
      setCart(updatedCart)
    } else {
      // Add new item with quantity 1
      setCart([...cart, {
        id: `manual-${Date.now()}`,
        title: manualTitle,
        price: parseFloat(manualPrice),
        isManual: true,
        quantity: 1
      }])
    }

    setManualTitle('')
    setManualPrice('')
    setShowManualEntry(false)
  }

  const handleRemoveFromCart = (index: number) => {
    const updatedCart = [...cart]
    if (updatedCart[index].quantity > 1) {
      updatedCart[index].quantity -= 1
      setCart(updatedCart)
    } else {
      setCart(cart.filter((_, i) => i !== index))
    }
  }

  const handleUpdateQuantity = (index: number, delta: number) => {
    const updatedCart = [...cart]
    updatedCart[index].quantity += delta
    if (updatedCart[index].quantity <= 0) {
      setCart(cart.filter((_, i) => i !== index))
    } else {
      setCart(updatedCart)
    }
  }

  const handleCheckout = () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Giỏ nợ trống',
        text: 'Vui lòng thêm sản phẩm vào giỏ trước khi tạo nợ'
      })
      return
    }
    setShowAssigneeModal(true)
  }

  const handleConfirmDebt = async () => {
    if (selectedAssignees.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn người nợ',
        text: 'Vui lòng chọn ít nhất một người nợ'
      })
      return
    }

    setLoading(true)

    // Calculate total with quantities
    const totalAmount = cart.reduce((sum, p) => sum + (p.price * p.quantity), 0)
    const splitAmount = totalAmount / selectedAssignees.length
    const descriptions = cart.map(p => `${p.title} x${p.quantity}`).join(', ')

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
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Lỗi khi tạo nợ: ' + error.message
      })
    } else {
      const message = selectedAssignees.length === 1
        ? 'Đã tạo nợ thành công!'
        : `Đã tạo ${selectedAssignees.length} khoản nợ thành công! Mỗi người nợ ${splitAmount.toLocaleString('vi-VN')}đ.`
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: message,
        timer: 2000,
        showConfirmButton: false
      })
      setCart([])
      setSelectedAssignees([])
      setShowAssigneeModal(false)
      window.location.reload()
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-8 sm:px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            📝 Ghi Nợ Sinh Hoạt
          </h1>
          <div className="flex flex-wrap gap-2">
            <Link href="/friends" className="bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm" title="Bạn bè">
              👥
            </Link>
            <Link href="/history" className="bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm" title="Lịch sử">
              📜
            </Link>
            <Link href="/stats" className="bg-indigo-500 text-white px-3 py-2 rounded-lg hover:bg-indigo-600 transition-colors text-sm" title="Thống kê">
              📊
            </Link>
            <Link href="/profile" className="bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors text-sm" title="Profile">
              👤
            </Link>
            <NotificationPermissionButton />
            <LogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Left Column - Cart */}
          <div className="lg:sticky lg:top-8 lg:self-start order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-700">🛒 Giỏ nợ ({cart.length})</h2>
                <button
                  onClick={() => setShowManualEntry(!showManualEntry)}
                  className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm w-full sm:w-auto"
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
                      <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 bg-gray-50 rounded gap-2">
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="w-10 h-10 object-cover rounded flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">📦</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="text-sm truncate block">{item.title}</span>
                            {item.quantity > 1 && (
                              <span className="text-xs text-gray-500 ml-1">x{item.quantity}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateQuantity(index, -1)}
                              className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                            >
                              -
                            </button>
                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(index, 1)}
                              className="w-6 h-6 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                            >
                              +
                            </button>
                          </div>
                          <span className="font-semibold text-blue-600 text-sm">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</span>
                          <button
                            onClick={() => handleRemoveFromCart(index)}
                            className="text-red-500 hover:text-red-700 flex-shrink-0"
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
                      <span className="text-blue-600">{cart.reduce((sum, p) => sum + (p.price * p.quantity), 0).toLocaleString('vi-VN')}đ</span>
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
          <div className="order-1 lg:order-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700">📦 Sản phẩm</h2>
              <button
                onClick={() => setShowProductForm(!showProductForm)}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm w-full sm:w-auto"
              >
                {showProductForm ? 'Đóng' : '+ Thêm sản phẩm'}
              </button>
            </div>

            {showProductForm && (
              <ProductForm onCreateProduct={handleCreateProduct} />
            )}

            <div className="space-y-3 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isCreator={product.created_by === currentUserId}
                    onDelete={handleDeleteProduct}
                    onAddToCart={handleAddToCart}
                    onEdit={handleEditProduct}
                  />
                ))
              ) : (
                <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 text-center text-gray-500">
                  Chưa có sản phẩm nào
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Danh sách nợ</h2>
          <DebtList initialDebts={initialDebts} />
        </div>

        {/* Assignee Selection Modal */}
        {showAssigneeModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-md w-full mx-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Chọn người nợ</h2>
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                {users.map(user => (
                  <label key={user.id} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
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
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || user.username} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm flex-shrink-0">👤</div>
                    )}
                    <span className="truncate">{user.full_name || user.username}</span>
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

        {/* Product Edit Modal */}
        {showEditProductModal && editingProduct && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-md w-full mx-4">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-700">Sửa sản phẩm</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Tên sản phẩm *
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Giá tiền (VNĐ) *
                  </label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Ảnh sản phẩm
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setEditImageFile(file)
                          handleEditImageUpload(file)
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={editUploading}
                    />
                    {editUploading && <span className="text-sm text-gray-500">Đang upload...</span>}
                  </div>
                  {editImageUrl && (
                    <div className="mt-2">
                      <img src={editImageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Chỗ mua
                  </label>
                  <input
                    type="text"
                    value={editPurchaseLocation}
                    onChange={(e) => setEditPurchaseLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={handleCancelEdit}
                  disabled={editLoading}
                  className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 disabled:bg-gray-400"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading || editUploading}
                  className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {editLoading ? 'Đang lưu...' : 'Lưu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
