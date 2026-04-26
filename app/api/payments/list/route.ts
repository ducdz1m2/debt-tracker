import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const debtId = searchParams.get('debtId')

    if (!debtId) {
      return NextResponse.json(
        { error: 'Thiếu debtId' },
        { status: 400 }
      )
    }

    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('debt_id', debtId)
      .order('payment_date', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ payments })
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
