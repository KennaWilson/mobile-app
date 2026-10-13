import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Checkbox from './Checkbox';
import { colors } from '../theme/colors';

type PlanCardProps = {
  title: string;
  noteColor: string;
  done: boolean;
  eyebrow?: string;
  details: string[];
  openLabel: string;
  onOpen: () => void;
  onToggle: () => void;
};

export default function PlanCard({
  title,
  noteColor,
  done,
  eyebrow,
  details,
  openLabel,
  onOpen,
  onToggle,
}: PlanCardProps) {
  return (
    <View style={styles.row}>
      <View style={[styles.note, { backgroundColor: noteColor }]}>
        <View style={styles.pin} pointerEvents="none">
          <MaterialCommunityIcons name="pin" size={24} color={colors.accent} />
        </View>
        <Text style={[styles.noteTitle, done && styles.done]} numberOfLines={4}>
          {title}
        </Text>
      </View>

      <View style={styles.details}>
        <View>
          {eyebrow && <Text style={styles.eyebrow}>{eyebrow}</Text>}
          {details.map((line) => (
            <Text key={line} style={styles.detailLine}>
              {line}
            </Text>
          ))}
        </View>
        <View style={styles.footer}>
          <Checkbox checked={done} label={`Mark ${title} done`} onToggle={onToggle} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={openLabel}
            onPress={onOpen}
            style={({ pressed }) => [styles.openButton, pressed && styles.pressed]}
          >
            <Feather name="arrow-right" size={18} color={colors.surface} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  note: {
    width: 128,
    minHeight: 128,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingTop: 24,
    paddingBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  pin: {
    position: 'absolute',
    top: -12,
    left: 14,
    transform: [{ rotate: '-20deg' }],
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  done: {
    color: colors.placeholder,
    textDecorationLine: 'line-through',
  },
  details: {
    flex: 1,
    minHeight: 128,
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.accent,
    marginBottom: 4,
  },
  detailLine: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 21,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  openButton: {
    backgroundColor: colors.textPrimary,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.7,
  },
});
