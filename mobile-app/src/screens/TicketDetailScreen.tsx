import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { AxiosError } from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../types/navigation';
import { Ticket, Priority, Status } from '../types/ticket';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import CommentSection from '../components/CommentSection';

const PRIORITY_COLORS: Record<Priority, string> = {
  LOW: '#6B7280',
  MEDIUM: '#F59E0B',
  HIGH: '#EF4444',
};

const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: 'Düşük',
  MEDIUM: 'Orta',
  HIGH: 'Yüksek',
};

const STATUS_COLORS: Record<Status, string> = {
  OPEN: '#7D8355',
  IN_PROGRESS: '#F59E0B',
  RESOLVED: '#22C55E',
  CLOSED: '#6B7280',
};

const STATUS_LABELS: Record<Status, string> = {
  OPEN: 'Açık',
  IN_PROGRESS: 'İşlemde',
  RESOLVED: 'Çözüldü',
  CLOSED: 'Kapatıldı',
};

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

/** ISO datetime veya date string'ini Türkçe okunabilir formata çevirir */
function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  const day = date.getDate();
  const month = MONTH_NAMES[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;

export default function TicketDetailScreen({ route }: Props) {
  const { id } = route.params;
  const { colors } = useTheme();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  const fetchTicket = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsNotFound(false);

    try {
      const response = await api.get<Ticket>(`/tickets/${id}`);
      setTicket(response.data);
    } catch (error: unknown) {
      console.error('[TicketDetailScreen] Talep yüklenemedi:', error);
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        setIsNotFound(true);
      } else {
        setErrorMessage('Talep yüklenemedi.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // ---------- Yükleniyor ----------
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={['top']}>
        <ActivityIndicator color={colors.accent} size="large" />
      </SafeAreaView>
    );
  }

  // ---------- Bulunamadı (404) ----------
  if (isNotFound) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.notFoundContainer}>
          <Text style={[styles.notFoundText, { color: colors.textSecondary }]}>Talep bulunamadı</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Genel hata ----------
  if (errorMessage || !ticket) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]} edges={['top']}>
        <Text style={styles.errorText}>{errorMessage ?? 'Talep yüklenemedi.'}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={fetchTicket}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Tekrar dene</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ---------- Başarılı ----------
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      {/*
       * KeyboardAvoidingView buradan KALDIRILDI.
       * CommentSection, kendi input bar'ını kendi KeyboardAvoidingView'ı ile yönetiyor.
       * Böylece klavye açıldığında tüm ekran değil, sadece yorum input alanı kayıyor.
       */}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Başlık */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>{ticket.title}</Text>

        {/* Durum + Öncelik rozetleri */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[ticket.priority] + '33' }]}>
            <Text style={[styles.badgeText, { color: PRIORITY_COLORS[ticket.priority] }]}>
              {PRIORITY_LABELS[ticket.priority]}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: STATUS_COLORS[ticket.status] + '33' }]}>
            <Text style={[styles.badgeText, { color: STATUS_COLORS[ticket.status] }]}>
              {STATUS_LABELS[ticket.status]}
            </Text>
          </View>
        </View>

        {/* Açıklama */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Açıklama</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.descriptionText, { color: colors.textPrimary }]}>{ticket.description}</Text>
          </View>
        </View>

        {/* Oluşturulma Tarihi */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Oluşturulma Tarihi</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.dateText, { color: colors.textPrimary }]}>{formatDate(ticket.createdAt)}</Text>
          </View>
        </View>

        {/* AI Çözüm Önerisi */}
        {ticket.aiSolution && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
              ✨ Önerilen Çözüm
            </Text>
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.descriptionText, { color: colors.textPrimary }]}>
                {ticket.aiSolution}
              </Text>
            </View>
          </View>
        )}

        {/* ── Yorumlar bölümü ── */}
        <View style={styles.section}>
          <CommentSection ticketId={ticket.id} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 16,
    lineHeight: 34,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 13,
    fontFamily: 'Manrope_700Bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 24,
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'Manrope_400Regular',
  },
  errorText: {
    color: '#F87171',
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: 'Manrope_600SemiBold',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
  },
});
