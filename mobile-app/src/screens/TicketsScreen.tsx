import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ticket, Priority, Status } from '../types/ticket';
import { useAuth } from '../context/AuthContext';
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

type Props = NativeStackScreenProps<RootStackParamList, 'Tickets'>;

export default function TicketsScreen({ navigation }: Props) {
  const { logout } = useAuth();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // ---------- Veri çekme ----------
  const fetchTickets = useCallback(async (
    opts: { refreshing?: boolean; silent?: boolean } = {},
  ) => {
    if (opts.refreshing) {
      setIsRefreshing(true);
    } else if (!opts.silent) {
      // İlk yükleme: henüz hiç veri yoksa tam ekran loading göster
      setIsLoading(true);
    }
    // Sessiz yenilemede errorMessage'ı sıfırlama — ekrandaki veriyi koru
    if (!opts.silent) {
      setErrorMessage(null);
    }

    try {
      const response = await api.get<Ticket[]>('/tickets');
      setTickets(response.data);
      // Başarılı veri gelince hata mesajını temizle (ilk yükleme başarısız
      // olmuştu ama "Tekrar dene" sonucu başarılı olabilir)
      setErrorMessage(null);
    } catch (error: unknown) {
      console.error('[TicketsScreen] Talepler yüklenemedi:', error);
      if (opts.silent && tickets.length > 0) {
        // Sessiz yenileme hatası + ekranda zaten veri var → kullanıcıyı rahatsız etme
        // Mevcut liste kalmaya devam eder
      } else {
        setErrorMessage('Talepler yüklenemedi.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [tickets.length]);

  // Ekran her odaklandığında (mount + geri dönüş) sessiz yenile:
  // İlk odaklanmada tickets.length === 0 olduğu için isLoading zaten true
  // kalacak ve tam ekran spinner gösterilecek. Sonraki odaklanmalarda
  // tickets.length > 0 olduğu için sessiz çalışır.
  useFocusEffect(
    useCallback(() => {
      fetchTickets({ silent: tickets.length > 0 });
    }, [fetchTickets, tickets.length]),
  );

  // ---------- Header: çıkış butonu ----------
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Çıkış yap',
      'Hesabından çıkış yapmak istediğine emin misin?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Çıkış yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
            // navigate gerekmez — AppNavigator token null olduğunda Login'e yönlendirir.
          },
        },
      ],
    );
  }, [logout]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.headerButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerButtonIcon}>⚙️</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, handleLogout]);

  // ---------- Render yardımcıları ----------
  const renderItem = ({ item }: { item: Ticket }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('TicketDetail', { id: String(item.id) })}
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

  // ---------- İlk yükleme ----------
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color="#14B8A6" size="large" />
      </View>
    );
  }

  // ---------- Hata durumu ----------
  if (errorMessage) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchTickets()}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Tekrar dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ---------- Ana içerik ----------
  return (
    <View style={styles.screen}>
      <FlatList
        data={tickets}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          tickets.length === 0
            ? styles.listContainerEmpty
            : styles.listContainer
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchTickets({ refreshing: true })}
            tintColor="#14B8A6"
            colors={['#14B8A6']}
          />
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
  centered: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
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
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  headerButtonIcon: {
    fontSize: 22,
  },
});

