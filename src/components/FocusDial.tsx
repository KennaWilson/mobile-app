import { useRef } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import type { ReactNode } from 'react';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';

const SIZE = 250;
const STROKE = 14;
const KNOB_RADIUS = 13;
const RADIUS = (SIZE - KNOB_RADIUS * 2 - 4) / 2;
const CENTER = SIZE / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const DIAL_MAX_MINUTES = 60;
const STEP_MINUTES = 5;

type FocusDialProps = {
  /** Fraction of the full dial to fill, 0 to 1. */
  progress: number;
  /** When provided, the knob can be dragged to pick a duration. */
  onChangeMinutes?: (minutes: number) => void;
  minutes?: number;
  children: ReactNode;
};

export default function FocusDial({ progress, onChangeMinutes, minutes, children }: FocusDialProps) {
  const viewRef = useRef<View>(null);
  const origin = useRef({ x: 0, y: 0 });
  const latest = useRef({ onChangeMinutes, minutes });
  latest.current = { onChangeMinutes, minutes };

  const measure = () => {
    viewRef.current?.measureInWindow((x, y) => {
      origin.current = { x, y };
    });
  };

  const updateFromTouch = (event: GestureResponderEvent) => {
    const { onChangeMinutes: onChange, minutes: current = 0 } = latest.current;
    if (!onChange) return;
    const dx = event.nativeEvent.pageX - (origin.current.x + CENTER);
    const dy = event.nativeEvent.pageY - (origin.current.y + CENTER);
    let angle = Math.atan2(dx, -dy);
    if (angle < 0) angle += 2 * Math.PI;
    let next =
      Math.round(((angle / (2 * Math.PI)) * DIAL_MAX_MINUTES) / STEP_MINUTES) * STEP_MINUTES;
    // Crossing 12 o'clock would jump between the ends of the range; pin to whichever end is closer.
    if (next === 0 || next === DIAL_MAX_MINUTES) {
      next = current > DIAL_MAX_MINUTES / 2 ? DIAL_MAX_MINUTES : STEP_MINUTES;
    }
    if (next !== current) onChange(next);
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!latest.current.onChangeMinutes,
      onMoveShouldSetPanResponder: () => !!latest.current.onChangeMinutes,
      onPanResponderGrant: (event) => {
        measure();
        updateFromTouch(event);
      },
      onPanResponderMove: updateFromTouch,
    }),
  ).current;

  const clamped = Math.min(Math.max(progress, 0), 1);
  const knobAngle = clamped * 2 * Math.PI - Math.PI / 2;
  const knobX = CENTER + RADIUS * Math.cos(knobAngle);
  const knobY = CENTER + RADIUS * Math.sin(knobAngle);

  return (
    <View ref={viewRef} onLayout={measure} style={styles.dial} {...panResponder.panHandlers}>
      <Svg width={SIZE} height={SIZE}>
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={colors.track}
          strokeWidth={STROKE}
          fill="none"
        />
        <Circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          stroke={colors.accent}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE * clamped} ${CIRCUMFERENCE}`}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />
        <Circle
          cx={knobX}
          cy={knobY}
          r={KNOB_RADIUS}
          fill={colors.surface}
          stroke={colors.accent}
          strokeWidth={4}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dial: {
    width: SIZE,
    height: SIZE,
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
