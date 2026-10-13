import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Checkbox from '../components/Checkbox';
import FocusDial, { DIAL_MAX_MINUTES } from '../components/FocusDial';
import { useTasks } from '../state/TasksContext';
import { colors } from '../theme/colors';

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

  const toggleFromSheet = () => {
    toggleTask(task.id);
    if (!task.done) goBack();
  };

  const inSetup = phase === 'setup';
  const progress = inSetup ? minutes / DIAL_MAX_MINUTES : remaining / (DIAL_MAX_MINUTES * 60);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        {inSetup && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to Today"
            hitSlop={10}
            onPress={goBack}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Feather name="chevron-left" size={20} color={colors.textSecondary} />
            <Text style={styles.backText}>Today</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.body}>
        <FocusDial
          progress={progress}
          minutes={minutes}
          onChangeMinutes={inSetup ? setMinutes : undefined}
        >
          <Text style={styles.time}>{inSetup ? minutes : formatClock(remaining)}</Text>
          <Text style={styles.timeLabel}>
            {inSetup ? 'minutes' : phase === 'finished' ? "time's up" : 'left'}
          </Text>
        </FocusDial>

        <View style={styles.controls}>
          {phase === 'setup' && (
            <Pressable
              accessibilityRole="button"
              onPress={start}
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.primaryText}>Start focus</Text>
            </Pressable>
          )}

          {(phase === 'running' || phase === 'paused') && (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={phase === 'running' ? pause : resume}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.secondaryText}>{phase === 'running' ? 'Pause' : 'Resume'}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={end}
                style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
              >
                <Text style={styles.textButtonLabel}>End</Text>
              </Pressable>
            </>
          )}

          {phase === 'finished' && (
            <>
              <Pressable
                accessibilityRole="button"
                onPress={completeTask}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryText}>Mark done</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={end}
                style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
              >
                <Text style={styles.textButtonLabel}>Not yet</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>

      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={styles.handle} />
        <View style={styles.sheetRow}>
          <Checkbox checked={task.done} label={task.title} onToggle={toggleFromSheet} />
          <Text style={[styles.sheetTitle, task.done && styles.sheetTitleDone]} numberOfLines={2}>
            {task.title}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    minHeight: 60,
  },
  back: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  time: {
    fontSize: 56,
    fontWeight: '600',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  timeLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 2,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 48,
    minHeight: 52,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  primaryText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.surface,
  },
  secondaryButton: {
    backgroundColor: colors.button,
    borderRadius: 999,
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  secondaryText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  textButton: {
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  textButtonLabel: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.handle,
    marginBottom: 20,
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sheetTitleDone: {
    color: colors.placeholder,
    textDecorationLine: 'line-through',
  },
  pressed: {
    opacity: 0.7,
  },
});
