'use client'

import { useEffect, useState, use } from 'react'
import { useAuth } from '@/components/providers/session-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/image-upload'
import { AuthButton } from '@/components/auth/auth-button'
import { MessageSquare, ArrowLeft, Send, Reply, Edit, Trash2, Pin, Lock, Clock, Eye, ThumbsUp, MessageCircle, Home, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Author {
  id: string
  name: string | null
  avatar: string | null
  role: string
}

interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface Thread {
  id: string
  title: string
  content: string
  image: string | null
  isPinned: boolean
  isLocked: boolean
  viewCount: number
  createdAt: string
  updatedAt: string
  author: Author
  category: Category
  _count: { comments: number; votes: number }
}

interface Comment {
  id: string
  content: string
  image: string | null
  createdAt: string
  updatedAt: string
  parentId: string | null
  author: Author
  replies: Comment[]
  _count: { votes: number }
}

export default function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, status: authStatus } = useAuth()
  const router = useRouter()

  // Unwrap params Promise (Next.js 16 requirement)
  const { id } = use(params)

  const currentUser = user
  const isAdmin = currentUser?.role === 'SUPER_ADMIN'
  const isBanned = currentUser?.isBanned || false
  const [thread, setThread] = useState<Thread | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [replyImage, setReplyImage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetchThread()
    fetchComments()
  }, [id])

  const fetchThread = async () => {
    try {
      const res = await fetch(`/api/threads/${id}`)
      const data = await res.json()
      if (data.data) {
        setThread(data.data)
      } else {
        router.push('/forum')
      }
    } catch (error) {
      router.push('/forum')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/threads/${id}/comments`)
      const data = await res.json()
      setComments(data.data || [])
    } catch (error) {
    }
  }

  const handleSubmitReply = async () => {
    if (!replyContent.trim() && !replyImage) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/threads/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          image: replyImage,
          parentId: replyTo
        })
      })

      if (res.ok) {
        setReplyContent('')
        setReplyImage(null)
        setReplyTo(null)
        fetchComments()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal mengirim komentar')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengirim komentar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent })
      })

      if (res.ok) {
        setEditingComment(null)
        setEditContent('')
        fetchComments()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal mengedit komentar')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat mengedit komentar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus komentar ini?')) return

    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchComments()
      } else {
        const data = await res.json()
        alert(data.error || 'Gagal menghapus komentar')
      }
    } catch (error) {
      alert('Terjadi kesalahan saat menghapus komentar')
    }
  }

  const handleTogglePin = async () => {
    try {
      const res = await fetch(`/api/admin/threads/${id}/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: !thread?.isPinned })
      })

      if (res.ok) {
        fetchThread()
      } else {
        alert('Gagal mengupdate pin status')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const handleToggleLock = async () => {
    try {
      const res = await fetch(`/api/admin/threads/${id}/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLocked: !thread?.isLocked })
      })

      if (res.ok) {
        fetchThread()
      } else {
        alert('Gagal mengupdate lock status')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    }
  }

  const handleDeleteThread = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus thread ini? Tindakan ini tidak dapat dibatalkan.')) return

    try {
      const res = await fetch(`/api/admin/threads/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        alert('Thread berhasil dihapus')
        router.push('/forum')
      } else {
        try {
          const data = await res.json()
          alert(data.error || 'Gagal menghapus thread')
        } catch {
          alert(`Gagal menghapus thread: ${res.status} ${res.statusText}`)
        }
      }
    } catch (error) {
      alert('Terjadi kesalahan saat menghapus thread')
    }
  }

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white">Memuat thread...</div>
        </div>
      </div>
    )
  }

  if (!thread) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-blue-950/95 backdrop-blur-sm border-b border-blue-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Left Side - Back, Logo & Home */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/forum" className="text-white hover:text-blue-100 transition-colors flex-shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Link>
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
        <div className="container mx-auto max-w-4xl">
          {/* Thread Content */}
          <Card className="bg-blue-950/50 border-blue-800 mb-6">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-blue-800">
                  {thread.category.icon} {thread.category.name}
                </Badge>
                {thread.isPinned && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                    <Pin className="w-3 h-3 mr-1" /> Dipin
                  </Badge>
                )}
                {thread.isLocked && (
                  <Badge variant="outline" className="border-red-500 text-red-400">
                    <Lock className="w-3 h-3 mr-1" /> Dikunci
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {thread.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-white flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                    thread.author.role === 'SUPER_ADMIN' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-blue-800'
                  }`}>
                    {thread.author.avatar ? (
                      <img src={thread.author.avatar} alt={thread.author.name || 'U'} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      thread.author.name?.[0] || 'U'
                    )}
                  </div>
                  <span className="text-white font-medium">{thread.author.name}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(thread.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {thread.viewCount} dilihat
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {thread._count.comments} komentar
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none text-white whitespace-pre-wrap">
                {thread.content}
              </div>
              {thread.image && (
                <div className="mt-4">
                  <img
                    src={thread.image}
                    alt="Gambar thread"
                    className="max-w-full max-h-[500px] rounded-lg object-contain border border-blue-800"
                  />
                </div>
              )}

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-blue-800">
                  <Button
                    variant={thread.isPinned ? "default" : "outline"}
                    size="sm"
                    onClick={handleTogglePin}
                    className="bg-blue-800 hover:bg-blue-600 text-white"
                  >
                    <Pin className="w-4 h-4 mr-2" />
                    {thread.isPinned ? 'Unpin' : 'Pin'}
                  </Button>
                  <Button
                    variant={thread.isLocked ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleLock}
                    className="bg-blue-800 hover:bg-blue-600 text-white"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {thread.isLocked ? 'Unlock' : 'Lock'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteThread}
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus Thread
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reply Form */}
          {currentUser && !isBanned && !thread.isLocked && (
            <Card className="bg-blue-950/50 border-blue-800 mb-6">
              <CardContent className="p-4">
                {replyTo ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm">Membalas komentar...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setReplyTo(null)
                          setReplyContent('')
                          setReplyImage(null)
                        }}
                        className="text-white hover:text-blue-100"
                      >
                        Batal
                      </Button>
                    </div>
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Tulis balasan..."
                      className="bg-blue-900/50 border-blue-700 text-white min-h-[100px]"
                    />
                    <div className="space-y-2">
                      <span className="text-white text-sm">Gambar (Opsional)</span>
                      <ImageUpload
                        value={replyImage}
                        onChange={setReplyImage}
                        maxSizeMB={10}
                        maxCompressedKB={300}
                      />
                    </div>
                    <Button
                      onClick={handleSubmitReply}
                      disabled={isSubmitting || (!replyContent.trim() && !replyImage)}
                      className="bg-blue-800 hover:bg-blue-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Balasan
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Tulis komentar..."
                      className="bg-blue-900/50 border-blue-700 text-white min-h-[100px]"
                    />
                    <div className="space-y-2">
                      <span className="text-white text-sm">Gambar (Opsional)</span>
                      <ImageUpload
                        value={replyImage}
                        onChange={setReplyImage}
                        maxSizeMB={10}
                        maxCompressedKB={300}
                      />
                    </div>
                    <Button
                      onClick={() => handleSubmitReply()}
                      disabled={isSubmitting || (!replyContent.trim() && !replyImage)}
                      className="bg-blue-800 hover:bg-blue-600 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Kirim Komentar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isBanned && (
            <Card className="bg-red-950/30 border-red-800 mb-6">
              <CardContent className="p-4 text-center text-red-300">
                Akun Anda di-suspend, tidak bisa berkomentar.
              </CardContent>
            </Card>
          )}

          {thread.isLocked && (
            <Card className="bg-yellow-950/30 border-yellow-800 mb-6">
              <CardContent className="p-4 text-center text-yellow-300">
                <Lock className="w-5 h-5 mx-auto mb-2" />
                Thread ini dikunci, tidak bisa berkomentar.
              </CardContent>
            </Card>
          )}

          {!currentUser && (
            <Card className="bg-blue-950/50 border-blue-800 mb-6">
              <CardContent className="p-4 text-center">
                <p className="text-white mb-2">Login untuk ikut berdiskusi</p>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">
              Komentar ({comments.length})
            </h2>
            {comments.length === 0 ? (
              <Card className="bg-blue-950/50 border-blue-800">
                <CardContent className="p-8 text-center text-white">
                  Belum ada komentar. Jadilah yang pertama berkomentar!
                </CardContent>
              </Card>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  currentUser={currentUser}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                  editingComment={editingComment}
                  setEditingComment={setEditingComment}
                  editContent={editContent}
                  setEditContent={setEditContent}
                  isSubmitting={isSubmitting}
                  handleEditComment={handleEditComment}
                  handleDeleteComment={handleDeleteComment}
                  formatDate={formatDate}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CommentItem({
  comment,
  currentUser,
  replyTo,
  setReplyTo,
  editingComment,
  setEditingComment,
  editContent,
  setEditContent,
  isSubmitting,
  handleEditComment,
  handleDeleteComment,
  formatDate
}: {
  comment: Comment
  currentUser: any
  replyTo: string | null
  setReplyTo: (id: string | null) => void
  editingComment: string | null
  setEditingComment: (id: string | null) => void
  editContent: string
  setEditContent: (content: string) => void
  isSubmitting: boolean
  handleEditComment: (id: string) => void
  handleDeleteComment: (id: string) => void
  formatDate: (date: string) => string
}) {
  const isAuthor = currentUser?.id === comment.author.id
  const isAdmin = currentUser?.role === 'SUPER_ADMIN'

  return (
    <Card className="bg-blue-950/50 border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${
            comment.author.role === 'SUPER_ADMIN' ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 'bg-blue-800'
          }`}>
            {comment.author.avatar ? (
              <img src={comment.author.avatar} alt={comment.author.name || 'U'} className="w-full h-full rounded-full object-cover" />
            ) : (
              comment.author.name?.[0] || 'U'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-white font-medium">{comment.author.name}</span>
              {comment.author.role === 'SUPER_ADMIN' && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-400 text-xs">
                  Admin
                </Badge>
              )}
              <span className="text-white text-xs">{formatDate(comment.createdAt)}</span>
              {(isAuthor || isAdmin) && (
                <div className="flex items-center gap-1">
                  {editingComment === comment.id ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingComment(null)
                        setEditContent('')
                      }}
                      className="text-white h-6 px-2"
                    >
                      Batal
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingComment(comment.id)
                          setEditContent(comment.content)
                        }}
                        className="text-white h-6 px-2"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-400 hover:text-red-300 h-6 px-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {editingComment === comment.id ? (
              <div className="space-y-2 mb-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-blue-900/50 border-blue-700 text-white min-h-[80px]"
                />
                <Button
                  size="sm"
                  onClick={() => handleEditComment(comment.id)}
                  disabled={isSubmitting}
                  className="bg-blue-800 hover:bg-blue-600 text-white"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </Button>
              </div>
            ) : (
              <>
                <p className="text-white whitespace-pre-wrap break-words mb-2">
                  {comment.content}
                </p>
                {comment.image && (
                  <div className="mt-3 mb-2">
                    <img
                      src={comment.image}
                      alt="Gambar komentar"
                      className="max-w-full max-h-96 rounded-lg object-contain border border-blue-800"
                    />
                  </div>
                )}
              </>
            )}

            <div className="flex items-center gap-3">
              {currentUser && !currentUser.isBanned && replyTo !== comment.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(comment.id)}
                  className="text-white hover:text-blue-100 h-8"
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Balas
                </Button>
              )}
              <span className="text-white text-xs flex items-center gap-1">
                <ThumbsUp className="w-3 h-3" />
                {comment._count.votes}
              </span>
            </div>

            {/* Replies */}
            {comment.replies.length > 0 && (
              <div className="mt-4 space-y-3 pl-4 border-l-2 border-blue-800">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUser={currentUser}
                    replyTo={replyTo}
                    setReplyTo={setReplyTo}
                    editingComment={editingComment}
                    setEditingComment={setEditingComment}
                    editContent={editContent}
                    setEditContent={setEditContent}
                    isSubmitting={isSubmitting}
                    handleEditComment={handleEditComment}
                    handleDeleteComment={handleDeleteComment}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
