import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Checkbox from '../components/Checkbox';
import PlannerRings from '../components/PlannerRings';
import { useTasks } from '../state/TasksContext';
import { colors } from '../theme/colors';
import { formatToday } from '../utils/date';

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export default function ListScreen() {
  const insets = useSafeAreaInsets();
  const { listItems, toggleListItem } = useTasks();
  const doneCount = listItems.filter((item) => item.done).length;
  const summary = `${listItems.length} ${listItems.length === 1 ? 'item' : 'items'}${
    doneCount ? ` · ${doneCount} done` : ''
  }`;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
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
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}>
        <View style={styles.page}>
          <PlannerRings count={9} />
          <Text style={styles.date}>{formatToday()}</Text>
          <Text style={styles.title}>Your list</Text>
          <Text style={styles.summary}>{listItems.length ? summary : 'Nothing on your list yet.'}</Text>

          <View style={styles.items}>
            {listItems.map((item) => (
              <View key={item.id} style={styles.item}>
                <Checkbox
                  checked={item.done}
                  label={item.text}
                  onToggle={() => toggleListItem(item.id)}
                />
                <Text style={[styles.itemText, item.done && styles.itemTextDone]}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
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
    paddingBottom: 8,
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
  content: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  page: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 22,
    paddingTop: 32,
    paddingBottom: 12,
    minHeight: 420,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
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
  summary: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
  },
  items: {
    marginTop: 18,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  itemText: {
    flex: 1,
    fontSize: 17,
    color: colors.textPrimary,
  },
  itemTextDone: {
    color: colors.placeholder,
    textDecorationLine: 'line-through',
  },
  pressed: {
    opacity: 0.7,
  },
});
