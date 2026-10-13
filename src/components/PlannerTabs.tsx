import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

export type PlannerTab = 'task' | 'list' | 'schedule';

const TABS: { key: PlannerTab; label: string; tint: string }[] = [
  { key: 'task', label: 'Task', tint: '#E6E4F3' },
  { key: 'list', label: 'List', tint: '#F4E7D9' },
  { key: 'schedule', label: 'Schedule', tint: '#DFEDE4' },
];

type PlannerTabsProps = {
  active: PlannerTab;
  onChange: (tab: PlannerTab) => void;
};

export default function PlannerTabs({ active, onChange }: PlannerTabsProps) {
  return (
    <View accessibilityRole="tablist" style={styles.row}>
      {TABS.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.key)}
            style={[
              styles.tab,
              { backgroundColor: selected ? colors.surface : tab.tint },
              selected && styles.tabSelected,
            ]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
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
