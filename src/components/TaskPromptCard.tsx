import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AmbientSheetGlow from './AmbientSheetGlow';
import { colors } from '../theme/colors';
import { personalizedGreeting } from '../utils/greeting';

const ROTATING_WORDS = ['task', 'list', 'schedule'];
const ROTATE_EVERY_MS = 2400;
const FADE_MS = 200;
const useNativeDriver = Platform.OS !== 'web';

type TaskPromptCardProps = {
  name: string;
  draft: string;
  bottomPadding: number;
  onPress: () => void;
};

export default function TaskPromptCard({ name, draft, bottomPadding, onPress }: TaskPromptCardProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [cardHeight, setCardHeight] = useState(180);
  const opacity = useRef(new Animated.Value(1)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();
  const hasDraft = draft.trim().length > 0;

  useEffect(() => {
    if (hasDraft) return;
    const interval = setInterval(() => {
      Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver }).start(() => {
        setWordIndex((index) => (index + 1) % ROTATING_WORDS.length);
        Animated.timing(opacity, { toValue: 1, duration: FADE_MS, useNativeDriver }).start();
      });
    }, ROTATE_EVERY_MS);
    return () => clearInterval(interval);
  }, [hasDraft, opacity]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 2800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const starScale = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const starOpacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.7, 1],
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.glowHalo} pointerEvents="none" />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create a task"
        onPress={onPress}
        onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}
        style={[styles.card, { paddingBottom: bottomPadding }]}
      >
        <AmbientSheetGlow width={width} height={cardHeight} idPrefix="prompt" />

        <View style={styles.content}>
          <View style={styles.greetingRow}>
            <Animated.View style={{ opacity: starOpacity, transform: [{ scale: starScale }] }}>
              <MaterialCommunityIcons name="star-four-points" size={16} color={colors.accent} />
            </Animated.View>
            <Text style={styles.greeting}>{personalizedGreeting(name)}</Text>
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
        </View>
      </Pressable>

      <View style={styles.pin} pointerEvents="none">
        <MaterialCommunityIcons name="pin" size={28} color={colors.accent} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
    zIndex: 2,
  },
  glowHalo: {
    position: 'absolute',
    left: 8,
    right: 8,
    top: 6,
    bottom: -8,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: 'rgba(155, 180, 232, 0.32)',
    shadowColor: '#9BB4E8',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
  },
  card: {
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: 24,
    paddingTop: 26,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.42)',
    shadowColor: '#8B9FD0',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 14,
  },
  content: {
    zIndex: 1,
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
    elevation: 15,
    zIndex: 3,
  },
});
