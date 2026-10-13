import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddSheet from '../components/AddSheet';
import PlanCard from '../components/PlanCard';
import PlannerTabs, { type PlannerTab } from '../components/PlannerTabs';
import PlannerTransition from '../components/PlannerTransition';
import TaskPromptCard from '../components/TaskPromptCard';
import { useTasks } from '../state/TasksContext';
import { colors, noteColors } from '../theme/colors';
import { formatMinutes } from '../utils/date';

const USER_NAME = 'McKenna';

const FLIP_CAPTIONS: Record<PlannerTab, string> = {
  task: 'Flipping to your tasks…',
  list: 'Flipping to your list…',
  schedule: 'Flipping to your schedule…',
};

const EMPTY_COPY: Record<PlannerTab, string> = {
  task: 'No tasks yet. Add one below.',
  list: 'Nothing on your list yet. Add something below.',
  schedule: 'Nothing scheduled yet. Add a plan below.',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [view, setView] = useState<PlannerTab>('task');
  const [flippingTo, setFlippingTo] = useState<PlannerTab | null>(null);
  const { tasks, addTasks, toggleTask, listItems, addListItems, toggleListItem } = useTasks();

  const save = (tab: PlannerTab, lines: string[]) => {
    if (tab === 'list') addListItems(lines);
    else addTasks(lines, tab);
    setView(tab);
    setDraft('');
    setExpanded(false);
    setFlippingTo(tab);
  };

  useFocusEffect(
    useCallback(() => {
      setFlippingTo(null);
    }, []),
  );

  const bottomPadding = Math.max(insets.bottom, 16);

  const renderCards = () => {
    if (view === 'list') {
      if (listItems.length === 0) return <Text style={styles.empty}>{EMPTY_COPY.list}</Text>;
      return listItems.map((item, index) => (
        <PlanCard
          key={item.id}
          title={item.text}
          noteColor={noteColors[index % noteColors.length]}
          done={item.done}
          details={[item.done ? 'Checked off' : 'On your list']}
          openLabel="Open your list"
          onOpen={() => router.push('/list')}
          onToggle={() => toggleListItem(item.id)}
        />
      ));
    }

    const visible = tasks.filter((task) => task.kind === view);
    if (visible.length === 0) return <Text style={styles.empty}>{EMPTY_COPY[view]}</Text>;
    const upNextId = visible.find((task) => !task.done)?.id;
    return visible.map((task, index) => (
      <PlanCard
        key={task.id}
        title={task.title}
        noteColor={noteColors[index % noteColors.length]}
        done={task.done}
        eyebrow={task.id === upNextId ? 'UP NEXT' : undefined}
        details={[
          task.done ? 'Done' : view === 'schedule' ? 'Scheduled today' : 'Anytime this week',
          `${formatMinutes(task.minutes)} focus`,
        ]}
        openLabel={`Focus on ${task.title}`}
        onOpen={() => router.push(`/focus/${task.id}`)}
        onToggle={() => toggleTask(task.id)}
      />
    ));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.title}>Review your week</Text>
        <PlannerTabs active={view} onChange={setView} variant="icon" style={styles.tabs} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {renderCards()}
      </ScrollView>

      {expanded ? (
        <AddSheet
          draft={draft}
          onChangeDraft={setDraft}
          bottomPadding={bottomPadding}
          onClose={() => setExpanded(false)}
          onSave={save}
        />
      ) : (
        <TaskPromptCard
          name={USER_NAME}
          draft={draft}
          bottomPadding={bottomPadding}
          onPress={() => setExpanded(true)}
        />
      )}

      {flippingTo === 'list' && (
        <PlannerTransition caption={FLIP_CAPTIONS.list} onDone={() => router.push('/list')} />
      )}
      {(flippingTo === 'task' || flippingTo === 'schedule') && (
        <PlannerTransition
          caption={FLIP_CAPTIONS[flippingTo]}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    borderBottomWidth: 1.5,
    borderBottomColor: colors.rule,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    paddingBottom: 10,
  },
  tabs: {
    paddingHorizontal: 0,
    gap: 4,
    marginBottom: -1.5,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 24,
  },
  empty: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
