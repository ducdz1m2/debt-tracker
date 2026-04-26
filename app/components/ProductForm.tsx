'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Swal from 'sweetalert2'

interface Product {
  id: string
  title: string
  price: number
  image_url?: string
  purchase_location?: string
  created_by: string
}

interface ProductFormProps {
  onCreateProduct: (product: { title: string; price: string; imageUrl: string; purchaseLocation: string }) => void
}

export default function ProductForm({ onCreateProduct }: ProductFormProps) {
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [purchaseLocation, setPurchaseLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleImageUpload = async (file: File) => {
    if (!file) return

    setUploading(true)
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

      setImageUrl(publicUrl)
      setImageFile(null)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Lỗi upload ảnh'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !price) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Vui lòng điền đầy đủ thông tin'
      })
      return
    }

    setLoading(true)
    onCreateProduct({ title, price, imageUrl, purchaseLocation })
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Thêm sản phẩm mới</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Tên sản phẩm *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Cơm chiên, Trà sữa..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Giá tiền (VNĐ) *
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập giá tiền"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Ảnh sản phẩm
          </label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setImageFile(file)
                  handleImageUpload(file)
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={uploading}
            />
            {uploading && <span className="text-sm text-gray-500">Đang upload...</span>}
          </div>
          {imageUrl && (
            <div className="mt-2">
              <img src={imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg" />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Chỗ mua
          </label>
          <input
            type="text"
            value={purchaseLocation}
            onChange={(e) => setPurchaseLocation(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ví dụ: Shopee, GrabFood, Cửa hàng..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
        >
          {loading ? 'Đang thêm...' : 'Thêm sản phẩm'}
        </button>
      </form>
    </div>
  )
}
