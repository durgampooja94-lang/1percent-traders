'use client'
import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useAuth } from '@/hooks/useAuth'
import { User, Camera, Save } from 'lucide-react'

export default function ProfilePage() {
  const { user, firebaseUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '')

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !firebaseUser) return
    setUploading(true)
    try {
      const storageRef = ref(storage, `avatars/${firebaseUser.uid}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setPhotoURL(url)
      await setDoc(doc(db, 'users', firebaseUser.uid), { photoURL: url }, { merge: true })
    } catch (e) { console.error(e) }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!firebaseUser) return
    setSaving(true)
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: name.trim(),
        phone: phone.trim(),
        profileComplete: true,
      }, { merge: true })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account details</p>
      </div>

      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative">
            {photoURL ? (
              <img src={photoURL} alt="" className="w-20 h-20 rounded-2xl object-cover" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-500 rounded-xl flex items-center justify-center cursor-pointer hover:bg-brand-600 transition-colors shadow-lg">
              <Camera className="w-4 h-4 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          <div>
            <p className="text-white font-semibold">{name || 'Your Name'}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            {uploading && <p className="text-brand-400 text-xs mt-1">Uploading…</p>}
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone Number</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              value={user?.email || ''}
              disabled
              className="w-full bg-dark-700/50 border border-dark-500 rounded-xl px-4 py-3 text-gray-500 text-sm cursor-not-allowed"
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-brand-gradient text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
