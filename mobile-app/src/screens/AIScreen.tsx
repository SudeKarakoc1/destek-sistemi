import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function AIScreen() {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <View style={[styles.iconWrapper, { backgroundColor: colors.accent + '1a' }]}>
          <Feather name="aperture" size={64} color={colors.accent} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Yakında</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          AI destekli özellikler yakında burada olacak.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 80,
  },
  iconWrapper: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Manrope_700Bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});
