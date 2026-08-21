import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Priority, Status } from '../types/ticket';
import { mockTickets } from '../data/mockTickets';

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

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} ${MONTH_NAMES[month - 1]} ${year}`;
}

type Props = NativeStackScreenProps<RootStackParamList, 'TicketDetail'>;

export default function TicketDetailScreen({ route }: Props) {
  const { id } = route.params;
  const ticket = mockTickets.find((t) => t.id === id);

  if (!ticket) {
    return (
      <View style={styles.screen}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundText}>Talep bulunamadı</Text>
        </View>
      </View>
    );
  }

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
