import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { userId, phone, avatar_url, currentPassword, newPassword } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập' },
        { status: 401 }
      )
    }

    // Get current user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError || !user) {
      return NextResponse.json(
        { error: 'Không tìm thấy user' },
        { status: 404 }
      )
    }

    const updateData: any = {}

    // Update phone
    if (phone !== undefined) {
      updateData.phone = phone
    }

    // Update avatar_url
    if (avatar_url !== undefined) {
      updateData.avatar_url = avatar_url
    }

    // Update password if provided
    if (newPassword && currentPassword) {
      const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash)
      
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Mật khẩu hiện tại không đúng' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Mật khẩu mới phải có ít nhất 6 ký tự' },
          { status: 400 }
        )
      }

      updateData.password_hash = await bcrypt.hash(newPassword, 10)
    }

    // Update user
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, username, phone, avatar_url')
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Lỗi khi cập nhật thông tin' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { user: updatedUser, message: 'Cập nhật thành công' },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
