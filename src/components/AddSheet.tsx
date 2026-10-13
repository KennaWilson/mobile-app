import { useEffect, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import PlannerTabs, { type PlannerTab } from './PlannerTabs';
import { splitLines } from '../state/TasksContext';
import { colors } from '../theme/colors';

const TAB_COPY: Record<PlannerTab, { placeholder: string; hint: string; savingTo: string }> = {
  task: {
    placeholder: 'What needs to get done?',
    hint: 'One thing or everything at once.',
    savingTo: 'Tasks',
  },
  list: { placeholder: "What's on the list?", hint: 'One item per line.', savingTo: 'Your list' },
  schedule: { placeholder: "What's happening today?", hint: 'One plan per line.', savingTo: 'Schedule' },
};

type AddSheetProps = {
  draft: string;
  onChangeDraft: (text: string) => void;
  bottomPadding: number;
  onClose: () => void;
  onSave: (tab: PlannerTab, lines: string[]) => void;
};

export default function AddSheet({ draft, onChangeDraft, bottomPadding, onClose, onSave }: AddSheetProps) {
  const [tab, setTab] = useState<PlannerTab>('task');
  const [reviewing, setReviewing] = useState(false);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const lines = splitLines(draft);
  const keptLines = lines.filter((_, index) => !skipped.has(index));

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (reviewing) setReviewing(false);
      else onClose();
      return true;
    });
    return () => sub.remove();
  }, [reviewing, onClose]);

  const startReview = () => {
    setSkipped(new Set());
    setReviewing(true);
  };

  const toggleLine = (index: number) => {
    setSkipped((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={styles.scrim}
        onPress={onClose}
      />
      <View style={styles.container}>
        <PlannerTabs active={tab} onChange={setTab} />
        <View style={[styles.sheet, { paddingBottom: bottomPadding }]}>
          {reviewing ? (
            <>
              <Text style={styles.reviewTitle}>Save to plan?</Text>
              <Text style={styles.reviewSubtitle}>
                Saving to {TAB_COPY[tab].savingTo}. Tap anything you want to leave out.
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
                      <Text style={[styles.reviewText, !kept && styles.reviewTextSkipped]}>{line}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setReviewing(false)}
                  style={({ pressed }) => [styles.textButton, pressed && styles.pressed]}
                >
                  <Text style={styles.textButtonLabel}>Edit</Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save to plan"
                  disabled={keptLines.length === 0}
                  onPress={() => onSave(tab, keptLines)}
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
          ) : (
            <>
              <TextInput
                key={tab}
                style={styles.input}
                value={draft}
                onChangeText={onChangeDraft}
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
                  accessibilityLabel="Review"
                  disabled={lines.length === 0}
                  onPress={startReview}
                  style={({ pressed }) => [
                    styles.roundButton,
                    lines.length > 0 && styles.sendActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Feather
                    name="arrow-up"
                    size={22}
                    color={lines.length > 0 ? colors.surface : colors.textPrimary}
                  />
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
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
    backgroundColor: colors.scrim,
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '62%',
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
  },
  input: {
    flex: 1,
    fontSize: 20,
    color: colors.textPrimary,
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
