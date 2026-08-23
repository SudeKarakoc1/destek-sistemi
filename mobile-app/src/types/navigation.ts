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
  MainTabs: undefined;
  TicketDetail: { id: string };
  CreateTicket: undefined;
};

/**
 * Tüm ekranları birleştiren tip — mevcut ekran dosyalarındaki
 * NativeStackScreenProps<RootStackParamList, '...'> kullanımını korur.
 */
export type RootStackParamList = AuthStackParamList & AppStackParamList & {
  Tickets: undefined;
};
