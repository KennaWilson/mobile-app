import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

type PlannerRingsProps = {
  count: number;
  size?: 'small' | 'regular';
};

export default function PlannerRings({ count, size = 'regular' }: PlannerRingsProps) {
  const ringStyle = size === 'small' ? styles.ringSmall : styles.ring;
  return (
    <View style={[styles.row, size === 'small' && styles.rowSmall]} pointerEvents="none">
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={ringStyle} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    position: 'absolute',
    top: -11,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rowSmall: {
    top: -8,
    left: 12,
    right: 12,
  },
  ring: {
    width: 9,
    height: 22,
    borderRadius: 5,
    borderWidth: 2.5,
    borderColor: colors.textPrimary,
  },
  ringSmall: {
    width: 7,
    height: 16,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.textPrimary,
  },
});
