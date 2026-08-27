/**
 * CommentSection — Ticket detay ekranında yorum listesi + yorum yazma alanı
 *
 * Özellikler:
 *  - GET /tickets/:id/comments → yorumları yükler
 *  - Chat balonu düzeni (kendi yorumlar sağda/aksan renkli, diğerleri solda/kart renkli)
 *  - Kendi yorumunda long-press → CommentActionModal (Düzenle / Sil / Vazgeç)
 *  - Sil → ConfirmModal onayı → DELETE API
 *  - Düzenle → inline Modal (TextInput)
 *  - POST /tickets/:id/comments → yeni yorum
 *  - Klavye açıldığında input bar kayıyor ama ScrollView içeriği korunuyor
 *  - Tam dark/light tema desteği (ThemeContext)
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Modal,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Comment } from '../types/ticket';
import CommentActionModal from './CommentActionModal';
import ConfirmModal from './ConfirmModal';

// ─── Yardımcı: tarih formatı ─────────────────────────────────────────────────

const MONTH_NAMES_SHORT = [
  'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz',
  'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara',
];

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const month = MONTH_NAMES_SHORT[d.getMonth()];
  const year = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hh}:${mm}`;
}

function wasEdited(comment: Comment): boolean {
  return (
    !comment.isDeleted &&
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000
  );
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface Props {
  ticketId: number;
}

// ─── Bileşen ─────────────────────────────────────────────────────────────────

export default function CommentSection({ ticketId }: Props) {
  const { colors, isLightMode } = useTheme();
  const { user } = useAuth();

  // ── Yorum listesi state ──────────────────────────────────────────
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);

  // ── Yeni yorum state ─────────────────────────────────────────────
  const [newText, setNewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Aksiyonlar — hangi yorum seçili ─────────────────────────────
  const [actionTarget, setActionTarget] = useState<Comment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  // ── Silme loading ────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // ── Düzenleme modal state ────────────────────────────────────────
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editText, setEditText] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Renk yardımcıları ────────────────────────────────────────────
  const ownBubbleBg = isLightMode ? '#E8EDD4' : '#2B3015';
  const ownBubbleText = colors.textPrimary;
  const otherBubbleBg = colors.card;
  const otherBubbleText = colors.textPrimary;
  const adminBadgeBg = isLightMode ? '#5c642a22' : '#5c642a55';
  const adminBadgeText = isLightMode ? '#5c642a' : '#A3B05A';
  const inputBorderColor = isLightMode ? '#D0CEC8' : '#2E2E2E';

  // ── Yorum yükleme ────────────────────────────────────────────────
  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
    setCommentsError(null);
    try {
      const res = await api.get<Comment[]>(`/tickets/${ticketId}/comments`);
      setComments(res.data);
    } catch {
      setCommentsError('Yorumlar yüklenemedi.');
    } finally {
      setCommentsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ── Long-press → aksiyon modalını aç ────────────────────────────
  const handleLongPress = (comment: Comment) => {
    if (comment.isDeleted || comment.author.id !== user?.id) return;
    setActionTarget(comment);
  };

  // ── Aksiyondan "Düzenle" seçildi ────────────────────────────────
  const handleEditOpen = () => {
    if (!actionTarget) return;
    setEditingComment(actionTarget);
    setEditText(actionTarget.content);
    setEditError(null);
    setActionTarget(null);
  };

  // ── Aksiyondan "Sil" seçildi → onay modalı ──────────────────────
  const handleDeleteOpen = () => {
    if (!actionTarget) return;
    setDeleteTarget(actionTarget.id);
    setActionTarget(null);
  };

  // ── Silme onaylandı ──────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (deleteTarget === null) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    setDeleteError(null);
    setDeletingId(id);
    try {
      await api.delete(`/comments/${id}`);
      setComments((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, isDeleted: true, content: 'Bu yorum silindi' } : c,
        ),
      );
    } catch {
      setDeleteError('Yorum silinemedi. Lütfen tekrar deneyin.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Düzenleme kaydet ─────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!editingComment || !editText.trim()) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const res = await api.patch<Comment>(`/comments/${editingComment.id}`, {
        content: editText.trim(),
      });
      setComments((prev) =>
        prev.map((c) => (c.id === editingComment.id ? res.data : c)),
      );
      setEditingComment(null);
    } catch {
      setEditError('Düzenleme kaydedilemedi. Lütfen tekrar deneyin.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Yeni yorum gönder ────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!newText.trim()) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await api.post<Comment>(`/tickets/${ticketId}/comments`, {
        content: newText.trim(),
      });
      setComments((prev) => [...prev, res.data]);
      setNewText('');
    } catch {
      setSubmitError('Yorum gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <>
      {/* ── Statik içerik: başlık + yorum listesi ────────────────── */}
      <View style={styles.wrapper}>

        {/* Bölüm başlığı */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Yorumlar {comments.length > 0 ? `(${comments.length})` : ''}
        </Text>

        {/* Yorum listesi */}
        {commentsLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : commentsError ? (
          <View style={styles.centered}>
            <Text style={[styles.errorText, { color: '#F87171' }]}>{commentsError}</Text>
            <TouchableOpacity
              onPress={fetchComments}
              style={[styles.retryBtn, { backgroundColor: colors.accent }]}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : comments.length === 0 ? (
          <View style={styles.centered}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Henüz yorum yapılmamış.
            </Text>
          </View>
        ) : (
          <View style={styles.commentList}>
            {comments.map((comment) => {
              const isOwn = comment.author.id === user?.id;
              const isDeleted = comment.isDeleted;
              const isDeleting = deletingId === comment.id;

              return (
                <TouchableWithoutFeedback
                  key={comment.id}
                  onLongPress={() => handleLongPress(comment)}
                  delayLongPress={400}
                  disabled={isDeleted || !isOwn}
                >
                  <View style={[styles.bubbleRow, isOwn && styles.bubbleRowOwn]}>
                    <View
                      style={[
                        styles.bubble,
                        { backgroundColor: isOwn ? ownBubbleBg : otherBubbleBg },
                        isOwn ? styles.bubbleOwn : styles.bubbleOther,
                        isDeleted && styles.bubbleDeleted,
                      ]}
                    >
                      {/* Yazar + Rol */}
                      <View style={styles.bubbleHeader}>
                        <Text
                          style={[
                            styles.authorName,
                            { color: isOwn ? ownBubbleText : otherBubbleText },
                            isDeleted && { color: colors.textSecondary },
                          ]}
                          numberOfLines={1}
                        >
                          {comment.author.name}
                        </Text>
                        {comment.author.role === 'ADMIN' && !isDeleted && (
                          <View style={[styles.adminBadge, { backgroundColor: adminBadgeBg }]}>
                            <Text style={[styles.adminBadgeText, { color: adminBadgeText }]}>
                              Admin
                            </Text>
                          </View>
                        )}
                      </View>

                      {/* İçerik */}
                      {isDeleting ? (
                        <ActivityIndicator
                          size="small"
                          color={colors.textSecondary}
                          style={{ marginVertical: 4 }}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.bubbleContent,
                            { color: isOwn ? ownBubbleText : otherBubbleText },
                            isDeleted && styles.deletedText,
                            isDeleted && { color: colors.textSecondary },
                          ]}
                        >
                          {comment.content}
                        </Text>
                      )}

                      {/* Tarih + düzenlendi */}
                      <View style={styles.bubbleFooter}>
                        <Text style={[styles.bubbleDate, { color: colors.textSecondary }]}>
                          {formatDateTime(comment.createdAt)}
                        </Text>
                        {wasEdited(comment) && (
                          <Text style={[styles.editedTag, { color: colors.textSecondary }]}>
                            {' · (düzenlendi)'}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              );
            })}
          </View>
        )}

        {/* Silme hatası */}
        {deleteError && (
          <Text style={[styles.errorText, { color: '#F87171', marginBottom: 6 }]}>
            {deleteError}
          </Text>
        )}

        {/* Gönderme hatası */}
        {submitError && (
          <Text style={[styles.errorText, { color: '#F87171', marginBottom: 6 }]}>
            {submitError}
          </Text>
        )}
      </View>

      {/*
       * ── Yeni yorum input bar ──────────────────────────────────────
       * KeyboardAvoidingView SADECE bu input bar'ı sarıyor.
       * Böylece klavye açıldığında tüm ScrollView değil, yalnızca
       * input alanı yukarı kayar. Üstteki yorumlar görünür kalır.
       */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputBar, { borderTopColor: inputBorderColor }]}>
          <TextInput
            style={[
              styles.commentInput,
              {
                backgroundColor: colors.card,
                color: colors.textPrimary,
                borderColor: inputBorderColor,
              },
            ]}
            placeholder="Yorum yazın..."
            placeholderTextColor={colors.textSecondary}
            value={newText}
            onChangeText={setNewText}
            multiline
            maxLength={2000}
            textAlignVertical="top"
          />
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || !newText.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: colors.accent },
              (submitting || !newText.trim()) && styles.sendBtnDisabled,
            ]}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendBtnText}>Gönder</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* ── Modaller (overlay üstünde render edilir) ───────────────── */}

      {/* 1. Aksiyon seçim modalı (Düzenle / Sil / Vazgeç) */}
      <CommentActionModal
        isOpen={actionTarget !== null}
        onEdit={handleEditOpen}
        onDelete={handleDeleteOpen}
        onClose={() => setActionTarget(null)}
      />

      {/* 2. Silme onay modalı */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Yorumu Sil"
        message="Bu yorumu silmek istediğinize emin misiniz?"
        confirmLabel="Sil"
        cancelLabel="Vazgeç"
        isDestructive
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* 3. Düzenleme modalı */}
      <Modal
        visible={editingComment !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingComment(null)}
      >
        <KeyboardAvoidingView
          style={styles.editModalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableWithoutFeedback onPress={() => setEditingComment(null)}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>

          <View style={[styles.editModalCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.editModalTitle, { color: colors.textPrimary }]}>
              Yorumu Düzenle
            </Text>

            <TextInput
              style={[
                styles.editModalInput,
                {
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  borderColor: inputBorderColor,
                },
              ]}
              value={editText}
              onChangeText={setEditText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              autoFocus
              maxLength={2000}
            />

            {editError && (
              <Text style={[styles.errorText, { color: '#F87171' }]}>{editError}</Text>
            )}

            <View style={styles.editModalBtnRow}>
              <TouchableOpacity
                onPress={() => { setEditingComment(null); setEditError(null); }}
                style={[styles.editModalBtnCancel, { borderColor: inputBorderColor }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.editModalBtnCancelText, { color: colors.textSecondary }]}>
                  Vazgeç
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleEditSave}
                disabled={editLoading || !editText.trim()}
                style={[
                  styles.editModalBtnSave,
                  { backgroundColor: colors.accent },
                  (editLoading || !editText.trim()) && styles.sendBtnDisabled,
                ]}
                activeOpacity={0.8}
              >
                {editLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendBtnText}>Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ─── Stiller ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
  },
  retryBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },

  // ── Yorum balonları ──
  commentList: {
    gap: 10,
    marginBottom: 16,
  },
  bubbleRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubbleRowOwn: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  bubbleOwn: {
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    borderBottomLeftRadius: 4,
  },
  bubbleDeleted: {
    opacity: 0.6,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  authorName: {
    fontSize: 12,
    fontFamily: 'Manrope_700Bold',
  },
  adminBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  adminBadgeText: {
    fontSize: 10,
    fontFamily: 'Manrope_700Bold',
  },
  bubbleContent: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 20,
  },
  deletedText: {
    fontStyle: 'italic',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 2,
  },
  bubbleDate: {
    fontSize: 10,
    fontFamily: 'Manrope_400Regular',
  },
  editedTag: {
    fontSize: 10,
    fontFamily: 'Manrope_400Regular',
    fontStyle: 'italic',
  },

  // ── Yeni yorum input bar ──
  inputBar: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  commentInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    minHeight: 64,
    maxHeight: 120,
  },
  sendBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.45,
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
  },

  // ── Düzenleme modalı ──
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  editModalCard: {
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  editModalTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 4,
  },
  editModalInput: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    minHeight: 100,
  },
  editModalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  editModalBtnCancel: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  editModalBtnCancelText: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
  },
  editModalBtnSave: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
