import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AddSheet from '../components/AddSheet';
import AmbientBackground from '../components/AmbientBackground';
import ConnectCarousel from '../components/ConnectCarousel';
import PlanCard from '../components/PlanCard';
import PlannerTabs, { type PlannerTab } from '../components/PlannerTabs';
import PlannerTransition from '../components/PlannerTransition';
import TaskBoard from '../components/TaskBoard';
import TaskPromptCard from '../components/TaskPromptCard';
import { useTasks, type TaskDetails } from '../state/TasksContext';
import { colors, noteColors } from '../theme/colors';

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

  const save = (tab: PlannerTab, lines: string[], details?: TaskDetails) => {
    if (tab === 'list') {
      addListItems(lines);
      setView('list');
      setFlippingTo('list');
    } else {
      const answers = details ?? { minutes: 25, type: tab === 'schedule' ? 'event' : 'task', due: 'today' as const, priority: 'should' as const };
      addTasks(lines, answers);
      const nextView: PlannerTab = answers.type === 'event' ? 'schedule' : 'task';
      setView(nextView);
      setFlippingTo(nextView);
    }
    setDraft('');
    setExpanded(false);
  };

  useFocusEffect(
    useCallback(() => {
      setFlippingTo(null);
    }, []),
  );

  const bottomPadding = Math.max(insets.bottom, 16);

  const renderEmpty = (message: string) => (
    <View>
      <Text style={styles.empty}>{message}</Text>
      <ConnectCarousel />
    </View>
  );

  const renderCards = () => {
    if (view === 'list') {
      if (listItems.length === 0) return renderEmpty(EMPTY_COPY.list);
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
    if (view === 'task') {
      if (visible.length === 0) return renderEmpty(EMPTY_COPY.task);
      return <TaskBoard tasks={visible} onToggle={toggleTask} />;
    }
    if (visible.length === 0) return renderEmpty(EMPTY_COPY[view]);
    return visible.map((task, index) => (
      <PlanCard
        key={task.id}
        title={task.title}
        noteColor={noteColors[index % noteColors.length]}
        done={task.done}
        details={[task.done ? 'Done' : 'Scheduled today']}
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
      <AmbientBackground />
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View style={styles.tabRule}>
          <PlannerTabs active={view} onChange={setView} variant="icon" style={styles.tabs} />
        </View>
        <Text style={styles.title}>Review your week</Text>
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
          name={USER_NAME}
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
    marginHorizontal: 20,
    zIndex: 1,
  },
  tabRule: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#24315C',
  },
  scroll: {
    flex: 1,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: -0.3,
    paddingTop: 14,
    paddingBottom: 0,
  },
  tabs: {
    alignSelf: 'flex-end',
    paddingHorizontal: 0,
    gap: 4,
    marginBottom: -1.5,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },
  empty: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});
