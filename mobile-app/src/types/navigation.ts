import { NavigatorScreenParams } from '@react-navigation/native';
import { Priority } from './ticket';

/** Giriş yapılmamış kullanıcıya gösterilen ekranlar */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/** Bottom Tab sekmeleri */
export type TabParamList = {
  Tickets: undefined;
  Profile: undefined;
  AI: undefined;
};

/** Giriş yapmış kullanıcıya gösterilen ekranlar */
export type AppStackParamList = {
  /** Ana tab navigator'ı barındıran kök ekran */
  MainTabs: NavigatorScreenParams<TabParamList>;
  TicketDetail: { id: string };
  CreateTicket: {
    prefillTitle?: string;
    prefillDescription?: string;
    prefillCategory?: string;
    prefillPriority?: Priority;
  } | undefined;
};

/**
 * Tüm ekranları birleştiren tip — mevcut ekran dosyalarındaki
 * NativeStackScreenProps<RootStackParamList, '...'> kullanımını korur.
 */
export type RootStackParamList = AuthStackParamList & AppStackParamList;
