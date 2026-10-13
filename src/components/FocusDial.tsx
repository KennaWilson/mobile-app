import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, PanResponder, StyleSheet, View } from 'react-native';
import type { GestureResponderEvent } from 'react-native';
import type { ReactNode } from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';

const SIZE = 250;
const STROKE = 10;
const KNOB_RADIUS = 13;
const RADIUS = (SIZE - KNOB_RADIUS * 2 - 4) / 2;
const CENTER = SIZE / 2;
const WAVE_COUNT = 44;
const WAVE_AMPLITUDE = 4;
const WAVE_STROKE = 5;
/** Radians per second the ripple travels along the line while the timer runs. */
const WAVE_SPEED = 4;
const TICK_PULSE_MS = 300;

function wavyArc(progress: number, wavePhase: number) {
  const sweep = progress * 2 * Math.PI;
  const steps = Math.max(2, Math.ceil(progress * 480));
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * sweep;
    const r = RADIUS + WAVE_AMPLITUDE * Math.sin(WAVE_COUNT * angle + wavePhase);
    const x = CENTER + r * Math.sin(angle);
    const y = CENTER - r * Math.cos(angle);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d;
}

export const DIAL_MAX_MINUTES = 60;
const STEP_MINUTES = 5;

type FocusDialProps = {
  /** Fraction of the full dial to fill, 0 to 1. */
  progress: number;
  /** When provided, the knob can be dragged to pick a duration. */
  onChangeMinutes?: (minutes: number) => void;
  minutes?: number;
  /** Animate the ripple and pulse the knob each second, so time visibly passes. */
  running?: boolean;
  children: ReactNode;
};

function useRunningClock(running: boolean) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (!running || reduceMotion) return;
    let frame = 0;
    let last: number | null = null;
    const step = (now: number) => {
      if (last !== null) {
        const delta = now - last;
        setElapsedMs((current) => current + delta);
      }
      last = now;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [running, reduceMotion]);

  return elapsedMs;
}

export default function FocusDial({
  progress,
  onChangeMinutes,
  minutes,
  running = false,
  children,
}: FocusDialProps) {
  const elapsedMs = useRunningClock(running);
  const wavePhase = ((elapsedMs / 1000) * WAVE_SPEED) % (2 * Math.PI);
  const sinceTick = elapsedMs % 1000;
  const knobRadius =
    running && sinceTick < TICK_PULSE_MS
      ? KNOB_RADIUS + 3 * (1 - sinceTick / TICK_PULSE_MS)
      : KNOB_RADIUS;
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
        {clamped > 0 && (
          <Path
            d={wavyArc(clamped, wavePhase)}
            stroke={colors.accent}
            strokeWidth={WAVE_STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
        <Circle
          cx={knobX}
          cy={knobY}
          r={knobRadius}
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
