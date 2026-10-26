import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type ChoiceChipsProps<T extends string | number> = {
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  large?: boolean;
  singleRow?: boolean;
};

export default function ChoiceChips<T extends string | number>({
  options,
  value,
  onChange,
  large = false,
  singleRow = false,
}: ChoiceChipsProps<T>) {
  return (
    <View style={[styles.row, large && styles.rowLarge, singleRow && styles.rowSingle]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[
              styles.chip,
              large && styles.chipLarge,
              singleRow && styles.chipSingleRow,
              selected && styles.chipSelected,
            ]}
          >
            <Text
              style={[
                styles.label,
                large && styles.labelLarge,
                singleRow && styles.labelSingleRow,
                selected && styles.labelSelected,
              ]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowLarge: {
    gap: 10,
  },
  rowSingle: {
    flexWrap: 'nowrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.button,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipLarge: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
  },
  chipSingleRow: {
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  labelLarge: {
    fontSize: 17,
  },
  labelSingleRow: {
    fontSize: 16,
  },
  labelSelected: {
    color: colors.surface,
  },
});
