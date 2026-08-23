import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { isLightMode, toggleTheme, colors } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const confirmLogout = useCallback(async () => {
    setShowLogoutModal(false);
    await logout();
    // AppNavigator token null olduğunda Auth stack'e yönlendirir.
  }, [logout]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>

        {/* ─── Başlık ─────────────────────────────────────── */}
        <Text style={[styles.pageTitle, { color: colors.textPrimary }]}>Profil</Text>

        {/* ─── Kullanıcı bilgi kartı ───────────────────────── */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.accent + '22' }]}>
            <Feather name="user" size={32} color={colors.accent} />
          </View>
          <View style={styles.infoBlock}>
            <Text style={[styles.userName, { color: colors.textPrimary }]}>
              {user?.name ?? '—'}
            </Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
              {user?.email ?? '—'}
            </Text>
          </View>
        </View>

        {/* ─── Rol satırı ──────────────────────────────────── */}
        <View style={[styles.row, { backgroundColor: colors.card }]}>
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Rol</Text>
          <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
            {user?.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
          </Text>
        </View>

        {/* ─── Aydınlık mod satırı ─────────────────────────── */}
        <View style={[styles.row, { backgroundColor: colors.card, marginBottom: 24 }]}>
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Aydınlık Mod</Text>
          <Switch
            value={isLightMode}
            onValueChange={toggleTheme}
            thumbColor={isLightMode ? colors.accent : '#888888'}
            trackColor={{ false: '#444444', true: colors.accent + '66' }}
            ios_backgroundColor="#444444"
          />
        </View>

        {/* ─── Çıkış Yap butonu ────────────────────────────── */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.accent }]}
          onPress={() => setShowLogoutModal(true)}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={16} color="#FFFFFF" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* ─── Çıkış onay modal'ı ─────────────────────────── */}
        <Modal
          visible={showLogoutModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowLogoutModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Çıkış yap</Text>
              <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
                Hesabından çıkış yapmak istediğine emin misin?
              </Text>
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setShowLogoutModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                    Vazgeç
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirmButton, { backgroundColor: colors.accent }]}
                  onPress={confirmLogout}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalConfirmText}>Çıkış Yap</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

// Sabit olmayan (tema bağımsız) stiller burada — renkler inline style'da
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 100,
  },
  pageTitle: {
    fontSize: 22,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 24,
  },

  // ─── Kullanıcı kartı ──────────────────────────────
  card: {
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBlock: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
  },

  // ─── Satır ────────────────────────────────────────
  row: {
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
  },
  rowValue: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },

  // ─── Çıkış butonu ────────────────────────────────
  logoutButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutIcon: {
    marginRight: 2,
  },
  logoutButtonText: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: '#FFFFFF',
  },

  // ─── Modal ────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
  },
  modalConfirmButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalConfirmText: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: '#FFFFFF',
  },
});
