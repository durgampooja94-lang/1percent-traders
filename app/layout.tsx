// app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { CartProvider } from '@/hooks/useCart'

export const metadata: Metadata = {
  title: '1% Traders Hub',
  description: "India's premier stock market education platform. Learn proven trading strategies from professionals who actually trade.",
  keywords: 'stock market course, trading course India, learn trading, intraday trading, options trading course',
  openGraph: {
    title: '1% Traders Hub',
    description: 'Learn proven stock market trading strategies from professionals.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-dark-900 text-white antialiased">
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
