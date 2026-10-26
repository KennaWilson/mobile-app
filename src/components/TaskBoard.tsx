import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
  formatDue,
  formatTaskType,
  type Task,
  type TaskDue,
} from '../state/TasksContext';
import { colors } from '../theme/colors';
import { formatMinutes, formatToday } from '../utils/date';

const DUE_LABEL: Record<TaskDue, string> = {
  now: 'Today',
  today: 'Today',
  week: 'This week',
  month: 'This month',
  custom: 'Later',
};

const COMING_UP: TaskDue[] = ['week', 'month', 'custom'];

const COUNT_WORDS = ['', 'one', 'two', 'three', 'four', 'five'];

function headline(count: number) {
  if (count === 0) return 'Nothing left today';
  const word = COUNT_WORDS[count] ?? String(count);
  const thing = count === 1 ? 'thing' : 'things';
  return `Only ${word} ${thing} today`;
}

function taskCount(tasks: Task[]) {
  const open = tasks.filter((task) => !task.done);
  const count = open.length;
  const minutes = open.reduce((sum, task) => sum + task.minutes, 0);
  const label = count === 1 ? '1 task' : `${count} tasks`;
  return minutes > 0 ? `${label} · ${formatMinutes(minutes)}` : label;
}

function CircleCheck({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onToggle}
      style={[styles.check, checked && styles.checkOn]}
    >
      {checked && <Feather name="check" size={13} color={colors.surface} />}
    </Pressable>
  );
}

type TaskBoardProps = {
  tasks: Task[];
  onToggle: (id: string) => void;
};

export default function TaskBoard({ tasks, onToggle }: TaskBoardProps) {
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const today = tasks.filter((task) => task.due === 'now' || task.due === 'today');
  const upNextId = today.find((task) => !task.done)?.id;
  const openToday = today.filter((task) => !task.done).length;

  const later = COMING_UP.flatMap((due) => {
    const group = tasks.filter((task) => task.due === due);
    if (group.length === 0) return [];
    if (due !== 'custom') return [{ key: due, label: DUE_LABEL[due], tasks: group }];
    const byLabel = new Map<string, Task[]>();
    group.forEach((task) => {
      const label = task.dueCustom?.trim() || 'Later';
      const current = byLabel.get(label) ?? [];
      current.push(task);
      byLabel.set(label, current);
    });
    return [...byLabel.entries()].map(([label, items]) => ({
      key: `custom-${label}`,
      label,
      tasks: items,
    }));
  });

  return (
    <View>
      <Text style={styles.date}>{formatToday()}</Text>
      <Text style={styles.headline}>{headline(openToday)}</Text>

      <View style={styles.todayCard}>
        <View style={styles.todayHeader}>
          <Text style={styles.todayTitle}>Today</Text>
          <Text style={styles.todayMeta}>{today.length === 0 ? 'Clear' : taskCount(today)}</Text>
        </View>

        {today.length === 0 ? (
          <Text style={styles.clear}>No tasks yet. Add one below.</Text>
        ) : (
          today.map((task, index) => {
            const upNext = task.id === upNextId;
            return (
              <View key={task.id}>
                {index > 0 && <View style={styles.divider} />}
                <View style={styles.taskRow}>
                  <CircleCheck
                    checked={task.done}
                    label={`Mark ${task.title} done`}
                    onToggle={() => onToggle(task.id)}
                  />
                  <View style={styles.taskCopy}>
                    {upNext && <Text style={styles.upNext}>UP NEXT</Text>}
                    <Text style={[styles.taskTitle, task.done && styles.taskDone]}>{task.title}</Text>
                    <Text style={styles.taskMeta}>
                      {formatDue(task.due, task.dueCustom)} · {formatMinutes(task.minutes)} ·{' '}
                      {formatTaskType(task.type)}
                    </Text>
                  </View>
                  {upNext && (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Focus on ${task.title}`}
                      onPress={() => router.push(`/focus/${task.id}`)}
                      style={({ pressed }) => [styles.focus, pressed && styles.pressed]}
                    >
                      <Text style={styles.focusLabel}>Focus</Text>
                      <Feather name="arrow-right" size={16} color={colors.surface} />
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        )}
      </View>

      {later.length > 0 && (
        <View style={styles.coming}>
          <Text style={styles.comingLabel}>Coming up</Text>
          {later.map((group) => {
            const key = group.key;
            const expanded = openGroup === key;
            return (
              <View key={key}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded }}
                  onPress={() => setOpenGroup(expanded ? null : key)}
                  style={({ pressed }) => [styles.laterRow, pressed && styles.pressed]}
                >
                  <Text style={styles.laterTitle}>{group.label}</Text>
                  <Text style={styles.laterMeta}>{taskCount(group.tasks)}</Text>
                  <Feather name={expanded ? 'chevron-down' : 'chevron-right'} size={18} color={colors.placeholder} />
                </Pressable>
                {expanded &&
                  group.tasks.map((task) => (
                    <View key={task.id} style={styles.laterTask}>
                      <CircleCheck
                        checked={task.done}
                        label={`Mark ${task.title} done`}
                        onToggle={() => onToggle(task.id)}
                      />
                      <Text style={[styles.laterTaskTitle, task.done && styles.taskDone]}>{task.title}</Text>
                    </View>
                  ))}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  date: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  headline: {
    marginTop: 4,
    marginBottom: 18,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  todayCard: {
    backgroundColor: colors.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 8,
  },
  todayTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  todayMeta: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  clear: {
    fontSize: 15,
    color: colors.textSecondary,
    paddingBottom: 12,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginLeft: 34,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  check: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#C5C6CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  taskCopy: {
    flex: 1,
  },
  upNext: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
    color: colors.accent,
    marginBottom: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskDone: {
    color: colors.placeholder,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    marginTop: 2,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  focus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.textPrimary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  focusLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.surface,
  },
  coming: {
    marginTop: 26,
    gap: 10,
  },
  comingLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  laterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  laterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  laterMeta: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
  },
  laterTask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  laterTaskTitle: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});
