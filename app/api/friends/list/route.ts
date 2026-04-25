import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'Thiếu userId' },
        { status: 400 }
      )
    }

    // Get friends where user is either user_id or friend_id and status is accepted
    const { data: friends, error } = await supabase
      .from('friends')
      .select(`
        user_id,
        friend_id,
        status,
        users!friends_user_id_fkey (id, username, avatar_url),
        friend:users!friends_friend_id_fkey (id, username, avatar_url)
      `)
      .or(`and(user_id.eq.${userId},status.eq.accepted),and(friend_id.eq.${userId},status.eq.accepted)`)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Format the response to return friend info
    const formattedFriends = friends?.map((f: any) => {
      if (f.user_id === userId) {
        return {
          id: f.friend?.id,
          username: f.friend?.username,
          avatar_url: f.friend?.avatar_url
        }
      } else {
        return {
          id: f.users?.id,
          username: f.users?.username,
          avatar_url: f.users?.avatar_url
        }
      }
    }) || []

    return NextResponse.json({ friends: formattedFriends })
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
