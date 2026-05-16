'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import {
  User as FirebaseUser, onAuthStateChanged, signOut,
  signInWithPopup, GoogleAuthProvider
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User } from '@/types'
import React from 'react'

const googleProvider = new GoogleAuthProvider()

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  logout: () => Promise<void>
  getToken: () => Promise<string | null>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  logout: async () => {},
  getToken: async () => null,
  signInWithGoogle: async () => {},
})

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'sukruth321@gmail.com'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        const token = await fbUser.getIdToken()
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`

        const userDocRef = doc(db, 'users', fbUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (!userDoc.exists()) {
          // First-time Google sign-in: create Firestore user doc
          const isAdmin = fbUser.email === ADMIN_EMAIL
          const newUser: any = {
            uid: fbUser.uid,
            name: fbUser.displayName || '',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || '',
            phone: '',
            role: isAdmin ? 'admin' : 'user',
            profileComplete: false,
            createdAt: serverTimestamp(),
          }
          await setDoc(userDocRef, newUser)
          setUser({ ...newUser, createdAt: new Date().toISOString() } as User)
        } else {
          const data = userDoc.data()
          // Auto-upgrade to admin if email matches
          if (fbUser.email === ADMIN_EMAIL && data.role !== 'admin') {
            await setDoc(userDocRef, { role: 'admin' }, { merge: true })
          }
          setUser({ uid: fbUser.uid, ...data } as User)
        }
      } else {
        setUser(null)
        document.cookie = 'firebase-token=; path=/; max-age=0'
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setFirebaseUser(null)
    document.cookie = 'firebase-token=; path=/; max-age=0'
  }

  const getToken = async (): Promise<string | null> => {
    if (!firebaseUser) return null
    return firebaseUser.getIdToken()
  }

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const token = await result.user.getIdToken()
    document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`
  }

  return React.createElement(
    AuthContext.Provider,
    { value: { user, firebaseUser, loading, logout, getToken, signInWithGoogle } },
    children
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
