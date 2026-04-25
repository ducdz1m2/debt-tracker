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

    // Get sent friend requests (where user is the requester)
    const { data: requests, error } = await supabase
      .from('friends')
      .select(`
        user_id,
        friend_id,
        status,
        friend:users!friends_friend_id_fkey (id, username, avatar_url)
      `)
      .eq('user_id', userId)
      .eq('status', 'pending')

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    const formattedRequests = requests?.map((f: any) => ({
      id: f.friend?.id,
      username: f.friend?.username,
      avatar_url: f.friend?.avatar_url
    })) || []

    return NextResponse.json({ requests: formattedRequests })
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
