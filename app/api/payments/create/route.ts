import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { debtId, amount, createdBy } = await request.json()

    if (!debtId || !amount || !createdBy) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Số tiền thanh toán phải lớn hơn 0' },
        { status: 400 }
      )
    }

    // Get debt details
    const { data: debt, error: debtError } = await supabase
      .from('debts')
      .select('amount, deleted_at')
      .eq('id', debtId)
      .single()

    if (debtError || !debt) {
      return NextResponse.json(
        { error: 'Không tìm thấy khoản nợ' },
        { status: 404 }
      )
    }

    if (debt.deleted_at) {
      return NextResponse.json(
        { error: 'Khoản nợ này đã được thanh toán hết' },
        { status: 400 }
      )
    }

    // Get existing payments for this debt
    const { data: existingPayments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('debt_id', debtId)

    if (paymentsError) {
      return NextResponse.json(
        { error: 'Lỗi khi kiểm tra thanh toán' },
        { status: 500 }
      )
    }

    const totalPaid = existingPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0
    const remainingAmount = Number(debt.amount) - totalPaid

    if (amount > remainingAmount) {
      return NextResponse.json(
        { error: `Số tiền thanh toán vượt quá số còn lại (${remainingAmount.toLocaleString('vi-VN')}đ)` },
        { status: 400 }
      )
    }

    // Create payment
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        debt_id: debtId,
        amount,
        created_by: createdBy,
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Payment creation error:', paymentError)
      return NextResponse.json(
        { error: 'Lỗi khi tạo thanh toán: ' + paymentError.message },
        { status: 500 }
      )
    }

    // Check if debt is now fully paid
    const newTotalPaid = totalPaid + amount
    if (newTotalPaid >= Number(debt.amount)) {
      // Mark debt as paid
      await supabase
        .from('debts')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', debtId)
    }

    return NextResponse.json(
      { 
        payment, 
        totalPaid: newTotalPaid, 
        remainingAmount: Number(debt.amount) - newTotalPaid,
        isFullyPaid: newTotalPaid >= Number(debt.amount)
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi server' },
      { status: 500 }
    )
  }
}
