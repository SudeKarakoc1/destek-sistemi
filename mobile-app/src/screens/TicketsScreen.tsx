import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ticket, Priority, Status } from '../types/ticket';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Tickets'>;

export default function TicketsScreen({ navigation }: Props) {
  const renderItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TicketDetail', { id: item.id })}
      activeOpacity={0.75}
    >
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription} numberOfLines={1}>
        {item.description}
      </Text>
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: PRIORITY_COLORS[item.priority] + '33' }]}>
          <Text style={[styles.badgeText, { color: PRIORITY_COLORS[item.priority] }]}>
            {PRIORITY_LABELS[item.priority]}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] + '33' }]}>
          <Text style={[styles.badgeText, { color: STATUS_COLORS[item.status] }]}>
            {STATUS_LABELS[item.status]}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>Henüz talep yok</Text>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={mockTickets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          mockTickets.length === 0
            ? styles.listContainerEmpty
            : styles.listContainer
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTicket')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#121212',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 96,
  },
  listContainerEmpty: {
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Manrope_700Bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    fontFamily: 'Manrope_400Regular',
    color: '#A0A0A0',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Manrope_600SemiBold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#A0A0A0',
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#14B8A6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontFamily: 'Manrope_400Regular',
    lineHeight: 32,
  },
});
