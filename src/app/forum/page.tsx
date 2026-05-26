'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUpload } from '@/components/image-upload'
import { AuthButton } from '@/components/auth/auth-button'
import { MessageSquare, Plus, Search, Clock, MessageCircle, ThumbsUp, Pin, Lock, Home, UserPlus } from 'lucide-react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  _count: { threads: number }
}

interface ThreadAuthor {
  id: string
  name: string | null
  avatar: string | null
  role: string
}

interface ThreadCategory {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface Thread {
  id: string
  title: string
  content: string
  isPinned: boolean
  isLocked: boolean
  createdAt: string
  viewCount: number
  author: ThreadAuthor
  category: ThreadCategory
  _count: { comments: number; votes: number }
}

export default function ForumPage() {
  const { user, status } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const currentUser = user
  const isBanned = currentUser?.isBanned || false
  const isAuthorized = currentUser && !isBanned

  // Form state
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    categoryId: '',
    image: null as string | null
  })

  useEffect(() => {
    fetchCategories()
    fetchThreads()
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories')
      const data = await res.json()
      setCategories(data.data || [])
    } catch (error) {
    }
  }

  const fetchThreads = async () => {
    setIsLoading(true)
    try {
      const url = selectedCategory
        ? `/api/threads?categoryId=${selectedCategory}`
        : '/api/threads'
      const res = await fetch(url)
      const data = await res.json()
      setThreads(data.data || [])
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateThread = async () => {
    if (!newThread.title || !newThread.content || !newThread.categoryId) {
      alert('Mohon lengkapi semua field')
      return
    }

    setIsCreating(true)
    try {
      const res = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newThread.title,
          content: newThread.content,
          categoryId: newThread.categoryId,
          image: newThread.image
        })
      })

      if (res.ok) {
        setNewThread({ title: '', content: '', categoryId: '', image: null })
        setIsCreating(false)
        setIsDialogOpen(false)
        fetchThreads()
      } else {
        const data = await res.json()
        setIsCreating(false)
        alert(data.error || 'Gagal membuat thread')
      }
    } catch (error) {
      setIsCreating(false)
      alert('Terjadi kesalahan saat membuat thread')
    }
  }

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    thread.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Baru saja'
    if (diffInMinutes < 60) return `${diffInMinutes} menit lalu`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} jam lalu`
    if (diffInMinutes < 43200) return `${Math.floor(diffInMinutes / 1440)} hari lalu`
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-950/95 backdrop-blur-sm border-b border-blue-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Side - Logo & Home */}
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <img src="/icon-192x192.png" alt="LPK Kurnia Logo" className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-bold text-white">Forum KurniaTech</span>
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-800 hover:bg-blue-600 text-white border-blue-800"
                onClick={() => { window.location.href = '/' }}
              >
                <Home className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Beranda</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-800 hover:bg-blue-600 text-white border-blue-800"
                onClick={() => { window.location.href = '/#registration' }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Daftar LPK</span>
              </Button>
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-20 pb-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Categories */}
            <aside className="lg:w-64 flex-shrink-0">
              <Card className="bg-blue-950/50 border-blue-800 sticky top-24">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === null
                          ? 'bg-blue-600 text-white'
                          : 'text-white hover:bg-blue-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Semua Thread</span>
                        <Badge variant="outline" className="text-xs text-white border-white/30">
                          {threads.length}
                        </Badge>
                      </div>
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-blue-600 text-white'
                            : 'text-white hover:bg-blue-900/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {category.icon} {category.name}
                          </span>
                          <Badge variant="outline" className="text-xs text-white border-white/30">
                            {category._count.threads}
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
              {/* Search & Actions */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
                  <Input
                    placeholder="Cari thread..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-blue-950/50 border-blue-800 text-white placeholder:text-blue-400"
                  />
                </div>
                {isAuthorized && (
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-800 hover:bg-blue-600 text-white whitespace-nowrap">
                        <Plus className="w-4 h-4 mr-2" />
                        Buat Thread
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-blue-950 border-blue-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Buat Thread Baru</DialogTitle>
                        <DialogDescription className="text-white">
                          Isi form di bawah untuk membuat thread baru di forum
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-white">Kategori</Label>
                          <Select
                            value={newThread.categoryId}
                            onValueChange={(value) => setNewThread({ ...newThread, categoryId: value })}
                          >
                            <SelectTrigger className="bg-blue-900/50 border-blue-700 !text-white">
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent className="!bg-blue-950 border-blue-800 !text-white">
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id} className="!text-white focus:!bg-blue-800 focus:!text-white">
                                  {category.icon} {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-white">Judul</Label>
                          <Input
                            id="title"
                            type="text"
                            value={newThread.title}
                            onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                            className="bg-blue-900/50 border-blue-700 text-white"
                            placeholder="Masukkan judul thread"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="content" className="text-white">Konten</Label>
                          <Textarea
                            id="content"
                            value={newThread.content}
                            onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                            className="bg-blue-900/50 border-blue-700 text-white min-h-[150px]"
                            placeholder="Tulis konten thread Anda..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white">Gambar (Opsional)</Label>
                          <ImageUpload
                            value={newThread.image}
                            onChange={(image) => setNewThread({ ...newThread, image })}
                            maxSizeMB={10}
                            maxCompressedKB={300}
                          />
                        </div>
                        <div className="pt-4">
                          <Button
                            onClick={handleCreateThread}
                            disabled={isCreating}
                            className="w-full bg-blue-800 hover:bg-blue-600 text-white"
                          >
                            {isCreating ? 'Membuat...' : 'Buat Thread'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Threads List */}
              {isLoading ? (
                <div className="text-center py-12 text-white">
                  Memuat threads...
                </div>
              ) : filteredThreads.length === 0 ? (
                <Card className="bg-blue-950/50 border-blue-800">
                  <CardContent className="py-12 text-center">
                    <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <p className="text-white">
                      {searchQuery ? 'Tidak ada thread yang ditemukan' : 'Belum ada thread'}
                    </p>
                    {!currentUser && (
                      <p className="text-white text-sm mt-2">
                        Login untuk membuat thread pertama
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredThreads.map((thread) => (
                    <Link key={thread.id} href={`/forum/${thread.id}`}>
                      <Card className="bg-blue-950/50 border-blue-800 hover:border-blue-600 transition-all cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar
                              name={thread.author.name || 'U'}
                              avatar={thread.author.avatar}
                              role={thread.author.role}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h3 className="text-white font-semibold hover:text-blue-100 transition-colors line-clamp-1">
                                  {thread.title}
                                </h3>
                                {thread.isPinned && (
                                  <Pin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                                )}
                                {thread.isLocked && (
                                  <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
                                )}
                              </div>
                              <p className="text-white text-sm line-clamp-2 mb-2">
                                {thread.content}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-white flex-wrap">
                                <span className="flex items-center gap-1">
                                  {thread.category.icon} {thread.category.name}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {formatDate(thread.createdAt)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {thread._count.comments}
                                </span>
                                <span className="flex items-center gap-1">
                                  <ThumbsUp className="w-3 h-3" />
                                  {thread._count.votes}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}

function Avatar({ name, avatar, role }: { name: string; avatar: string | null; role: string }) {
  return (
    <div className="flex-shrink-0">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
        role === 'SUPER_ADMIN' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-blue-800'
      }`}>
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
        ) : (
          name[0]
        )}
      </div>
    </div>
  )
}
