import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const ROTATING_WORDS = ['task', 'list', 'schedule'];
const ROTATE_EVERY_MS = 2400;
const FADE_MS = 200;

type TaskPromptCardProps = {
  name: string;
  draft: string;
  bottomPadding: number;
  onPress: () => void;
};

export default function TaskPromptCard({ name, draft, bottomPadding, onPress }: TaskPromptCardProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const opacity = useRef(new Animated.Value(1)).current;
  const hasDraft = draft.trim().length > 0;

  useEffect(() => {
    if (hasDraft) return;
    const useNativeDriver = Platform.OS !== 'web';
    const interval = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver }).start(() => {
        setWordIndex((index) => (index + 1) % ROTATING_WORDS.length);
        Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver }).start();
      });
    }, ROTATE_EVERY_MS);
    return () => clearInterval(interval);
  }, [hasDraft, opacity]);

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create a task"
        onPress={onPress}
        style={[styles.card, { paddingBottom: bottomPadding }]}
      >
        <View style={styles.greetingRow}>
          <MaterialCommunityIcons name="star-four-points-outline" size={16} color={colors.accent} />
          <Text style={styles.greeting}>Hey {name}</Text>
        </View>

        {hasDraft ? (
          <Text style={styles.prompt} numberOfLines={1}>
            {draft}
          </Text>
        ) : (
          <Text style={styles.prompt}>
            Create a{' '}
            <Animated.Text style={[styles.promptWord, { opacity }]}>
              {ROTATING_WORDS[wordIndex]}
            </Animated.Text>
          </Text>
        )}

        <MaterialCommunityIcons
          name="chevron-double-up"
          size={22}
          color={colors.placeholder}
          style={styles.chevron}
        />
      </Pressable>

      <View style={styles.pin} pointerEvents="none">
        <MaterialCommunityIcons name="pin" size={28} color={colors.accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    paddingHorizontal: 24,
    paddingTop: 26,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 12,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  prompt: {
    marginTop: 14,
    fontSize: 24,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  promptWord: {
    color: colors.accent,
  },
  chevron: {
    alignSelf: 'center',
    marginTop: 18,
  },
  pin: {
    position: 'absolute',
    top: -12,
    right: 26,
    transform: [{ rotate: '35deg' }],
    elevation: 13,
  },
});
