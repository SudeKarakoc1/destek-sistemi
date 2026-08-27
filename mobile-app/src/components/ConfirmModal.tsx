/**
 * ConfirmModal — Yıkıcı işlemler için genel amaçlı onay modalı.
 * Alert.alert() yerine, uygulamanın temasıyla tutarlı bir görünüm sunar.
 *
 * Kullanım örneği:
 *   <ConfirmModal
 *     isOpen={showDelete}
 *     title="Yorumu sil"
 *     message="Bu yorumu silmek istediğinize emin misiniz?"
 *     confirmLabel="Sil"
 *     onConfirm={handleDelete}
 *     onCancel={() => setShowDelete(false)}
 *   />
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
  title: string;
  message: string;
  /** Onay butonu etiketi. Varsayılan: "Sil" */
  confirmLabel?: string;
  /** İptal butonu etiketi. Varsayılan: "Vazgeç" */
  cancelLabel?: string;
  /** true ise onay butonu kırmızı (yıkıcı işlem), false ise accent rengi */
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Sil',
  cancelLabel = 'Vazgeç',
  isDestructive = true,
  onConfirm,
  onCancel,
}: Props) {
  const { colors, isLightMode } = useTheme();

  const confirmBtnColor = isDestructive ? '#EF4444' : colors.accent;
  const dividerColor = isLightMode ? '#E5E3DC' : '#2A2A2A';
  const cardBg = isLightMode ? '#FFFFFF' : '#1E1E1E';

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {/* Overlay — dokunulunca kapat */}
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Ortalanmış kart */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <View style={[styles.card, { backgroundColor: cardBg }]}>
          {/* Başlık */}
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>

          {/* Mesaj */}
          <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>

          {/* Ayırıcı */}
          <View style={[styles.divider, { backgroundColor: dividerColor }]} />

          {/* Butonlar */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.cancelBtn, { borderColor: dividerColor }]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>
                {cancelLabel}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, styles.confirmBtn, { backgroundColor: confirmBtnColor }]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={[styles.btnText, styles.confirmBtnText]}>
                {confirmLabel}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 28,
  },
  card: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 17,
    fontFamily: 'Manrope_700Bold',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    marginBottom: 16,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  btn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    borderWidth: 1,
  },
  confirmBtn: {
    // backgroundColor gelir prop'tan
  },
  btnText: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
  },
  confirmBtnText: {
    color: '#FFFFFF',
  },
});
