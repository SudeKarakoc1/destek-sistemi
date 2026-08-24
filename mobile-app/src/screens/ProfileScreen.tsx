import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { translateErrorMessage } from '../utils/errorMessages';

export default function ProfileScreen() {
  const { user, logout, updateProfile, changePassword } = useAuth();
  const { isLightMode, toggleTheme, colors } = useTheme();

  // ─── Çıkış modal state'leri ─────────────────────────────
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // ─── Profil düzenleme state'leri ────────────────────────
  const [editMode, setEditMode]       = useState(false);
  const [editName, setEditName]       = useState('');
  const [editEmail, setEditEmail]     = useState('');
  const [editError, setEditError]     = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // ─── Şifre değiştirme state'leri ────────────────────────
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword]     = useState('');
  const [newPassword, setNewPassword]             = useState('');
  const [confirmPassword, setConfirmPassword]     = useState('');
  const [passwordError, setPasswordError]         = useState('');
  const [passwordLoading, setPasswordLoading]     = useState(false);

  // ─── Çıkış onayı ────────────────────────────────────────
  const confirmLogout = useCallback(async () => {
    setShowLogoutModal(false);
    await logout();
  }, [logout]);

  // ─── Profil düzenleme aç ────────────────────────────────
  const openEditMode = () => {
    setEditName(user?.name ?? '');
    setEditEmail(user?.email ?? '');
    setEditError('');
    setEditMode(true);
  };

  // ─── Profil düzenleme vazgeç ────────────────────────────
  const cancelEdit = () => {
    setEditName(user?.name ?? '');
    setEditEmail(user?.email ?? '');
    setEditError('');
    setEditMode(false);
  };

  // ─── Profil kaydet ──────────────────────────────────────
  const handleSaveProfile = async () => {
    setEditError('');
    setEditLoading(true);
    try {
      await updateProfile({ name: editName, email: editEmail });
      setEditMode(false);
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string | string[] }>;
      const raw = axiosErr.response?.data?.message ?? 'Bir hata oluştu.';
      setEditError(translateErrorMessage(raw));
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Şifre değiştirme modal kapat & temizle ─────────────
  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
  };

  // ─── Şifre kaydet ───────────────────────────────────────
  const handleChangePassword = async () => {
    setPasswordError('');

    // Client-side kontrol
    if (newPassword !== confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor.');
      return;
    }

    setPasswordLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      // AuthContext token'ı temizler → AppNavigator otomatik Login'e yönlendirir
      closePasswordModal();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message: string | string[] }>;
      const raw = axiosErr.response?.data?.message ?? 'Bir hata oluştu.';
      setPasswordError(translateErrorMessage(raw));
    } finally {
      setPasswordLoading(false);
    }
  };

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

          {editMode ? (
            /* ── Düzenleme modu ── */
            <View style={styles.editBlock}>
              <TextInput
                style={[styles.editInput, {
                  backgroundColor: colors.background,
                  borderColor: colors.accent,
                  color: colors.textPrimary,
                }]}
                value={editName}
                onChangeText={setEditName}
                placeholder="Ad Soyad"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.editInput, {
                  backgroundColor: colors.background,
                  borderColor: colors.accent,
                  color: colors.textPrimary,
                }]}
                value={editEmail}
                onChangeText={setEditEmail}
                placeholder="E-posta"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {editError ? (
                <Text style={styles.errorText}>{editError}</Text>
              ) : null}
              <View style={styles.editActions}>
                <TouchableOpacity
                  style={[styles.editSaveButton, { backgroundColor: colors.accent }, editLoading && styles.disabledButton]}
                  onPress={handleSaveProfile}
                  disabled={editLoading}
                  activeOpacity={0.8}
                >
                  {editLoading
                    ? <ActivityIndicator size="small" color="#FFFFFF" />
                    : <Text style={styles.editSaveText}>Kaydet</Text>
                  }
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editCancelButton}
                  onPress={cancelEdit}
                  disabled={editLoading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.editCancelText, { color: colors.textSecondary }]}>Vazgeç</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* ── Görüntüleme modu ── */
            <View style={styles.infoBlock}>
              <View style={styles.infoRow}>
                <View style={styles.infoTexts}>
                  <Text style={[styles.userName, { color: colors.textPrimary }]}>
                    {user?.name ?? '—'}
                  </Text>
                  <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                    {user?.email ?? '—'}
                  </Text>
                </View>
                <TouchableOpacity onPress={openEditMode} activeOpacity={0.7} hitSlop={8}>
                  <Feather name="edit-2" size={18} color={colors.accent} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ─── Rol satırı ──────────────────────────────────── */}
        <View style={[styles.row, { backgroundColor: colors.card }]}>
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Rol</Text>
          <Text style={[styles.rowValue, { color: colors.textPrimary }]}>
            {user?.role === 'ADMIN' ? 'Yönetici' : 'Kullanıcı'}
          </Text>
        </View>

        {/* ─── Aydınlık mod satırı ─────────────────────────── */}
        <View style={[styles.row, { backgroundColor: colors.card, marginBottom: 12 }]}>
          <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Aydınlık Mod</Text>
          <Switch
            value={isLightMode}
            onValueChange={toggleTheme}
            thumbColor={isLightMode ? colors.accent : '#888888'}
            trackColor={{ false: '#444444', true: colors.accent + '66' }}
            ios_backgroundColor="#444444"
          />
        </View>

        {/* ─── Şifre Değiştir butonu ────────────────────────── */}
        <TouchableOpacity
          style={[styles.changePasswordButton, { borderColor: colors.accent }]}
          onPress={() => setShowPasswordModal(true)}
          activeOpacity={0.8}
        >
          <Feather name="lock" size={16} color={colors.accent} style={styles.logoutIcon} />
          <Text style={[styles.changePasswordText, { color: colors.accent }]}>Şifre Değiştir</Text>
        </TouchableOpacity>

        {/* ─── Çıkış Yap butonu ────────────────────────────── */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.accent, marginTop: 12 }]}
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

        {/* ─── Şifre değiştirme modal'ı ───────────────────── */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="fade"
          onRequestClose={closePasswordModal}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Şifre Değiştir</Text>

              <TextInput
                style={[styles.passwordInput, {
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '66',
                  color: colors.textPrimary,
                }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Mevcut Şifre"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              <TextInput
                style={[styles.passwordInput, {
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '66',
                  color: colors.textPrimary,
                }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Yeni Şifre"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />
              <TextInput
                style={[styles.passwordInput, {
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '66',
                  color: colors.textPrimary,
                }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Yeni Şifre (Tekrar)"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
              />

              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={closePasswordModal}
                  disabled={passwordLoading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.modalCancelText, { color: colors.textSecondary }]}>
                    Vazgeç
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalConfirmButton, { backgroundColor: colors.accent }, passwordLoading && styles.disabledButton]}
                  onPress={handleChangePassword}
                  disabled={passwordLoading}
                  activeOpacity={0.8}
                >
                  {passwordLoading
                    ? <ActivityIndicator size="small" color="#FFFFFF" />
                    : <Text style={styles.modalConfirmText}>Kaydet</Text>
                  }
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
    alignItems: 'flex-start',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoTexts: {
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

  // ─── Düzenleme modu ───────────────────────────────
  editBlock: {
    flex: 1,
    gap: 10,
  },
  editInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
  },
  editActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  editSaveButton: {
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  editSaveText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    color: '#FFFFFF',
  },
  editCancelButton: {
    paddingVertical: 9,
    paddingHorizontal: 8,
  },
  editCancelText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },

  // ─── Hata metni ───────────────────────────────────
  errorText: {
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    color: '#EF4444',
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

  // ─── Şifre değiştir butonu ───────────────────────
  changePasswordButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
  },
  changePasswordText: {
    fontSize: 15,
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
  passwordInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
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
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 72,
  },
  modalConfirmText: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
