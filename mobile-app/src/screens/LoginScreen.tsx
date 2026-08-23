import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { translateErrorMessage } from '../utils/errorMessages';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const { colors } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    setErrorMessage(null);

    // Basit validasyon
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email ve şifre alanları boş bırakılamaz.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMessage('Lütfen geçerli bir email adresi girin.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      // Başarılıysa navigate gerekmez — AppNavigator token değişimini algılar.
    } catch (error: unknown) {
      console.error('[LoginScreen] Giriş hatası:', error);
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const raw = axiosError.response?.data?.message ?? 'Email veya şifre hatalı.';
      setErrorMessage(translateErrorMessage(raw));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Destek Sistemi</Text>

        <TextInput
          style={[styles.input, {
            backgroundColor: colors.card,
            color: colors.textPrimary,
            borderColor: colors.card === '#F0EEE8' ? '#D0CEC8' : '#2E2E2E',
          }]}
          placeholder="Email"
          placeholderTextColor={colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(v) => { setEmail(v); setErrorMessage(null); }}
          editable={!isSubmitting}
        />

        <TextInput
          style={[styles.input, {
            backgroundColor: colors.card,
            color: colors.textPrimary,
            borderColor: colors.card === '#F0EEE8' ? '#D0CEC8' : '#2E2E2E',
          }]}
          placeholder="Şifre"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={(v) => { setPassword(v); setErrorMessage(null); }}
          editable={!isSubmitting}
        />

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }, isSubmitting && styles.buttonDisabled]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Giriş yap</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>Hesabın yok mu? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.footerLink, { color: colors.accent }]}>Kayıt ol</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
  },
  errorText: {
    width: '100%',
    color: '#F87171',
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 8,
    marginTop: -4,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },
});
