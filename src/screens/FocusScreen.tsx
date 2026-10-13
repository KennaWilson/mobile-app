import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Checkbox from '../components/Checkbox';
import FocusDial, { DIAL_MAX_MINUTES } from '../components/FocusDial';
import SteamingCup from '../components/SteamingCup';
import { useTasks } from '../state/TasksContext';
import { colors } from '../theme/colors';
import { formatMinutes } from '../utils/date';

type Phase = 'setup' | 'running' | 'paused' | 'finished';

function formatClock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function FocusScreen({ taskId }: { taskId: string }) {
  const insets = useSafeAreaInsets();
  const { tasks, toggleTask, setTaskMinutes } = useTasks();
  const task = tasks.find((item) => item.id === taskId);

  const [minutes, setMinutes] = useState(task?.minutes ?? 25);
  const [phase, setPhase] = useState<Phase>('setup');
  const [remaining, setRemaining] = useState(minutes * 60);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const endsAt = useRef(0);

  useEffect(() => {
    if (phase !== 'running') return;
    const tick = () => {
      const left = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) setPhase('finished');
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [phase]);

  if (!task) return <Redirect href="/" />;

  const start = () => {
    setTaskMinutes(task.id, minutes);
    endsAt.current = Date.now() + minutes * 60 * 1000;
    setRemaining(minutes * 60);
    setPhase('running');
  };

  const pause = () => setPhase('paused');

  const resume = () => {
    endsAt.current = Date.now() + remaining * 1000;
    setPhase('running');
  };

  const end = () => {
    setPhase('setup');
    setRemaining(minutes * 60);
  };

  const completeTask = () => {
    if (!task.done) toggleTask(task.id);
    goBack();
  };

  const toggleDone = () => {
    toggleTask(task.id);
    if (!task.done) goBack();
  };

  const inSetup = phase === 'setup';
  const progress = inSetup ? minutes / DIAL_MAX_MINUTES : remaining / (DIAL_MAX_MINUTES * 60);
  const timeLabel = inSetup
    ? `${minutes} min`
    : phase === 'finished'
      ? "Time's up"
      : `${formatClock(remaining)} left`;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.taskBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${task.title}, ${detailsOpen ? 'hide' : 'show'} details`}
          accessibilityState={{ expanded: detailsOpen }}
          onPress={() => setDetailsOpen((open) => !open)}
          style={styles.taskBarHeader}
        >
          <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]} numberOfLines={1}>
            {task.title}
          </Text>
          <MaterialCommunityIcons
            name={detailsOpen ? 'chevron-double-up' : 'chevron-double-down'}
            size={22}
            color={colors.textSecondary}
          />
        </Pressable>

        {detailsOpen && (
          <View style={styles.details}>
            <Text style={styles.detailText}>
              {task.kind === 'schedule' ? 'Scheduled today' : 'Anytime this week'} ·{' '}
              {formatMinutes(task.minutes)} focus
            </Text>
            <View style={styles.detailRow}>
              <Checkbox checked={task.done} label={`Mark ${task.title} done`} onToggle={toggleDone} />
              <Text style={styles.detailRowText}>Mark done</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={goBack}
              style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
            >
              <Feather name="chevron-left" size={18} color={colors.accent} />
              <Text style={styles.backLinkText}>Back to your week</Text>
            </Pressable>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <FocusDial
          progress={progress}
          minutes={minutes}
          onChangeMinutes={inSetup ? setMinutes : undefined}
          running={phase === 'running'}
        >
          <SteamingCup steaming={phase === 'running'} />
          <Text style={styles.time}>{timeLabel}</Text>
        </FocusDial>
        {inSetup && <Text style={styles.dragHint}>Drag the dial to change the time</Text>}

        <View style={styles.controls}>
          {phase === 'setup' && (
            <Pressable
              accessibilityRole="button"
              onPress={start}
              style={({ pressed }) => [styles.pill, styles.pillPrimary, pressed && styles.pressed]}
            >
              <Text style={[styles.pillText, styles.pillPrimaryText]}>Start focus</Text>
            </Pressable>
          )}

          {(phase === 'running' || phase === 'paused') && (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={phase === 'running' ? pause : resume}
                style={({ pressed }) => [styles.pill, styles.pillSoft, pressed && styles.pressed]}
              >
                <Text style={styles.pillText}>{phase === 'running' ? 'Pause' : 'Resume'}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={end}
                style={({ pressed }) => [styles.pill, styles.pillOutline, pressed && styles.pressed]}
              >
                <Text style={styles.pillText}>End</Text>
              </Pressable>
            </>
          )}

          {phase === 'finished' && (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={completeTask}
                style={({ pressed }) => [styles.pill, styles.pillPrimary, pressed && styles.pressed]}
              >
                <Text style={[styles.pillText, styles.pillPrimaryText]}>Mark done</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={end}
                style={({ pressed }) => [styles.pill, styles.pillOutline, pressed && styles.pressed]}
              >
                <Text style={styles.pillText}>Not yet</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  taskBar: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  taskBarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  taskTitleDone: {
    color: colors.placeholder,
    textDecorationLine: 'line-through',
  },
  details: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.divider,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 12,
  },
  detailText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailRowText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.accent,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  time: {
    marginTop: 8,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  dragHint: {
    marginTop: 14,
    fontSize: 14,
    color: colors.placeholder,
  },
  controls: {
    alignSelf: 'stretch',
    gap: 12,
    paddingHorizontal: 12,
    marginTop: 40,
  },
  pill: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pillPrimary: {
    backgroundColor: colors.accent,
  },
  pillSoft: {
    backgroundColor: colors.button,
    borderWidth: 1.5,
    borderColor: colors.rule,
  },
  pillOutline: {
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
  },
  pillText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  pillPrimaryText: {
    color: colors.surface,
  },
  pressed: {
    opacity: 0.7,
  },
});
