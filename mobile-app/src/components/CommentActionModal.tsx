/**
 * CommentActionModal — Yorum üzerine long-press yapılınca açılan
 * "Düzenle / Sil / Vazgeç" bottom-sheet stili modal.
 * Ekstra kütüphane gerektirmez; React Native Modal + tema renkleri.
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  isOpen: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export default function CommentActionModal({ isOpen, onEdit, onDelete, onClose }: Props) {
  const { colors, isLightMode } = useTheme();

  const dividerColor = isLightMode ? '#E5E3DC' : '#2A2A2A';
  const deleteColor = '#EF4444';

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* Overlay — dokunulunca kapat */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Bottom-sheet kartı */}
      <View style={[styles.sheet, { backgroundColor: colors.card }]}>
        {/* Tutamaç çubuğu */}
        <View style={[styles.handle, { backgroundColor: dividerColor }]} />

        <Text style={[styles.title, { color: colors.textSecondary }]}>
          Yorum İşlemleri
        </Text>

        {/* Düzenle */}
        <TouchableOpacity
          style={[styles.actionBtn, { borderBottomColor: dividerColor, borderBottomWidth: 1 }]}
          onPress={() => { onClose(); onEdit(); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionText, { color: colors.textPrimary }]}>
            ✏️  Düzenle
          </Text>
        </TouchableOpacity>

        {/* Sil */}
        <TouchableOpacity
          style={[styles.actionBtn, { borderBottomColor: dividerColor, borderBottomWidth: 1 }]}
          onPress={() => { onClose(); onDelete(); }}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionText, { color: deleteColor }]}>
            🗑  Sil
          </Text>
        </TouchableOpacity>

        {/* Vazgeç */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            Vazgeç
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // safe area alt boşluk
    paddingHorizontal: 0,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  actionBtn: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
    textAlign: 'center',
  },
  cancelBtn: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
  },
});
