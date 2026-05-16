'use client'
// hooks/useCart.ts
import { useState, useEffect, createContext, useContext } from 'react'
import React from 'react'
import { Course, CartItem } from '@/types'

interface CartContextType {
  items: CartItem[]
  addToCart: (course: Course) => void
  removeFromCart: (courseId: string) => void
  clearCart: () => void
  isInCart: (courseId: string) => boolean
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType>({
  items: [],
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  isInCart: () => false,
  total: 0,
  itemCount: 0,
})

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('1pt_cart')
    if (stored) {
      try { setItems(JSON.parse(stored)) } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('1pt_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (course: Course) => {
    setItems(prev => {
      if (prev.find(i => i.course.id === course.id)) return prev
      return [...prev, { course, quantity: 1 }]
    })
  }

  const removeFromCart = (courseId: string) => {
    setItems(prev => prev.filter(i => i.course.id !== courseId))
  }

  const clearCart = () => setItems([])

  const isInCart = (courseId: string) => items.some(i => i.course.id === courseId)

  const total = items.reduce((sum, item) => sum + item.course.price, 0)
  const itemCount = items.length

  return React.createElement(
    CartContext.Provider,
    { value: { items, addToCart, removeFromCart, clearCart, isInCart, total, itemCount } },
    children
  )
}

export function useCart() {
  return useContext(CartContext)
}
