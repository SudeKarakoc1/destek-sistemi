import { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import ConfirmDialog from './ConfirmDialog';

// ─── Tipler ──────────────────────────────────────────────────────────────────

interface CommentAuthor {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  author: CommentAuthor;
}

interface Props {
  ticketId: string | number;
  /** JWT'den decode edilen giriş yapmış kullanıcının id'si */
  currentUserId: number | null;
}

// ─── Yardımcılar ─────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function wasEdited(comment: Comment) {
  return (
    !comment.isDeleted &&
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000
  );
}

// ─── Inline SVG ikonlar ───────────────────────────────────────────────────────

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6 18.1 20a2 2 0 0 1-2 1.9H7.9a2 2 0 0 1-2-1.9L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

// ─── Tek yorum kartı ─────────────────────────────────────────────────────────

interface CommentItemProps {
  comment: Comment;
  isOwn: boolean;
  onEdit: (id: number, newContent: string) => Promise<void>;
  /** Silme isteği başlatılır — onay modalını açmak için üst bileşene iletilir */
  onRequestDelete: (id: number) => void;
  deleteLoading: boolean;
}

function CommentItem({ comment, isOwn, onEdit, onRequestDelete, deleteLoading }: CommentItemProps) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Düzenleme moduna girilince textarea'ya odaklan
  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.selectionStart = textareaRef.current.value.length;
    }
  }, [editing]);

  const handleSave = async () => {
    setEditError('');
    setEditLoading(true);
    try {
      await onEdit(comment.id, editContent);
      setEditing(false);
    } catch {
      setEditError('Düzenleme sırasında bir hata oluştu.');
    } finally {
      setEditLoading(false);
    }
  };

  const showActions = isOwn && !comment.isDeleted;

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`rounded-xl border px-4 py-3 transition-colors ${
          comment.isDeleted
            ? 'bg-gray-50 border-gray-100'
            : 'bg-white border-gray-200'
        }`}
      >
        {/* Üst satır: yazar + tarih + ikonlar */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-semibold ${
                comment.isDeleted ? 'text-gray-400' : 'text-gray-800'
              }`}
            >
              {comment.author.name}
            </span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                comment.author.role === 'ADMIN'
                  ? 'bg-[#5c642a]/10 text-[#5c642a]'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {comment.author.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
            {wasEdited(comment) && (
              <span className="text-xs text-gray-400 italic">(düzenlendi)</span>
            )}
            {/* Düzenle / Sil ikonları — sadece kendi yorumunda, hover'da */}
            {showActions && hovered && !editing && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditing(true); setEditContent(comment.content); setEditError(''); }}
                  title="Düzenle"
                  className="p-1 rounded text-gray-400 hover:text-[#5c642a] hover:bg-gray-100 transition-colors"
                >
                  <PencilIcon />
                </button>
                <button
                  onClick={() => onRequestDelete(comment.id)}
                  disabled={deleteLoading}
                  title="Sil"
                  className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 disabled:opacity-50 transition-colors"
                >
                  <TrashIcon />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* İçerik */}
        {editing ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors resize-none"
            />
            {editError && (
              <p className="text-xs text-red-600">{editError}</p>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={editLoading || !editContent.trim()}
                className="bg-[#5c642a] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#4a5022] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {editLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
              <button
                onClick={() => { setEditing(false); setEditError(''); }}
                className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          <p
            className={`text-sm leading-relaxed whitespace-pre-wrap ${
              comment.isDeleted ? 'text-gray-400 italic' : 'text-gray-700'
            }`}
          >
            {comment.content}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────────────────────

export default function CommentSection({ ticketId, currentUserId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState('');

  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  /** null = kapalı, number = silinecek yorum id'si */
  const [confirmTarget, setConfirmTarget] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Yorumları yükle ─────────────────────────────────────────────
  useEffect(() => {
    if (!ticketId) return;
    setCommentsLoading(true);
    setCommentsError('');

    api
      .get<Comment[]>(`/tickets/${ticketId}/comments`)
      .then((res) => setComments(res.data))
      .catch(() => setCommentsError('Yorumlar yüklenirken bir hata oluştu.'))
      .finally(() => setCommentsLoading(false));
  }, [ticketId]);

  // ── Düzenle ─────────────────────────────────────────────────────
  const handleEdit = async (commentId: number, newContent: string) => {
    const res = await api.patch<Comment>(`/comments/${commentId}`, { content: newContent });
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? res.data : c)),
    );
  };

  // ── Sil (modal üzerinden) ────────────────────────────────────────

  /** Çöp kutusu ikonuna tıklanınca — onay modalını açar */
  const handleRequestDelete = (commentId: number) => {
    setConfirmTarget(commentId);
  };

  /** Modal’da “Sil”’e basılınca — gerçek API çağrısı */
  const handleConfirmDelete = async () => {
    if (confirmTarget === null) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/comments/${confirmTarget}`);
      setComments((prev) =>
        prev.map((c) =>
          c.id === confirmTarget
            ? { ...c, isDeleted: true, content: 'Bu yorum silindi' }
            : c,
        ),
      );
    } catch {
      // sessizce geç; ileride hata state eklenebilir
    } finally {
      setDeleteLoading(false);
      setConfirmTarget(null);
    }
  };

  // ── Yeni yorum gönder ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    setSubmitError('');
    setSubmitting(true);

    try {
      const res = await api.post<Comment>(`/tickets/${ticketId}/comments`, {
        content: newComment.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setNewComment('');
    } catch {
      setSubmitError('Yorum gönderilirken bir hata oluştu.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────
  return (
    <>
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
      {/* Başlık */}
      <div className="px-6 py-5 border-b border-gray-100 shrink-0">
        <h2 className="text-sm font-semibold text-gray-900">
          Yorumlar
          {comments.length > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({comments.length})
            </span>
          )}
        </h2>
      </div>

      {/* Liste */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
        {commentsLoading && (
          <p className="text-sm text-gray-400 text-center py-8">Yorumlar yükleniyor...</p>
        )}

        {commentsError && !commentsLoading && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {commentsError}
          </div>
        )}

        {!commentsLoading && !commentsError && comments.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Henüz yorum yapılmamış.
          </p>
        )}

        {!commentsLoading &&
          !commentsError &&
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              isOwn={currentUserId !== null && comment.author.id === currentUserId}
              onEdit={handleEdit}
              onRequestDelete={handleRequestDelete}
              deleteLoading={deleteLoading && confirmTarget === comment.id}
            />
          ))}
      </div>

      {/* Yeni yorum yazma alanı */}
      <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-2">
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2">
            {submitError}
          </div>
        )}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            // Ctrl+Enter ile gönder
            if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
          }}
          rows={3}
          placeholder="Yorum yazın... (Ctrl+Enter ile gönder)"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 transition-colors resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            className="bg-[#5c642a] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#4a5022] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            {submitting ? 'Gönderiliyor...' : 'Yorum Ekle'}
          </button>
        </div>
      </div>
    </div>

    {/* Silme onay modalı */}
    <ConfirmDialog
      isOpen={confirmTarget !== null}
      title="Yorumu sil"
      message="Bu yorumu silmek istediğinize emin misiniz?"
      confirmLabel="Sil"
      cancelLabel="Vazgeç"
      onConfirm={handleConfirmDelete}
      onCancel={() => setConfirmTarget(null)}
    />
  </>);
}
