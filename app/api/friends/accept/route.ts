import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { userId, friendId } = await request.json()

    if (!userId || !friendId) {
      return NextResponse.json(
        { error: 'Thiếu thông tin' },
        { status: 400 }
      )
    }

    // Update friend request to accepted
    const { data, error } = await supabase
      .from('friends')
      .update({ 
        status: 'accepted',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', friendId)
      .eq('friend_id', userId)
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Create reciprocal friendship
    await supabase
      .from('friends')
      .insert({
        user_id: userId,
        friend_id: friendId,
        status: 'accepted'
      })

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
