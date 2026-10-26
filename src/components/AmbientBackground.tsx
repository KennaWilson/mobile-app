import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '../theme/colors';

const useNativeDriver = Platform.OS !== 'web';

type BlobSpec = {
  color: string;
  size: number;
  x: number;
  y: number;
  duration: number;
  driftX: number;
  driftY: number;
  phase: number;
};

const BLOBS: BlobSpec[] = [
  { color: '#C4D8F0', size: 0.95, x: -0.3, y: -0.2, duration: 12000, driftX: 48, driftY: 36, phase: 0 },
  { color: '#D4E4F8', size: 0.9, x: 0.42, y: -0.16, duration: 14000, driftX: -40, driftY: 42, phase: 0.2 },
  { color: '#C8DCF4', size: 0.92, x: 0.12, y: 0.28, duration: 15500, driftX: 34, driftY: -32, phase: 0.4 },
  { color: '#D8E8FC', size: 0.78, x: -0.2, y: 0.48, duration: 13000, driftX: 40, driftY: -28, phase: 0.6 },
  { color: '#B8D0EC', size: 0.74, x: 0.52, y: 0.5, duration: 14500, driftX: -36, driftY: 26, phase: 0.8 },
  { color: '#E0ECFC', size: 0.7, x: 0.05, y: 0.08, duration: 11000, driftX: 30, driftY: 28, phase: 0.3 },
];

function AmbientBlob({
  id,
  width,
  height,
  spec,
  shift,
}: {
  id: string;
  width: number;
  height: number;
  spec: BlobSpec;
  shift: Animated.Value;
}) {
  const drift = useRef(new Animated.Value(0)).current;
  const size = Math.max(width, height) * spec.size;
  const gradientId = `bg-glow-${id}`;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: spec.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: spec.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [drift, spec.duration]);

  const opacity = shift.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [
      0.35 + spec.phase * 0.4,
      0.95 - Math.abs(spec.phase - 0.25) * 0.5,
      0.4 + (1 - Math.abs(spec.phase - 0.5)) * 0.55,
      0.9 - Math.abs(spec.phase - 0.75) * 0.45,
      0.35 + spec.phase * 0.4,
    ],
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.blob,
        {
          width: size,
          height: size,
          left: width * spec.x,
          top: height * spec.y,
          opacity,
          transform: [
            {
              translateX: drift.interpolate({
                inputRange: [0, 1],
                outputRange: [0, spec.driftX],
              }),
            },
            {
              translateY: drift.interpolate({
                inputRange: [0, 1],
                outputRange: [0, spec.driftY],
              }),
            },
            {
              scale: shift.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.92 + spec.phase * 0.08, 1.1, 0.94 + spec.phase * 0.06],
              }),
            },
          ],
        },
      ]}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={spec.color} stopOpacity="0.82" />
            <Stop offset="45%" stopColor={spec.color} stopOpacity="0.38" />
            <Stop offset="100%" stopColor={spec.color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}

export default function AmbientBackground() {
  const { width, height } = useWindowDimensions();
  const shift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const sequence = Animated.loop(
      Animated.sequence([
        Animated.timing(shift, {
          toValue: 1,
          duration: 10000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
        Animated.timing(shift, {
          toValue: 0,
          duration: 10000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      ]),
    );
    sequence.start();
    return () => sequence.stop();
  }, [shift]);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="wash" cx="42%" cy="26%" r="78%">
            <Stop offset="0%" stopColor="#F4F8FC" stopOpacity="1" />
            <Stop offset="45%" stopColor="#E6F0F8" stopOpacity="1" />
            <Stop offset="100%" stopColor="#D8E6F4" stopOpacity="1" />
          </RadialGradient>
        </Defs>
        <Rect x={0} y={0} width={width} height={height} fill="url(#wash)" />
      </Svg>

      <Animated.View
        style={[
          styles.tintBlue,
          {
            opacity: shift.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.15, 0.55, 0.2],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.tintGreen,
          {
            opacity: shift.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.5, 0.12, 0.45],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.tintTeal,
          {
            opacity: shift.interpolate({
              inputRange: [0, 0.33, 0.66, 1],
              outputRange: [0.1, 0.48, 0.18, 0.12],
            }),
          },
        ]}
      />

      {BLOBS.map((blob, index) => (
        <AmbientBlob
          key={index}
          id={String(index)}
          width={width}
          height={height}
          spec={blob}
          shift={shift}
        />
      ))}

      <View style={styles.veil} />
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
  tintBlue: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(176, 204, 236, 0.5)',
  },
  tintGreen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(196, 220, 244, 0.45)',
  },
  tintTeal: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(168, 196, 232, 0.38)',
  },
  veil: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    opacity: 0.1,
  },
});
