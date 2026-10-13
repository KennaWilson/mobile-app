import { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PlannerTabs, { type PlannerTab } from '../components/PlannerTabs';
import PlannerTransition from '../components/PlannerTransition';
import TaskPromptCard from '../components/TaskPromptCard';
import TodayCard from '../components/TodayCard';
import { type Task, useTasks } from '../state/TasksContext';
import { colors } from '../theme/colors';
import { formatToday } from '../utils/date';

const USER_NAME = 'McKenna';

const TAB_COPY: Record<PlannerTab, { placeholder: string; hint: string }> = {
  task: { placeholder: 'What needs to get done?', hint: 'One thing or everything at once.' },
  list: { placeholder: "What's on the list?", hint: 'One item per line.' },
  schedule: { placeholder: "What's happening today?", hint: 'One plan per line.' },
};

const COUNT_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

function headline(tasks: Task[]) {
  if (tasks.length === 0) return 'A clean slate';
  const remaining = tasks.filter((task) => !task.done).length;
  if (remaining === 0) return 'All done for today';
  if (remaining === 1) return 'Just one thing today';
  const word = COUNT_WORDS[remaining] ?? String(remaining);
  return `${word[0].toUpperCase()}${word.slice(1)} things today`;
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<PlannerTab>('task');
  const [flippingTo, setFlippingTo] = useState<'list' | 'today' | null>(null);
  const { tasks, addFromText, toggleTask, listItems, addListItems } = useTasks();
  const hasDraft = draft.trim().length > 0;

  const addDraft = () => {
    if (!hasDraft) return;
    if (tab === 'list') {
      addListItems(draft);
      setFlippingTo('list');
    } else {
      addFromText(draft);
      setFlippingTo('today');
    }
    setDraft('');
    setExpanded(false);
  };

  useFocusEffect(
    useCallback(() => {
      setFlippingTo(null);
    }, []),
  );

  useEffect(() => {
    if (!expanded) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setExpanded(false);
      return true;
    });
    return () => sub.remove();
  }, [expanded]);

  const sheetPadding = { paddingBottom: Math.max(insets.bottom, 16) };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.date}>{formatToday()}</Text>
        <Text style={styles.title}>{headline(tasks)}</Text>
        {tasks.length === 0 && listItems.length === 0 && (
          <Text style={styles.empty}>Nothing planned yet.</Text>
        )}
        {tasks.length > 0 && (
          <View style={styles.cardWrap}>
            <TodayCard
              tasks={tasks}
              onToggle={toggleTask}
              onFocus={(id) => router.push(`/focus/${id}`)}
            />
          </View>
        )}
        {listItems.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open your list"
            onPress={() => router.push('/list')}
            style={({ pressed }) => [styles.cardWrap, styles.listLink, pressed && styles.pressed]}
          >
            <Feather name="list" size={18} color={colors.accent} />
            <Text style={styles.listLinkTitle}>Your list</Text>
            <Text style={styles.listLinkMeta}>
              {listItems.length} {listItems.length === 1 ? 'item' : 'items'}
            </Text>
            <Feather name="chevron-right" size={20} color={colors.placeholder} />
          </Pressable>
        )}
      </ScrollView>

      {expanded ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={styles.scrim}
            onPress={() => setExpanded(false)}
          />
          <View style={styles.sheetExpanded}>
            <PlannerTabs active={tab} onChange={setTab} />
            <View style={[styles.sheet, styles.sheetBody, sheetPadding]}>
              <TextInput
                key={tab}
                style={[styles.input, styles.inputExpanded]}
                value={draft}
                onChangeText={setDraft}
                placeholder={TAB_COPY[tab].placeholder}
                placeholderTextColor={colors.placeholder}
                multiline
                autoFocus
                textAlignVertical="top"
              />
              <Text style={styles.hint}>{TAB_COPY[tab].hint}</Text>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Voice input"
                  style={({ pressed }) => [styles.roundButton, pressed && styles.pressed]}
                >
                  <Feather name="mic" size={22} color={colors.textPrimary} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Add"
                  disabled={!hasDraft}
                  onPress={addDraft}
                  style={({ pressed }) => [
                    styles.roundButton,
                    hasDraft && styles.sendActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Feather
                    name="arrow-up"
                    size={22}
                    color={hasDraft ? colors.surface : colors.textPrimary}
                  />
                </Pressable>
              </View>
            </View>
          </View>
        </>
      ) : (
        <TaskPromptCard
          name={USER_NAME}
          draft={draft}
          bottomPadding={sheetPadding.paddingBottom}
          onPress={() => setExpanded(true)}
        />
      )}

      {flippingTo === 'list' && (
        <PlannerTransition caption="Flipping to your list…" onDone={() => router.push('/list')} />
      )}
      {flippingTo === 'today' && (
        <PlannerTransition
          caption="Flipping to today…"
          fadeOut
          onDone={() => setFlippingTo(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  cardWrap: {
    marginTop: 28,
  },
  listLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  listLinkTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  listLinkMeta: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  empty: {
    marginTop: 28,
    fontSize: 16,
    color: colors.textSecondary,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.scrim,
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
  sheetExpanded: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '62%',
  },
  sheetBody: {
    flex: 1,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 22,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
    paddingVertical: 8,
  },
  inputExpanded: {
    fontSize: 20,
    paddingVertical: 0,
    outlineWidth: 0,
  },
  hint: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roundButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendActive: {
    backgroundColor: colors.textPrimary,
  },
  pressed: {
    opacity: 0.6,
  },
});
