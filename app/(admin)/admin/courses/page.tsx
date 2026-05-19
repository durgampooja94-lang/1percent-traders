'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Course } from '@/types'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Video,
  ChevronDown, ChevronRight, GripVertical, Save, X, BookOpen, ImagePlus, Check
} from 'lucide-react'
import Button from '@/components/ui/Button'
import { Modal } from '@/components/ui/index'
import { clsx } from 'clsx'

interface CourseFormData {
  title: string; shortDescription: string; description: string
  price: string; originalPrice: string; level: string; language: string; thumbnailUrl: string
  instructor: string; about: string; tags: string
  whatYoullLearn: string; requirements: string
}
interface VideoForm {
  title: string; bunnyVideoId: string; duration: string; isFreePreview: boolean
}

const emptyForm: CourseFormData = {
  title: '', shortDescription: '', description: '',
  price: '', originalPrice: '', level: 'Beginner', language: 'Hindi & English', thumbnailUrl: '',
  instructor: '', about: '', tags: '', whatYoullLearn: '', requirements: '',
}
const emptyVideoForm: VideoForm = { title: '', bunnyVideoId: '', duration: '', isFreePreview: false }

export default function AdminCoursesPage() {
  const { getToken, firebaseUser } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editCourse, setEditCourse] = useState<Course | null>(null)
  const [form, setForm] = useState<CourseFormData>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  const [playlists, setPlaylists] = useState<Record<string, any[]>>({})
  const [newPlaylistTitle, setNewPlaylistTitle] = useState('')
  const [addingPlaylist, setAddingPlaylist] = useState<string | null>(null)
  const [editingPlaylist, setEditingPlaylist] = useState<{ courseId: string; playlistId: string; title: string } | null>(null)
  const [newVideoForm, setNewVideoForm] = useState<Record<string, VideoForm>>({})
  const [editingVideo, setEditingVideo] = useState<{ courseId: string; playlistId: string; videoId: string; form: VideoForm } | null>(null)

  async function fetchCourses() {
    try {
      const token = await getToken()
      const res = await fetch('/api/admin/courses', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      setCourses(data.courses || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { if (firebaseUser) fetchCourses() }, [firebaseUser])

  const openCreate = () => { setEditCourse(null); setForm(emptyForm); setModalOpen(true) }
  const openEdit = (c: Course) => {
    setEditCourse(c)
    setForm({
      title: c.title,
      shortDescription: c.shortDescription,
      description: c.description,
      price: String(c.price),
      originalPrice: String(c.originalPrice || ''),
      level: c.level,
      language: c.language,
      thumbnailUrl: c.thumbnailUrl || '',
      instructor: (c as any).instructor || '',
      about: (c as any).about || '',
      tags: ((c as any).tags || []).join(', '),
      whatYoullLearn: ((c as any).whatYoullLearn || []).join('\n'),
      requirements: ((c as any).requirements || []).join('\n'),
    })
    setModalOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const storageRef = ref(storage, `thumbnails/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setForm(p => ({ ...p, thumbnailUrl: url }))
    } catch (e) { console.error(e) } finally { setUploading(false) }
  }

  const handleSave = async () => {
    setSaving(true); setSaveError('')
    try {
      const token = await getToken()
      if (!token) { setSaveError('Not authenticated. Please refresh.'); return }
      const res = await fetch('/api/admin/courses', {
        method: editCourse ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
          thumbnailUrl: form.thumbnailUrl || '',
          tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
          whatYoullLearn: form.whatYoullLearn.split('\n').map(t => t.trim()).filter(Boolean),
          requirements: form.requirements.split('\n').map(t => t.trim()).filter(Boolean),
          ...(editCourse ? { id: editCourse.id } : {})
        }),
      })
      const data = await res.json()
      if (!res.ok) { setSaveError(`Error ${res.status}: ${data.error || 'Failed to save'}`); return }
      setModalOpen(false); fetchCourses()
    } catch (e: any) { setSaveError(e.message || 'Unexpected error') } finally { setSaving(false) }
  }

  const togglePublish = async (course: Course) => {
    const token = await getToken()
    await fetch('/api/admin/courses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ id: course.id, published: !course.published })
    })
    fetchCourses()
  }

  const deleteCourse = async (id: string) => {
    if (!confirm('Delete this course? This cannot be undone.')) return
    const token = await getToken()
    await fetch(`/api/admin/courses?id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    fetchCourses()
  }

  const loadPlaylists = async (courseId: string) => {
    const token = await getToken()
    const res = await fetch(`/api/admin/courses/${courseId}/playlists`, { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) { const data = await res.json(); setPlaylists(prev => ({ ...prev, [courseId]: data.playlists || [] })) }
  }

  const toggleExpand = (courseId: string) => {
    if (expandedCourse === courseId) { setExpandedCourse(null) } else { setExpandedCourse(courseId); loadPlaylists(courseId) }
  }

  const addPlaylist = async (courseId: string) => {
    if (!newPlaylistTitle.trim()) return
    const token = await getToken()
    await fetch(`/api/admin/courses/${courseId}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: newPlaylistTitle, order: playlists[courseId]?.length || 0 })
    })
    setNewPlaylistTitle(''); setAddingPlaylist(null); loadPlaylists(courseId)
  }

  const saveEditPlaylist = async () => {
    if (!editingPlaylist || !editingPlaylist.title.trim()) return
    const token = await getToken()
    await fetch(`/api/admin/courses/${editingPlaylist.courseId}/playlists/${editingPlaylist.playlistId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: editingPlaylist.title })
    })
    const cId = editingPlaylist.courseId; setEditingPlaylist(null); loadPlaylists(cId)
  }

  const deletePlaylist = async (courseId: string, playlistId: string) => {
    if (!confirm('Delete this playlist and all its videos?')) return
    const token = await getToken()
    await fetch(`/api/admin/courses/${courseId}/playlists/${playlistId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    loadPlaylists(courseId)
  }

  const addVideo = async (courseId: string, playlistId: string) => {
    const key = `${courseId}_${playlistId}`; const vf = newVideoForm[key]
    if (!vf?.title || !vf?.bunnyVideoId) return
    const token = await getToken()
    const currentCount = playlists[courseId]?.find(p => p.id === playlistId)?.videos?.length || 0
    await fetch(`/api/admin/courses/${courseId}/playlists/${playlistId}/videos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: vf.title, bunnyVideoId: vf.bunnyVideoId, duration: Number(vf.duration) || 0, isFreePreview: vf.isFreePreview || false, order: currentCount })
    })
    setNewVideoForm(prev => ({ ...prev, [key]: emptyVideoForm })); loadPlaylists(courseId)
  }

  const saveEditVideo = async () => {
    if (!editingVideo) return
    const { courseId, playlistId, videoId, form: vf } = editingVideo
    const token = await getToken()
    await fetch(`/api/admin/courses/${courseId}/playlists/${playlistId}/videos?videoId=${videoId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title: vf.title, bunnyVideoId: vf.bunnyVideoId, duration: Number(vf.duration) || 0, isFreePreview: vf.isFreePreview })
    })
    setEditingVideo(null); loadPlaylists(courseId)
  }

  const deleteVideo = async (courseId: string, playlistId: string, videoId: string) => {
    if (!confirm('Delete this video?')) return
    const token = await getToken()
    await fetch(`/api/admin/courses/${courseId}/playlists/${playlistId}/videos?videoId=${videoId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    loadPlaylists(courseId)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">Courses</h1>
          <p className="text-gray-400 text-sm">{courses.length} course{courses.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button variant="primary" onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> New Course</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" /></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-dark-800 border border-dark-500 rounded-2xl">
          <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400 font-medium">No courses yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map(course => (
            <div key={course.id} className="bg-dark-800 border border-dark-500 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <button onClick={() => toggleExpand(course.id)} className="text-gray-500 hover:text-white transition-colors flex-shrink-0">
                  {expandedCourse === course.id ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
                <div className="w-16 h-10 bg-dark-600 rounded-lg overflow-hidden flex-shrink-0">
                  {course.thumbnailUrl
                    ? <img src={course.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full bg-brand-500/10 flex items-center justify-center"><Video className="w-4 h-4 text-brand-500/50" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">{course.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-gray-500 text-xs">₹{course.price?.toLocaleString()}</span>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className="text-gray-500 text-xs">{course.totalVideos} videos</span>
                    <span className="text-gray-600 text-xs">·</span>
                    <span className="text-gray-500 text-xs">{course.level}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={clsx('text-xs font-semibold px-2.5 py-1 rounded-full', course.published ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400')}>
                    {course.published ? 'Live' : 'Draft'}
                  </span>
                  <button onClick={() => togglePublish(course)} className="p-2 text-gray-400 hover:text-white hover:bg-dark-600 rounded-lg transition-all">
                    {course.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(course)} className="p-2 text-gray-400 hover:text-brand-400 hover:bg-dark-600 rounded-lg transition-all"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteCourse(course.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-dark-600 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

              {expandedCourse === course.id && (
                <div className="border-t border-dark-600 bg-dark-900/40 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-sm">Playlists & Videos</h3>
                    <button onClick={() => setAddingPlaylist(course.id)} className="text-brand-400 hover:text-brand-300 text-xs font-medium flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Playlist
                    </button>
                  </div>

                  {addingPlaylist === course.id && (
                    <div className="flex gap-2">
                      <input value={newPlaylistTitle} onChange={e => setNewPlaylistTitle(e.target.value)} placeholder="Playlist title e.g. Module 1: Basics"
                        className="flex-1 bg-dark-700 border border-dark-400 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-brand-500" />
                      <button onClick={() => addPlaylist(course.id)} className="bg-brand-500 text-white px-4 py-2 rounded-xl text-sm hover:bg-brand-600"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setAddingPlaylist(null)} className="text-gray-400 hover:text-white px-3 py-2 rounded-xl hover:bg-dark-700"><X className="w-4 h-4" /></button>
                    </div>
                  )}

                  {(playlists[course.id] || []).length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No playlists yet. Add one above.</p>
                  ) : (
                    <div className="space-y-3">
                      {(playlists[course.id] || []).map((playlist: any) => {
                        const vKey = `${course.id}_${playlist.id}`
                        const vf = newVideoForm[vKey] || emptyVideoForm
                        const isEditingPl = editingPlaylist?.playlistId === playlist.id

                        return (
                          <div key={playlist.id} className="bg-dark-800 border border-dark-600 rounded-xl overflow-hidden">
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-700">
                              <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />
                              {isEditingPl ? (
                                <>
                                  <input
                                    value={editingPlaylist?.title ?? ''}
                                    onChange={e => setEditingPlaylist(p => p ? { ...p, title: e.target.value } : p)}
                                    autoFocus
                                    className="flex-1 bg-dark-700 border border-brand-500 rounded-lg px-2 py-1 text-white text-sm focus:outline-none"
                                  />
                                  <button onClick={saveEditPlaylist} className="text-green-400 hover:text-green-300 p-1"><Check className="w-4 h-4" /></button>
                                  <button onClick={() => setEditingPlaylist(null)} className="text-gray-500 hover:text-white p-1"><X className="w-4 h-4" /></button>
                                </>
                              ) : (
                                <>
                                  <span className="text-white font-medium text-sm flex-1">{playlist.title}</span>
                                  <span className="text-gray-500 text-xs mr-2">{playlist.videos?.length || 0} videos</span>
                                  <button onClick={() => setEditingPlaylist({ courseId: course.id, playlistId: playlist.id, title: playlist.title })} className="text-gray-500 hover:text-brand-400 p-1 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                  <button onClick={() => deletePlaylist(course.id, playlist.id)} className="text-gray-500 hover:text-red-400 p-1 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                </>
                              )}
                            </div>

                            <div className="divide-y divide-dark-700">
                              {(playlist.videos || []).map((video: any) => {
                                const isEditingV = editingVideo?.videoId === video.id
                                return (
                                  <div key={video.id}>
                                    {isEditingV ? (
                                      <div className="px-4 py-3 bg-dark-900/60 space-y-2">
                                        <div className="grid grid-cols-2 gap-2">
                                          <input
                                            value={editingVideo?.form.title ?? ''}
                                            onChange={e => setEditingVideo(p => p ? { ...p, form: { ...p.form, title: e.target.value } } : p)}
                                            placeholder="Video title"
                                            className="bg-dark-700 border border-brand-500 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                                          />
                                          <input
                                            value={editingVideo?.form.bunnyVideoId ?? ''}
                                            onChange={e => setEditingVideo(p => p ? { ...p, form: { ...p.form, bunnyVideoId: e.target.value } } : p)}
                                            placeholder="Bunny Video ID"
                                            className="bg-dark-700 border border-brand-500 rounded-lg px-3 py-2 text-white text-xs font-mono focus:outline-none"
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <input
                                            type="number"
                                            value={editingVideo?.form.duration ?? ''}
                                            onChange={e => setEditingVideo(p => p ? { ...p, form: { ...p.form, duration: e.target.value } } : p)}
                                            placeholder="Duration (min)"
                                            className="w-40 bg-dark-700 border border-brand-500 rounded-lg px-3 py-2 text-white text-xs focus:outline-none"
                                          />
                                          <label className="flex items-center gap-1.5 text-gray-400 text-xs cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={editingVideo?.form.isFreePreview ?? false}
                                              onChange={e => setEditingVideo(p => p ? { ...p, form: { ...p.form, isFreePreview: e.target.checked } } : p)}
                                              className="accent-brand-500"
                                            />
                                            Free preview
                                          </label>
                                          <div className="ml-auto flex gap-2">
                                            <button onClick={saveEditVideo} className="bg-brand-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-brand-600 flex items-center gap-1"><Check className="w-3 h-3" /> Save</button>
                                            <button onClick={() => setEditingVideo(null)} className="text-gray-400 hover:text-white text-xs px-3 py-1.5 rounded-lg hover:bg-dark-700">Cancel</button>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-3 px-4 py-2.5">
                                        <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                        <Video className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                        <span className="text-gray-300 text-sm flex-1 truncate">{video.title}</span>
                                        {video.isFreePreview && <span className="text-brand-400 text-xs font-medium px-2 py-0.5 bg-brand-500/10 rounded-full">Preview</span>}
                                        <span className="text-gray-500 text-xs">{video.duration || 0} min</span>
                                        <button onClick={() => setEditingVideo({ courseId: course.id, playlistId: playlist.id, videoId: video.id, form: { title: video.title, bunnyVideoId: video.bunnyVideoId || '', duration: String(video.duration || 0), isFreePreview: video.isFreePreview || false } })} className="text-gray-600 hover:text-brand-400 p-1 transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => deleteVideo(course.id, playlist.id, video.id)} className="text-gray-600 hover:text-red-400 p-1 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>

                            <div className="px-4 py-3 bg-dark-900/50 border-t border-dark-700">
                              <p className="text-gray-500 text-xs font-medium mb-2">Add video</p>
                              <div className="grid grid-cols-2 gap-2 mb-2">
                                <input value={vf.title} onChange={e => setNewVideoForm(p => ({ ...p, [vKey]: { ...(p[vKey] || emptyVideoForm), title: e.target.value } }))} placeholder="Video title"
                                  className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-brand-500" />
                                <input value={vf.bunnyVideoId} onChange={e => setNewVideoForm(p => ({ ...p, [vKey]: { ...(p[vKey] || emptyVideoForm), bunnyVideoId: e.target.value } }))} placeholder="Bunny.net Video ID"
                                  className="bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-brand-500 font-mono" />
                              </div>
                              <div className="flex items-center gap-2">
                                <input type="number" value={vf.duration} onChange={e => setNewVideoForm(p => ({ ...p, [vKey]: { ...(p[vKey] || emptyVideoForm), duration: e.target.value } }))} placeholder="Duration (min)"
                                  className="w-40 bg-dark-700 border border-dark-500 rounded-lg px-3 py-2 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-brand-500" />
                                <label className="flex items-center gap-1.5 text-gray-400 text-xs cursor-pointer">
                                  <input type="checkbox" checked={vf.isFreePreview} onChange={e => setNewVideoForm(p => ({ ...p, [vKey]: { ...(p[vKey] || emptyVideoForm), isFreePreview: e.target.checked } }))} className="accent-brand-500" />
                                  Free preview
                                </label>
                                <button onClick={() => addVideo(course.id, playlist.id)} className="ml-auto bg-brand-500 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-brand-600 transition-colors flex items-center gap-1.5">
                                  <Plus className="w-3.5 h-3.5" /> Add Video
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCourse ? 'Edit Course' : 'Create New Course'}>
        <div className="space-y-4">
          {[
            { label: 'Course Title', key: 'title', placeholder: 'e.g. Options Trading — Zero to Hero' },
            { label: 'Short Description', key: 'shortDescription', placeholder: 'One-line summary (shown on cards)' }
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
              <input value={form[key as keyof CourseFormData]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Detailed course description..."
              className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Price (₹)', key: 'price', placeholder: '4999' }, { label: 'Original Price (₹)', key: 'originalPrice', placeholder: '9999' }].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
                <input type="number" value={form[key as keyof CourseFormData]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder}
                  className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Level</label>
              <select value={form.level} onChange={e => setForm(p => ({ ...p, level: e.target.value }))} className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-500">
                {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Language</label>
              <input value={form.language} onChange={e => setForm(p => ({ ...p, language: e.target.value }))} placeholder="Hindi & English"
                className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Course Thumbnail</label>
            <div className="space-y-2">
              <input value={form.thumbnailUrl} onChange={e => setForm(p => ({ ...p, thumbnailUrl: e.target.value }))} placeholder="Paste image URL or upload below"
                className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500" />
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" id="thumbnail-upload" className="hidden" onChange={handleImageUpload} />
                <label htmlFor="thumbnail-upload" className="flex items-center gap-2 cursor-pointer bg-dark-600 border border-dark-400 hover:border-brand-500/50 text-gray-300 hover:text-white text-sm px-4 py-2 rounded-xl transition-all">
                  <ImagePlus className="w-4 h-4" />{uploading ? 'Uploading…' : 'Upload Image'}
                </label>
                {form.thumbnailUrl && <img src={form.thumbnailUrl} alt="preview" className="w-20 h-12 object-cover rounded-lg border border-dark-400" />}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Instructor Name</label>
            <input value={form.instructor} onChange={e => setForm(p => ({ ...p, instructor: e.target.value }))} placeholder="e.g. Pooja Sharma"
              className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="SMC, ICT, Options, Risk Management"
              className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">What You'll Learn (one per line)</label>
            <textarea value={form.whatYoullLearn} onChange={e => setForm(p => ({ ...p, whatYoullLearn: e.target.value }))} rows={4}
              placeholder={"Understand SMC concepts\nMaster ICT strategies\nManage risk effectively"}
              className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Requirements (one per line)</label>
            <textarea value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} rows={3}
              placeholder={"Basic knowledge of stock markets\nA trading account"}
              className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 resize-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">About This Course</label>
            <textarea value={form.about} onChange={e => setForm(p => ({ ...p, about: e.target.value }))} rows={4}
              placeholder="Detailed course description shown on the course page…"
              className="w-full bg-dark-700 border border-dark-400 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-brand-500 resize-none" />
          </div>
          {saveError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{saveError}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="primary" onClick={handleSave} loading={saving} className="flex-1">{editCourse ? 'Save Changes' : 'Create Course'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}