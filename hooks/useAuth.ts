'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import {
  User as FirebaseUser, onAuthStateChanged, onIdTokenChanged, signOut,
  signInWithPopup, GoogleAuthProvider
} from 'firebase/auth'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { getDeviceId, establishSession } from '@/lib/device'
import { useIdleTimeout } from './useIdleTimeout'
import { User } from '@/types'
import React from 'react'

const googleProvider = new GoogleAuthProvider()

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  authError: string | null
  clearAuthError: () => void
  logout: () => Promise<void>
  getToken: () => Promise<string | null>
  signInWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  authError: null,
  clearAuthError: () => {},
  logout: async () => {},
  getToken: async () => null,
  signInWithGoogle: async () => {},
})

const ADMIN_EMAILS = new Set([
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'sukruth321@gmail.com',
  'durgampooja94@gmail.com',
])
const isAdminEmail = (email: string | null) => !!email && ADMIN_EMAILS.has(email)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      try {
        if (fbUser) {
          const token = await fbUser.getIdToken()
          document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`

          const userDocRef = doc(db, 'users', fbUser.uid)
          const userDoc = await getDoc(userDocRef)

          if (!userDoc.exists()) {
            const isAdmin = isAdminEmail(fbUser.email)
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
            const shouldBeAdmin = isAdminEmail(fbUser.email)
            if (shouldBeAdmin && data.role !== 'admin') {
              await setDoc(userDocRef, { role: 'admin' }, { merge: true })
            }
            setUser({ uid: fbUser.uid, ...data, role: shouldBeAdmin ? 'admin' : data.role } as User)
          }
        } else {
          setUser(null)
          document.cookie = 'firebase-token=; path=/; max-age=0'
        }
      } catch (e) {
        console.error('Auth state error:', e)
        if (fbUser) {
          const isAdmin = isAdminEmail(fbUser.email)
          setUser({ uid: fbUser.uid, name: fbUser.displayName || '', email: fbUser.email || '', photoURL: fbUser.photoURL || '', role: isAdmin ? 'admin' : 'user' } as User)
        }
      } finally {
        setLoading(false)
      }
    })
    return unsubscribe
  }, [])

  // Keep the middleware-facing cookie in sync with Firebase's own (auto-refreshing)
  // ID token, so the cookie never goes stale independently of the real session.
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (fbUser) => {
      if (fbUser) {
        const token = await fbUser.getIdToken()
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`
      }
    })
    return unsubscribe
  }, [])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setFirebaseUser(null)
    document.cookie = 'firebase-token=; path=/; max-age=0'
  }

  // Single active device enforcement: if another device establishes a new
  // session for this account, this device's local deviceId will stop
  // matching Firestore's activeDeviceId — force sign-out immediately.
  useEffect(() => {
    if (!firebaseUser) return
    const unsubscribe = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
      const data = snap.data()
      if (data?.activeDeviceId && data.activeDeviceId !== getDeviceId()) {
        setAuthError('You have been signed out because your account was used on another device.')
        logout()
      }
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseUser?.uid])

  useIdleTimeout(() => {
    setAuthError('You have been signed out due to inactivity.')
    logout()
  }, !!user)

  const getToken = async (): Promise<string | null> => {
    if (!firebaseUser) return null
    return firebaseUser.getIdToken()
  }

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider)
    const token = await result.user.getIdToken()
    document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Strict`
    await establishSession(token)
  }

  const clearAuthError = () => setAuthError(null)

  return React.createElement(
    AuthContext.Provider,
    { value: { user, firebaseUser, loading, authError, clearAuthError, logout, getToken, signInWithGoogle } },
    children
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
