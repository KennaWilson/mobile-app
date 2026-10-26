import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import ChoiceChips from './ChoiceChips';
import type { TaskDetails, TaskDue, TaskPriority, TaskType } from '../state/TasksContext';
import { colors } from '../theme/colors';
import { personalizedGreeting } from '../utils/greeting';

const useNativeDriver = Platform.OS !== 'web';
const ADVANCE_MS = 220;

const TIME_OPTIONS = [
  { value: 15, label: '15 min' },
  { value: 25, label: '25 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '1 hr' },
  { value: 90, label: '90 min' },
];

const TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: 'task', label: 'Task' },
  { value: 'project', label: 'Project' },
  { value: 'event', label: 'Calendar event' },
];

const DUE_OPTIONS: { value: TaskDue; label: string }[] = [
  { value: 'now', label: 'Right now' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'custom', label: 'Custom' },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'nice', label: 'Nice to have' },
  { value: 'should', label: 'Should do' },
  { value: 'must', label: 'Must do' },
];

type StepId = 'time' | 'type' | 'due' | 'priority';

const STEPS: { id: StepId; question: string }[] = [
  { id: 'time', question: 'How much time would you like to dedicate to this?' },
  { id: 'type', question: 'Is this a task, project, or a calendar event?' },
  { id: 'due', question: 'When would you like to get this done by?' },
  { id: 'priority', question: 'How important is this?' },
];

type TaskQuestionsProps = {
  name: string;
  previewTitle: string;
  itemCount: number;
  initialType?: TaskType;
  onBack: () => void;
  onContinue: (details: TaskDetails) => void;
};

export default function TaskQuestions({
  name,
  previewTitle,
  itemCount,
  initialType = 'task',
  onBack,
  onContinue,
}: TaskQuestionsProps) {
  const [step, setStep] = useState(0);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [type, setType] = useState<TaskType | null>(null);
  const [due, setDue] = useState<TaskDue | null>(null);
  const [dueCustom, setDueCustom] = useState('');
  const [priority, setPriority] = useState<TaskPriority | null>(null);
  const advancing = useRef(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const needsCustomContinue = current.id === 'due' && due === 'custom';
  const customReady = dueCustom.trim().length > 0;

  const finish = useCallback(
    (next: {
      minutes: number;
      type: TaskType;
      due: TaskDue;
      dueCustom?: string;
      priority: TaskPriority;
    }) => {
      onContinue({
        minutes: next.minutes,
        type: next.type,
        due: next.due,
        dueCustom: next.due === 'custom' ? next.dueCustom?.trim() : undefined,
        priority: next.priority,
      });
    },
    [onContinue],
  );

  const animateTo = useCallback(
    (nextStep: number, direction: 1 | -1) => {
      Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver }).start(() => {
        slide.setValue(direction * 28);
        setStep(nextStep);
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver }),
          Animated.timing(slide, { toValue: 0, duration: 180, useNativeDriver }),
        ]).start();
      });
    },
    [opacity, slide],
  );

  const goNext = useCallback(
    (override?: Partial<{ minutes: number; type: TaskType; due: TaskDue; priority: TaskPriority }>) => {
      const nextMinutes = override?.minutes ?? minutes;
      const nextType = override?.type ?? type ?? initialType;
      const nextDue = override?.due ?? due ?? 'today';
      const nextPriority = override?.priority ?? priority ?? 'should';

      if (isLast) {
        if (nextMinutes == null) return;
        finish({
          minutes: nextMinutes,
          type: nextType,
          due: nextDue,
          dueCustom,
          priority: nextPriority,
        });
        return;
      }
      animateTo(step + 1, 1);
    },
    [animateTo, due, dueCustom, finish, initialType, isLast, minutes, priority, step, type],
  );

  const selectAndAdvance = <T,>(setter: (v: T) => void, value: T, key: StepId) => {
    if (advancing.current) return;
    setter(value);

    if (key === 'due' && value === 'custom') return;

    advancing.current = true;
    setTimeout(() => {
      if (key === 'time') goNext({ minutes: value as number });
      else if (key === 'type') goNext({ type: value as TaskType });
      else if (key === 'due') goNext({ due: value as TaskDue });
      else if (key === 'priority') goNext({ priority: value as TaskPriority });
      advancing.current = false;
    }, ADVANCE_MS);
  };

  const handleBack = () => {
    if (step === 0) onBack();
    else animateTo(step - 1, -1);
  };

  useEffect(() => {
    advancing.current = false;
  }, [step]);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.greeting}>{personalizedGreeting(name)}</Text>
        <Text style={styles.preview} numberOfLines={1}>
          {itemCount > 1 ? `${itemCount} items · “${previewTitle}”` : `“${previewTitle}”`}
        </Text>
        <View style={styles.dots}>
          {STEPS.map((s, index) => (
            <View key={s.id} style={[styles.dot, index === step && styles.dotActive, index < step && styles.dotDone]} />
          ))}
        </View>
      </View>

      <Animated.View
        style={[
          styles.card,
          {
            opacity,
            transform: [{ translateX: slide }],
          },
        ]}
      >
        <Text style={styles.stepLabel}>
          {step + 1} of {STEPS.length}
        </Text>
        <Text style={styles.question}>{current.question}</Text>

        {current.id === 'time' && (
          <ChoiceChips
            options={TIME_OPTIONS}
            value={minutes}
            onChange={(value) => selectAndAdvance(setMinutes, value, 'time')}
            large
          />
        )}
        {current.id === 'type' && (
          <ChoiceChips
            options={TYPE_OPTIONS}
            value={type}
            onChange={(value) => selectAndAdvance(setType, value, 'type')}
            large
            singleRow
          />
        )}
        {current.id === 'due' && (
          <>
            <ChoiceChips
              options={DUE_OPTIONS}
              value={due}
              onChange={(value) => selectAndAdvance(setDue, value, 'due')}
              large
            />
            {due === 'custom' && (
              <TextInput
                style={styles.customInput}
                value={dueCustom}
                onChangeText={setDueCustom}
                placeholder="e.g. Friday before lunch"
                placeholderTextColor={colors.placeholder}
                autoFocus
              />
            )}
          </>
        )}
        {current.id === 'priority' && (
          <ChoiceChips
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={(value) => selectAndAdvance(setPriority, value, 'priority')}
            large
          />
        )}
      </Animated.View>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          onPress={handleBack}
          style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
        >
          <Feather name="arrow-left" size={18} color={colors.textSecondary} />
          <Text style={styles.textButtonLabel}>{step === 0 ? 'Edit' : 'Back'}</Text>
        </Pressable>

        {needsCustomContinue && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continue"
            disabled={!customReady}
            onPress={() => goNext()}
            style={({ pressed }) => [
              styles.continueButton,
              !customReady && styles.continueDisabled,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.continueText}>Continue</Text>
            <Feather name="arrow-right" size={18} color={colors.surface} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.accent,
  },
  preview: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 4,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.accent,
  },
  dotDone: {
    backgroundColor: colors.accent,
    opacity: 0.45,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 8,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  question: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 32,
    marginBottom: 22,
  },
  customInput: {
    marginTop: 16,
    fontSize: 17,
    color: colors.textPrimary,
    backgroundColor: colors.button,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    outlineWidth: 0,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  textButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
  textButtonLabel: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  continueDisabled: {
    opacity: 0.4,
  },
  continueText: {
    fontSize: 17,
    fontWeight: '500',
    color: colors.surface,
  },
  pressed: {
    opacity: 0.6,
  },
});
