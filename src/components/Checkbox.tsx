import { Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

type CheckboxProps = {
  checked: boolean;
  label: string;
  onToggle: () => void;
};

export default function Checkbox({ checked, label, onToggle }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      hitSlop={10}
      onPress={onToggle}
      style={[styles.box, checked && styles.boxChecked]}
    >
      {checked && <Feather name="check" size={14} color={colors.surface} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
});
