import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native';
import { AxiosError } from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../types/navigation';
import { Priority } from '../types/ticket';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { translateErrorMessage } from '../utils/errorMessages';

type Category = 'Donanım' | 'Yazılım' | 'Ağ/Bağlantı' | 'Hesap/Şifre' | 'Diğer';

const CATEGORIES: Category[] = ['Donanım', 'Yazılım', 'Ağ/Bağlantı', 'Hesap/Şifre', 'Diğer'];

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW:    '#6B7280',
  MEDIUM: '#F59E0B',
  HIGH:   '#EF4444',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW:    'Düşük',
  MEDIUM: 'Orta',
  HIGH:   'Yüksek',
};

type AppNavProp = NativeStackNavigationProp<AppStackParamList>;

export default function AIScreen() {
  const navigation = useNavigation<AppNavProp>();
  const { colors } = useTheme();

  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');

  const [aiLoading, setAiLoading]         = useState(false);
  const [aiError, setAiError]             = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState<Category | null>(null);
  const [suggestedPriority, setSuggestedPriority] = useState<Priority | null>(null);

  // Temaya göre input border rengi (CreateTicketScreen ile aynı mantık)
  const inputBorderColor = colors.card === '#F0EEE8' ? '#D0CEC8' : '#2E2E2E';
  // Dark modda accent rengi border/metin olarak kullanıldığında soluk
  // kaldığı için daha açık bir ton tercih ediyoruz
  const aiAccentColor = colors.card === '#F0EEE8' ? colors.accent : '#8A9440';

  const canSuggest = title.trim().length > 0 && description.trim().length > 0;
  const hasSuggestion = suggestedCategory !== null && suggestedPriority !== null;

  const handleAiSuggest = async () => {
    if (!canSuggest) return;
    setAiError('');
    setSuggestedCategory(null);
    setSuggestedPriority(null);
    setAiLoading(true);

    try {
      const res = await api.post<{ category: Category; priority: Priority }>(
        '/tickets/ai/suggest',
        { title: title.trim(), description: description.trim() }
      );
      if (CATEGORIES.includes(res.data.category)) {
        setSuggestedCategory(res.data.category);
      } else {
        setAiError('Öneri uygulanamadı.');
        return;
      }
      setSuggestedPriority(res.data.priority);
    } catch (err: unknown) {
      console.error('[AIScreen] AI önerisi alınamadı:', err);
      const axiosError = err as AxiosError<{ message?: string | string[] }>;
      const raw = axiosError.response?.data?.message ?? 'AI önerisi alınamadı. Lütfen tekrar deneyin.';
      setAiError(translateErrorMessage(raw));
    } finally {
      setAiLoading(false);
    }
  };

  const handleContinue = () => {
    if (!hasSuggestion) return;
    navigation.navigate('CreateTicket', {
      prefillTitle:       title.trim(),
      prefillDescription: description.trim(),
      prefillCategory:    suggestedCategory!,
      prefillPriority:    suggestedPriority!,
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Başlık */}
          <Text style={[styles.heading, { color: colors.textPrimary }]}>
            AI ile Hızlı Talep
          </Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Sorununu kısaca yaz, AI senin için kategori ve öncelik önersin.
          </Text>

          {/* Başlık input */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Başlık</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: inputBorderColor }]}
            placeholder="Talep başlığı"
            placeholderTextColor={colors.textSecondary}
            value={title}
            onChangeText={(v) => { setTitle(v); setAiError(''); setSuggestedCategory(null); setSuggestedPriority(null); }}
            editable={!aiLoading}
          />

          {/* Açıklama input */}
          <Text style={[styles.label, { color: colors.textSecondary }]}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: inputBorderColor }]}
            placeholder="Sorunu detaylıca açıkla"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={(v) => { setDescription(v); setAiError(''); setSuggestedCategory(null); setSuggestedPriority(null); }}
            editable={!aiLoading}
          />

          {/* AI Öneri butonu */}
          <TouchableOpacity
            style={[
              styles.aiButton,
              { backgroundColor: colors.card, borderColor: aiAccentColor },
              (!canSuggest || aiLoading) && styles.buttonDisabled,
            ]}
            onPress={handleAiSuggest}
            activeOpacity={0.8}
            disabled={!canSuggest || aiLoading}
          >
            {aiLoading ? (
              <ActivityIndicator color={aiAccentColor} size="small" />
            ) : (
              <Text style={[styles.aiButtonText, { color: aiAccentColor }]}>✨ AI'dan öneri al</Text>
            )}
          </TouchableOpacity>

          {/* Hata */}
          {aiError !== '' && (
            <Text style={styles.errorText}>{aiError}</Text>
          )}

          {/* Öneri sonucu */}
          {hasSuggestion && (
            <View style={[styles.suggestionCard, { backgroundColor: colors.card, borderColor: colors.accent + '40' }]}>
              <Text style={[styles.suggestionTitle, { color: colors.textSecondary }]}>
                ✨ AI önerisi
              </Text>

              <View style={styles.badgeRow}>
                {/* Kategori badge */}
                <View style={[styles.badge, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '50' }]}>
                  <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>Kategori</Text>
                  <Text style={[styles.badgeValue, { color: colors.textPrimary }]}>{suggestedCategory}</Text>
                </View>

                {/* Öncelik badge */}
                <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[suggestedPriority!] + '18', borderColor: PRIORITY_COLORS[suggestedPriority!] + '50' }]}>
                  <Text style={[styles.badgeLabel, { color: colors.textSecondary }]}>Öncelik</Text>
                  <Text style={[styles.badgeValue, { color: PRIORITY_COLORS[suggestedPriority!] }]}>
                    {PRIORITY_LABELS[suggestedPriority!]}
                  </Text>
                </View>
              </View>

              {/* Devam Et butonu */}
              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: colors.accent }]}
                onPress={handleContinue}
                activeOpacity={0.8}
              >
                <Text style={styles.continueButtonText}>Devam Et →</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 26,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 8,
  },
  subheading: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 22,
    marginBottom: 28,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 20,
  },
  multilineInput: {
    minHeight: 110,
    paddingTop: 14,
  },
  aiButton: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 16,
  },
  aiButtonText: {
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 12,
    textAlign: 'center',
  },
  suggestionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  suggestionTitle: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  badge: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  badgeLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 4,
  },
  badgeValue: {
    fontSize: 14,
    fontFamily: 'Manrope_700Bold',
  },
  continueButton: {
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
  },
});
