/** Giriş yapılmamış kullanıcıya gösterilen ekranlar */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

/** Giriş yapmış kullanıcıya gösterilen ekranlar */
export type AppStackParamList = {
  Tickets: undefined;
  TicketDetail: { id: string };
  CreateTicket: undefined;
};

/**
 * Tüm ekranları birleştiren tip — mevcut ekran dosyalarındaki
 * NativeStackScreenProps<RootStackParamList, '...'> kullanımını korur.
 */
export type RootStackParamList = AuthStackParamList & AppStackParamList;
