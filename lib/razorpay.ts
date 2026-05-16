// lib/razorpay.ts
import RazorpayClient from 'razorpay'
import crypto from 'crypto'

function getRazorpay() {
  return new RazorpayClient({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  })
}

export async function createRazorpayOrder(amount: number, receipt: string) {
  const order = await getRazorpay().orders.create({
    amount: amount * 100, // paise
    currency: 'INR',
    receipt,
  })
  return order
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const body = `${orderId}|${paymentId}`
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex')
  return expectedSignature === signature
}

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(payload)
    .digest('hex')
  return expectedSignature === signature
}
