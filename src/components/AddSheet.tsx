import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AmbientSheetGlow from './AmbientSheetGlow';
import type { PlannerTab } from './PlannerTabs';
import TaskQuestions from './TaskQuestions';
import { splitLines, type TaskDetails } from '../state/TasksContext';
import { colors } from '../theme/colors';

const useNativeDriver = Platform.OS !== 'web';
const DEMO_VOICE_TASK = 'Complete algebra assignment';
const LISTEN_MS = 900;
const TYPE_MS = 38;

type Stage = 'compose' | 'questions' | 'review';

type AddSheetProps = {
  name: string;
  draft: string;
  onChangeDraft: (text: string) => void;
  bottomPadding: number;
  onClose: () => void;
  onSave: (tab: PlannerTab, lines: string[], details?: TaskDetails) => void;
};

export default function AddSheet({
  name,
  draft,
  onChangeDraft,
  bottomPadding,
  onClose,
  onSave,
}: AddSheetProps) {
  const [stage, setStage] = useState<Stage>('compose');
  const [details, setDetails] = useState<TaskDetails | null>(null);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [listening, setListening] = useState(false);
  const [sheetSize, setSheetSize] = useState({ width: 0, height: 0 });
  const sheetLift = useRef(new Animated.Value(0)).current;
  const micPulse = useRef(new Animated.Value(0)).current;
  const buttonGrow = useRef(new Animated.Value(0)).current;
  const voiceTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const { width: windowWidth } = useWindowDimensions();
  const lines = splitLines(draft);
  const keptLines = lines.filter((_, index) => !skipped.has(index));
  const questionsOpen = stage === 'questions';
  const glowWidth = sheetSize.width || windowWidth;

  const clearVoiceTimers = () => {
    voiceTimers.current.forEach(clearTimeout);
    voiceTimers.current = [];
  };

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stage === 'review') setStage('questions');
      else if (stage === 'questions') setStage('compose');
      else onClose();
      return true;
    });
    return () => sub.remove();
  }, [stage, onClose]);

  useEffect(() => {
    Animated.spring(sheetLift, {
      toValue: questionsOpen ? 1 : 0,
      useNativeDriver,
      friction: 9,
      tension: 68,
    }).start();
  }, [questionsOpen, sheetLift]);

  useEffect(() => {
    if (stage !== 'compose') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(buttonGrow, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
        Animated.timing(buttonGrow, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [stage, buttonGrow]);

  useEffect(() => {
    if (!listening) {
      micPulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(micPulse, { toValue: 1, duration: 520, useNativeDriver }),
        Animated.timing(micPulse, { toValue: 0, duration: 520, useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [listening, micPulse]);

  useEffect(() => () => clearVoiceTimers(), []);

  const startVoiceDemo = () => {
    if (listening) return;
    clearVoiceTimers();
    setListening(true);
    onChangeDraft('');

    const listenTimer = setTimeout(() => {
      DEMO_VOICE_TASK.split('').forEach((_, index) => {
        const typeTimer = setTimeout(() => {
          onChangeDraft(DEMO_VOICE_TASK.slice(0, index + 1));
          if (index === DEMO_VOICE_TASK.length - 1) setListening(false);
        }, index * TYPE_MS);
        voiceTimers.current.push(typeTimer);
      });
    }, LISTEN_MS);
    voiceTimers.current.push(listenTimer);
  };

  const goNextFromCompose = () => {
    if (listening) return;
    clearVoiceTimers();
    setSkipped(new Set());
    setDetails(null);
    setStage('questions');
  };

  const toggleLine = (index: number) => {
    setSkipped((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const saveDestination =
    details?.type === 'event' ? 'Schedule' : details?.type === 'project' ? 'Projects' : 'Tasks';

  const sheetTranslateY = sheetLift.interpolate({
    inputRange: [0, 1],
    outputRange: [28, 0],
  });
  const buttonScale = buttonGrow.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={[styles.scrim, questionsOpen && styles.scrimDeep]}
        onPress={onClose}
      />
      <Animated.View
        style={[
          styles.container,
          stage !== 'compose' && styles.containerTall,
          questionsOpen && styles.containerQuestions,
          questionsOpen && { transform: [{ translateY: sheetTranslateY }] },
        ]}
      >
        <View style={styles.glowHalo} pointerEvents="none" />
        <View
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setSheetSize({ width, height });
          }}
          style={[
            styles.sheet,
            questionsOpen && styles.sheetQuestions,
            { paddingBottom: bottomPadding },
          ]}
        >
          <AmbientSheetGlow width={glowWidth} height={sheetSize.height} idPrefix="add" />
          <View style={styles.sheetContent}>
            {questionsOpen && <View style={styles.handle} />}
            {stage === 'questions' && (
              <TaskQuestions
                name={name}
                previewTitle={lines[0] ?? ''}
                itemCount={lines.length}
                onBack={() => setStage('compose')}
                onContinue={(answers) => {
                  setDetails(answers);
                  setStage('review');
                }}
              />
            )}

            {stage === 'review' && (
              <>
                <Text style={styles.reviewTitle}>Save to plan?</Text>
                <Text style={styles.reviewSubtitle}>
                  Saving to {saveDestination}. Tap anything you want to leave out.
                </Text>
                <ScrollView style={styles.reviewList} contentContainerStyle={styles.reviewListContent}>
                  {lines.map((line, index) => {
                    const kept = !skipped.has(index);
                    return (
                      <Pressable
                        key={`${index}-${line}`}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: kept }}
                        accessibilityLabel={line}
                        onPress={() => toggleLine(index)}
                        style={styles.reviewRow}
                      >
                        <View style={[styles.bullet, kept && styles.bulletKept]}>
                          {kept && <Feather name="check" size={12} color={colors.surface} />}
                        </View>
                        <Text style={[styles.reviewText, !kept && styles.reviewTextSkipped]}>
                          {line}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => setStage('questions')}
                    style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
                  >
                    <Text style={styles.textButtonLabel}>Back</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Save to plan"
                    disabled={keptLines.length === 0}
                    onPress={() => onSave('task', keptLines, details ?? undefined)}
                    style={({ pressed }) => [
                      styles.saveButton,
                      keptLines.length === 0 && styles.saveDisabled,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Feather name="check" size={26} color={colors.surface} />
                  </Pressable>
                </View>
              </>
            )}

            {stage === 'compose' && (
              <>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={[styles.input, Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null]}
                    value={draft}
                    onChangeText={onChangeDraft}
                    placeholder={listening ? 'Say what’s on your mind…' : 'What needs to get done?'}
                    placeholderTextColor={colors.placeholder}
                    multiline
                    autoFocus={!listening}
                    editable={!listening}
                    textAlignVertical="top"
                    selectionColor={colors.accent}
                    underlineColorAndroid="transparent"
                  />
                </View>
                <View style={styles.actions}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={listening ? 'Listening' : 'Voice input'}
                    accessibilityState={{ busy: listening }}
                    disabled={listening}
                    onPress={startVoiceDemo}
                    style={styles.buttonHit}
                  >
                    <Animated.View
                      style={[
                        styles.roundButton,
                        listening && styles.micListening,
                        { transform: [{ scale: buttonScale }] },
                      ]}
                    >
                      {listening && (
                        <Animated.View
                          pointerEvents="none"
                          style={[
                            styles.micRipple,
                            {
                              opacity: micPulse.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0.55, 0],
                              }),
                              transform: [
                                {
                                  scale: micPulse.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [1, 1.7],
                                  }),
                                },
                              ],
                            },
                          ]}
                        />
                      )}
                      <Feather
                        name="mic"
                        size={22}
                        color={listening ? colors.surface : colors.textPrimary}
                      />
                    </Animated.View>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Continue"
                    disabled={lines.length === 0 || listening}
                    onPress={goNextFromCompose}
                    style={styles.buttonHit}
                  >
                    <Animated.View
                      style={[
                        styles.roundButton,
                        lines.length > 0 && !listening && styles.sendActive,
                        { transform: [{ scale: buttonScale }] },
                      ]}
                    >
                      <Feather
                        name="arrow-up"
                        size={22}
                        color={lines.length > 0 && !listening ? colors.surface : colors.textPrimary}
                      />
                    </Animated.View>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    backgroundColor: colors.scrim,
  },
  scrimDeep: {
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '62%',
    zIndex: 2,
  },
  containerTall: {
    height: '78%',
  },
  containerQuestions: {
    height: '84%',
  },
  glowHalo: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 8,
    bottom: -6,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: 'rgba(155, 180, 232, 0.32)',
    shadowColor: '#9BB4E8',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 24,
    paddingTop: 22,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#8B9FD0',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 14,
  },
  sheetQuestions: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
  },
  sheetContent: {
    flex: 1,
    zIndex: 1,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.handle,
    marginBottom: 14,
  },
  inputWrap: {
    flex: 1,
    overflow: 'hidden',
    zIndex: 0,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: colors.textPrimary,
    paddingVertical: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
    outlineWidth: 0,
    outlineColor: 'transparent',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 3,
  },
  buttonHit: {
    width: 68,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 4,
  },
  roundButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(240, 239, 236, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  micListening: {
    backgroundColor: colors.accent,
  },
  micRipple: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
  },
  sendActive: {
    backgroundColor: colors.textPrimary,
  },
  reviewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  reviewSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  reviewList: {
    flex: 1,
    marginTop: 14,
  },
  reviewListContent: {
    paddingBottom: 8,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 9,
  },
  bullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletKept: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  reviewText: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
  },
  reviewTextSkipped: {
    color: colors.placeholder,
    textDecorationLine: 'line-through',
  },
  textButton: {
    paddingHorizontal: 6,
    paddingVertical: 14,
  },
  textButtonLabel: {
    fontSize: 17,
    color: colors.textSecondary,
  },
  saveButton: {
    width: 76,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.6,
  },
});
