'use client'
import Link from 'next/link'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'

export default function PaymentFailedPage() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-red-500/15 border-2 border-red-500/30 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-400" />
        </div>
        <h1 className="text-white font-black text-3xl mb-3">Payment Failed</h1>
        <p className="text-gray-400 text-base mb-8">
          Something went wrong with your payment. You have not been charged. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cart"
            className="inline-flex items-center justify-center gap-2 bg-brand-gradient text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
            <RefreshCw className="w-4 h-4" /> Try Again
          </Link>
          <Link href="/"
            className="inline-flex items-center justify-center gap-2 bg-dark-700 border border-dark-500 text-gray-300 font-medium px-6 py-3 rounded-xl hover:text-white hover:border-brand-500/40 transition-all">
            <ArrowLeft className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
