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
import { translateErrorMessage } from '../utils/errorMessages';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRegister = async () => {
    setErrorMessage(null);

    // Basit validasyon
    if (!name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Tüm alanlar doldurulmalıdır.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMessage('Lütfen geçerli bir email adresi girin.');
      return;
    }
    if (password.trim().length < 6) {
      setErrorMessage('Şifre en az 6 karakter olmalı.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      // Başarılıysa navigate gerekmez — register() içinde login() çağrılır,
      // AppNavigator token değişimini algılayarak otomatik yönlendirir.
    } catch (error: unknown) {
      console.error('[RegisterScreen] Kayıt hatası:', error);
      const axiosError = error as AxiosError<{ message?: string | string[] }>;
      const raw = axiosError.response?.data?.message ?? 'Kayıt işlemi başarısız. Lütfen tekrar deneyin.';
      setErrorMessage(translateErrorMessage(raw));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Kayıt Ol</Text>

        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          placeholderTextColor="#A0A0A0"
          value={name}
          onChangeText={(v) => { setName(v); setErrorMessage(null); }}
          editable={!isSubmitting}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#A0A0A0"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(v) => { setEmail(v); setErrorMessage(null); }}
          editable={!isSubmitting}
        />

        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor="#A0A0A0"
          secureTextEntry
          value={password}
          onChangeText={(v) => { setPassword(v); setErrorMessage(null); }}
          editable={!isSubmitting}
        />
        <Text style={styles.hintText}>Şifre en az 6 karakter olmalı</Text>

        {errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleRegister}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.buttonText}>Kayıt ol</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Giriş yap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
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
    color: '#FFFFFF',
    marginBottom: 40,
  },
  input: {
    width: '100%',
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2E2E2E',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 16,
  },
  button: {
    width: '100%',
    backgroundColor: '#14B8A6',
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
  hintText: {
    width: '100%',
    color: '#6B7280',
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    marginTop: -10,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#A0A0A0',
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
  },
  footerLink: {
    color: '#14B8A6',
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
  },
});
