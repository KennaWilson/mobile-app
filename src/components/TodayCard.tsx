import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Checkbox from './Checkbox';
import type { Task } from '../state/TasksContext';
import { colors } from '../theme/colors';

export function formatMinutes(total: number) {
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return minutes ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

type TodayCardProps = {
  tasks: Task[];
  onToggle: (id: string) => void;
  onFocus: (id: string) => void;
};

export default function TodayCard({ tasks, onToggle, onFocus }: TodayCardProps) {
  const remaining = tasks.filter((task) => !task.done);
  const upNextId = remaining[0]?.id;
  const totalMinutes = remaining.reduce((sum, task) => sum + task.minutes, 0);
  const summary = remaining.length
    ? `${remaining.length} ${remaining.length === 1 ? 'task' : 'tasks'} · ${formatMinutes(totalMinutes)}`
    : 'All done';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today</Text>
        <Text style={styles.headerMeta}>{summary}</Text>
      </View>

      {tasks.map((task, index) => {
        const isUpNext = task.id === upNextId;
        return (
          <View key={task.id} style={[styles.row, index > 0 && styles.rowDivider]}>
            <Checkbox
              checked={task.done}
              label={task.title}
              onToggle={() => onToggle(task.id)}
            />

            <View style={styles.rowText}>
              {isUpNext && <Text style={styles.upNext}>UP NEXT</Text>}
              <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>
                {task.title}
              </Text>
              <Text style={styles.taskMeta} numberOfLines={1}>Anytime today · {formatMinutes(task.minutes)}</Text>
            </View>

            {isUpNext && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Focus on ${task.title}`}
                onPress={() => onFocus(task.id)}
                style={({ pressed }) => [styles.focusButton, pressed && styles.pressed]}
              >
                <Text style={styles.focusText}>Focus</Text>
                <Feather name="arrow-right" size={18} color={colors.surface} />
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerMeta: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  rowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
  },
  rowText: {
    flex: 1,
  },
  upNext: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.8,
    color: colors.accent,
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  taskTitleDone: {
    color: colors.placeholder,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 3,
  },
  focusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.textPrimary,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  focusText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
});
