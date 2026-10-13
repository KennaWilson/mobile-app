import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';
import PlannerRings from './PlannerRings';
import { colors } from '../theme/colors';

const PAGE_WIDTH = 120;
const PAGE_HEIGHT = 160;
const FOLD_MS = 650;

function GridPage() {
  const inset = 16;
  const cells = 4;
  const step = (PAGE_WIDTH - inset * 2) / cells;
  const lines = Array.from({ length: cells + 1 }, (_, index) => inset + index * step);
  const top = 28;
  const bottom = top + step * cells;
  return (
    <Svg width={PAGE_WIDTH} height={PAGE_HEIGHT}>
      {lines.map((x) => (
        <Line key={`v${x}`} x1={x} y1={top} x2={x} y2={bottom} stroke={colors.track} strokeWidth={1.5} />
      ))}
      {lines.map((x, index) => (
        <Line
          key={`h${x}`}
          x1={inset}
          y1={top + index * step}
          x2={PAGE_WIDTH - inset}
          y2={top + index * step}
          stroke={colors.track}
          strokeWidth={1.5}
        />
      ))}
    </Svg>
  );
}

type PlannerTransitionProps = {
  caption: string;
  /** Fade the overlay away at the end, for when there's no new screen to cover it. */
  fadeOut?: boolean;
  onDone: () => void;
};

export default function PlannerTransition({ caption, fadeOut = false, onDone }: PlannerTransitionProps) {
  const appear = useRef(new Animated.Value(0)).current;
  const fold = useRef(new Animated.Value(0)).current;
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    let cancelled = false;
    const useNativeDriver = Platform.OS !== 'web';
    const easing = Easing.inOut(Easing.cubic);

    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (cancelled) return;
      if (reduceMotion) {
        onDoneRef.current();
        return;
      }
      Animated.sequence([
        Animated.timing(appear, { toValue: 1, duration: 200, useNativeDriver }),
        Animated.delay(150),
        Animated.timing(fold, { toValue: 1, duration: FOLD_MS, easing, useNativeDriver }),
        Animated.delay(350),
        Animated.timing(fold, { toValue: 0, duration: FOLD_MS, easing, useNativeDriver }),
        Animated.delay(250),
        ...(fadeOut ? [Animated.timing(appear, { toValue: 0, duration: 250, useNativeDriver })] : []),
      ]).start(({ finished }) => {
        if (finished && !cancelled) onDoneRef.current();
      });
    });

    return () => {
      cancelled = true;
    };
  }, [appear, fold, fadeOut]);

  const rotateY = fold.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const insideOpacity = fold.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [1, 1, 0, 0],
  });
  const coverOpacity = fold.interpolate({
    inputRange: [0, 0.5, 0.501, 1],
    outputRange: [0, 0, 1, 1],
  });
  const centerShift = fold.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -PAGE_WIDTH / 2],
  });
  const scale = appear.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });

  return (
    <Animated.View
      style={[styles.overlay, { opacity: appear }]}
      accessibilityRole="progressbar"
      accessibilityLabel={caption}
    >
      <Animated.View style={[styles.book, { transform: [{ translateX: centerShift }, { scale }] }]}>
        <View style={[styles.page, styles.rightPage]}>
          <PlannerRings count={4} size="small" />
          <GridPage />
        </View>

        <Animated.View
          style={[
            styles.leftPage,
            {
              transform: [
                { perspective: 900 },
                { translateX: PAGE_WIDTH / 2 },
                { rotateY },
                { translateX: -PAGE_WIDTH / 2 },
              ],
            },
          ]}
        >
          <Animated.View style={[styles.page, styles.face, { opacity: insideOpacity }]}>
            <PlannerRings count={4} size="small" />
            <GridPage />
          </Animated.View>
          <Animated.View style={[styles.cover, styles.face, { opacity: coverOpacity }]}>
            <PlannerRings count={4} size="small" />
            <View style={styles.coverLabel}>
              <Text style={styles.coverText}>planner</Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Animated.View>

      <Text style={styles.caption}>{caption}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    zIndex: 10,
    elevation: 20,
  },
  book: {
    width: PAGE_WIDTH * 2,
    height: PAGE_HEIGHT,
  },
  page: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
  },
  rightPage: {
    position: 'absolute',
    left: PAGE_WIDTH,
    top: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  leftPage: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
  face: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cover: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    // The cover is seen from behind once the page flips past 90°, so un-mirror it.
    transform: [{ scaleX: -1 }],
  },
  coverLabel: {
    borderWidth: 1.5,
    borderColor: colors.textPrimary,
    backgroundColor: colors.surface,
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  coverText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  caption: {
    marginTop: 40,
    fontSize: 15,
    color: colors.textSecondary,
  },
});
