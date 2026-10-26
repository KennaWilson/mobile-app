import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, tabTints } from '../theme/colors';

const useNativeDriver = Platform.OS !== 'web';

export type PlannerTab = 'task' | 'list' | 'schedule';

const TABS: { key: PlannerTab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'task', label: 'Task', icon: 'check-square' },
  { key: 'list', label: 'List', icon: 'list' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar' },
];

function SelectedGlow() {
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.glow,
        {
          opacity: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.55, 1],
          }),
          transform: [
            {
              scale: pulse.interpolate({
                inputRange: [0, 1],
                outputRange: [0.94, 1.08],
              }),
            },
          ],
        },
      ]}
    />
  );
}

type PlannerTabsProps = {
  active: PlannerTab;
  onChange: (tab: PlannerTab) => void;
  /** "label" tabs sit on top of a white sheet; "icon" tabs sit on a ruled line over the page. */
  variant?: 'label' | 'icon';
  style?: StyleProp<ViewStyle>;
};

export default function PlannerTabs({ active, onChange, variant = 'label', style }: PlannerTabsProps) {
  const isIcon = variant === 'icon';
  return (
    <View accessibilityRole="tablist" style={[styles.row, style]}>
      {TABS.map((tab) => {
        const selected = tab.key === active;
        const selectedBackground = isIcon ? 'rgba(244, 248, 252, 0.92)' : colors.surface;
        return (
          <View key={tab.key} style={isIcon && styles.iconSlot}>
            {isIcon && selected && <SelectedGlow />}
            <Pressable
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected }}
              onPress={() => onChange(tab.key)}
              style={[
                styles.tab,
                isIcon && styles.iconTab,
                { backgroundColor: selected ? selectedBackground : tabTints[tab.key] },
                selected && styles.tabSelected,
                isIcon && selected && styles.iconTabSelected,
              ]}
            >
              {isIcon ? (
                <Feather
                  name={tab.icon}
                  size={17}
                  color={selected ? colors.accent : colors.textSecondary}
                />
              ) : (
                <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
              )}
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingHorizontal: 24,
    marginBottom: -1,
    zIndex: 1,
  },
  iconSlot: {
    position: 'relative',
    overflow: 'visible',
  },
  glow: {
    position: 'absolute',
    left: -7,
    right: -7,
    top: -8,
    bottom: -4,
    borderRadius: 14,
    backgroundColor: 'rgba(168, 196, 240, 0.55)',
    shadowColor: '#7EA8F0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 14,
    elevation: 8,
  },
  tab: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  tabSelected: {
    paddingTop: 11,
    paddingBottom: 9,
  },
  iconTab: {
    paddingHorizontal: 13,
    borderWidth: 1.5,
    borderColor: colors.rule,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  iconTabSelected: {
    borderColor: 'rgba(140, 176, 230, 0.9)',
    borderBottomColor: 'rgba(244, 248, 252, 0.92)',
    shadowColor: '#8EB4F0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  labelSelected: {
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
