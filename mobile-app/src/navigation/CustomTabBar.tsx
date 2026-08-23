import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

const TAB_ICONS: Record<string, FeatherIconName> = {
  Tickets: 'inbox',
  Profile: 'user',
  AI: 'aperture',
};

const TAB_LABELS: Record<string, string> = {
  Tickets: 'Talepler',
  Profile: 'Profil',
  AI: 'AI',
};

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const count = state.routes.length;

  // Her sekmenin ölçülen x konumu ve genişliği
  const tabLayouts = useRef<{ x: number; width: number }[]>(
    Array(count).fill({ x: 0, width: 0 }),
  );

  // Pill'in yatay pozisyonu için tek bir Animated.Value
  const pillX = useRef(new Animated.Value(0)).current;
  // Pill'in genişliği için ayrı bir Animated.Value
  const pillWidth = useRef(new Animated.Value(0)).current;

  const isFirstLayout = useRef(true);

  const animatePill = useCallback(
    (index: number, animated: boolean) => {
      const layout = tabLayouts.current[index];
      if (!layout || layout.width === 0) return;

      const toX = layout.x;
      const toW = layout.width;

      if (!animated) {
        pillX.setValue(toX);
        pillWidth.setValue(toW);
        return;
      }

      Animated.parallel([
        Animated.timing(pillX, {
          toValue: toX,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false, // width animasyonu için false gerekli
        }),
        Animated.timing(pillWidth, {
          toValue: toW,
          duration: 220,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    },
    [pillX, pillWidth],
  );

  // Sekme değiştiğinde pill'i animasyonlu kaydır
  useEffect(() => {
    animatePill(state.index, true);
  }, [state.index, animatePill]);

  const handleTabLayout = useCallback(
    (index: number) => (e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      tabLayouts.current[index] = { x, width };

      // Tüm sekmeler ölçüldükten sonra pill'i ilk kez yerleştir (animasyonsuz)
      const allMeasured = tabLayouts.current.every((l) => l.width > 0);
      if (allMeasured && isFirstLayout.current) {
        isFirstLayout.current = false;
        animatePill(state.index, false);
      }
    },
    [state.index, animatePill],
  );

  return (
    <View style={styles.wrapper}>
      {/* Sabit yükseklikte container — pill bu alanın içinde kayar */}
      <View style={[styles.container, { backgroundColor: colors.card }]}>

        {/* Kayan beyaz pill — absolute, tüm sekme butonlarının arkasında */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.pill,
            { left: pillX, width: pillWidth },
          ]}
        />

        {/* Sekme butonları */}
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const iconName = TAB_ICONS[route.name] ?? 'circle';
          const label = TAB_LABELS[route.name] ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              activeOpacity={0.85}
              style={styles.tab}
              onLayout={handleTabLayout(index)}
            >
              <Feather
                name={iconName}
                size={18}
                color={isFocused ? '#111111' : colors.textSecondary}
              />
              {isFocused && (
                <Text style={styles.activeLabel}>{label}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    // Android shadow
    elevation: 12,
    // iOS shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  container: {
    flexDirection: 'row',
    borderRadius: 40,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    // overflow: hidden — pill'in köşe dışına taşmasını engelle
    overflow: 'hidden',
  },
  // Kayan beyaz pill — absolute, container içinde yatay kayar
  pill: {
    position: 'absolute',
    top: 8,        // container paddingVertical ile eşleşir
    bottom: 8,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 8,
    // z-index: pill'in üzerinde görünsün ama pointer events'i pill'de engellenmez
    zIndex: 1,
  },
  activeLabel: {
    fontSize: 13,
    fontFamily: 'Manrope_600SemiBold',
    color: '#111111',
  },
});
