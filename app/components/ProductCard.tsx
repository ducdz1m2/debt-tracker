'use client'

import { useState } from 'react'

interface Product {
  id: string
  title: string
  price: number
  image_url?: string
  purchase_location?: string
  created_by: string
}

interface ProductCardProps {
  product: Product
  isCreator: boolean
  onDelete: (id: string) => void
  onAddToCart: (product: Product) => void
  onEdit: (product: Product) => void
}

export default function ProductCard({ product, isCreator, onDelete, onAddToCart, onEdit }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex gap-4">
      {product.image_url ? (
        <img src={product.image_url} alt={product.title} className="w-24 h-24 object-cover rounded-lg" />
      ) : (
        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
          📦
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">{product.title}</h3>
        <p className="text-lg font-bold text-blue-600">{product.price.toLocaleString('vi-VN')} đ</p>
        {product.purchase_location && (
          <p className="text-sm text-gray-500">📍 {product.purchase_location}</p>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onAddToCart(product)}
            className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            + Thêm vào giỏ nợ
          </button>
          {isCreator && (
            <>
              <button
                onClick={() => onEdit(product)}
                className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition-colors text-sm"
              >
                Sửa
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Xóa
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
