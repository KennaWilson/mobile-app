import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, tabTints } from '../theme/colors';

export type PlannerTab = 'task' | 'list' | 'schedule';

const TABS: { key: PlannerTab; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'task', label: 'Task', icon: 'check-square' },
  { key: 'list', label: 'List', icon: 'list' },
  { key: 'schedule', label: 'Schedule', icon: 'calendar' },
];

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
        const selectedBackground = isIcon ? colors.background : colors.surface;
        return (
          <Pressable
            key={tab.key}
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
                color={selected ? colors.textPrimary : colors.textSecondary}
              />
            ) : (
              <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
            )}
          </Pressable>
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
    borderBottomColor: colors.background,
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
