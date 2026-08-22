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
import { RootStackParamList } from '../types/navigation';
import { Ticket, Priority, Status } from '../types/ticket';
import api from '../services/api';

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
  OPEN: '#14B8A6',
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
      <View style={styles.centered}>
        <ActivityIndicator color="#14B8A6" size="large" />
      </View>
    );
  }

  // ---------- Bulunamadı (404) ----------
  if (isNotFound) {
    return (
      <View style={styles.screen}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Talep bulunamadı</Text>
        </View>
      </View>
    );
  }

  // ---------- Genel hata ----------
  if (errorMessage || !ticket) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMessage ?? 'Talep yüklenemedi.'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchTicket}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Tekrar dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------- Başarılı ----------
  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{ticket.title}</Text>

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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Açıklama</Text>
          <View style={styles.card}>
            <Text style={styles.descriptionText}>{ticket.description}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Oluşturulma Tarihi</Text>
          <View style={styles.card}>
            <Text style={styles.dateText}>{formatDate(ticket.createdAt)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
  },
  centered: {
    flex: 1,
    backgroundColor: '#121212',
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
    color: '#FFFFFF',
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
    color: '#A0A0A0',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
  },
  descriptionText: {
    fontSize: 15,
    fontFamily: 'Manrope_400Regular',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  dateText: {
    fontSize: 15,
    fontFamily: 'Manrope_400Regular',
    color: '#FFFFFF',
  },
  errorText: {
    color: '#F87171',
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#14B8A6',
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
    color: '#A0A0A0',
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
  },
});

