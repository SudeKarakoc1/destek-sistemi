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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Priority } from '../types/ticket';
import api from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { translateErrorMessage } from '../utils/errorMessages';

type Category = 'Donanım' | 'Yazılım' | 'Ağ/Bağlantı' | 'Hesap/Şifre' | 'Diğer';

const CATEGORIES: Category[] = ['Donanım', 'Yazılım', 'Ağ/Bağlantı', 'Hesap/Şifre', 'Diğer'];

interface PriorityOption {
  value: Priority;
  label: string;
  color: string;
}

const PRIORITY_OPTIONS: PriorityOption[] = [
  { value: 'LOW',    label: 'Düşük',  color: '#6B7280' },
  { value: 'MEDIUM', label: 'Orta',   color: '#F59E0B' },
  { value: 'HIGH',   label: 'Yüksek', color: '#EF4444' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTicket'>;

export default function CreateTicketScreen({ navigation }: Props) {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('Yazılım');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      setError('Başlık ve açıklama zorunludur');
      return;
    }
    setError('');

    // "Diğer" seçiliyse kullanıcının yazdığı değeri kullan
    const categoryValue =
      category === 'Diğer'
        ? customCategory.trim() || 'Diğer'
        : category;

    setIsSubmitting(true);
    try {
      await api.post('/tickets', {
        title: title.trim(),
        description: description.trim(),
        category: categoryValue,
        priority,
      });

      setSuccessMessage('Talep oluşturuldu ✓');
      // 900ms sonra Tickets ekranına dön (stack'te birikmemesi için navigate)
      setTimeout(() => {
        navigation.navigate('Tickets');
      }, 900);
    } catch (err: unknown) {
      console.error('[CreateTicketScreen] Talep oluşturulamadı:', err);
      const axiosError = err as AxiosError<{ message?: string | string[] }>;
      const raw = axiosError.response?.data?.message ?? 'Talep oluşturulamadı. Lütfen tekrar deneyin.';
      setError(translateErrorMessage(raw));
      setIsSubmitting(false);
    }
    // isSubmitting, başarılı durumda navigate olunana kadar true kalır
  };

  const isDisabled = isSubmitting || successMessage !== null;

  // Temaya göre input border rengi
  const inputBorderColor = colors.card === '#F0EEE8' ? '#D0CEC8' : '#2E2E2E';
  // Seçilmemiş chip border/metin rengi
  const chipInactiveColor = colors.card === '#F0EEE8' ? '#9CA3AF' : '#3E3E3E';

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.textPrimary }]}>Yeni Talep Oluştur</Text>

        {/* Başlık */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Başlık</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: inputBorderColor }]}
          placeholder="Talep başlığı"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={(v) => { setTitle(v); setError(''); }}
          editable={!isDisabled}
        />

        {/* Açıklama */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Açıklama</Text>
        <TextInput
          style={[styles.input, styles.multilineInput, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: inputBorderColor }]}
          placeholder="Sorunu detaylıca açıkla"
          placeholderTextColor={colors.textSecondary}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={description}
          onChangeText={(v) => { setDescription(v); setError(''); }}
          editable={!isDisabled}
        />

        {/* Kategori */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Kategori</Text>
        <View style={styles.chipGroup}>
          {CATEGORIES.map((cat) => {
            const selected = category === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: chipInactiveColor },
                  selected && { backgroundColor: colors.accent, borderColor: colors.accent },
                ]}
                onPress={() => !isDisabled && setCategory(cat)}
                activeOpacity={0.75}
                disabled={isDisabled}
              >
                <Text style={[
                  styles.chipText,
                  { color: chipInactiveColor },
                  selected && styles.chipTextSelected,
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {category === 'Diğer' && (
          <TextInput
            style={[styles.input, styles.customCategoryInput, { backgroundColor: colors.card, color: colors.textPrimary, borderColor: inputBorderColor }]}
            placeholder="Kategoriyi yazın"
            placeholderTextColor={colors.textSecondary}
            value={customCategory}
            onChangeText={setCustomCategory}
            editable={!isDisabled}
          />
        )}

        {/* Öncelik */}
        <Text style={[styles.label, { color: colors.textSecondary }]}>Öncelik</Text>
        <View style={styles.priorityGroup}>
          {PRIORITY_OPTIONS.map((opt) => {
            const selected = priority === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.priorityBtn,
                  selected
                    ? { backgroundColor: opt.color, borderColor: opt.color }
                    : { borderColor: opt.color },
                ]}
                onPress={() => !isDisabled && setPriority(opt.value)}
                activeOpacity={0.75}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    styles.priorityBtnText,
                    { color: selected ? '#FFFFFF' : opt.color },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Hata mesajı */}
        {error !== '' && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        {/* Başarı mesajı */}
        {successMessage !== null && (
          <Text style={[styles.successText, { color: colors.accent }]}>{successMessage}</Text>
        )}

        {/* Gönder butonu */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.accent }, isDisabled && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isDisabled}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>Talep oluştur</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  heading: {
    fontSize: 26,
    fontFamily: 'Manrope_700Bold',
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
  customCategoryInput: {
    marginTop: 10,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  priorityGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  priorityBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  priorityBtnText: {
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 12,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Manrope_600SemiBold',
  },
});
