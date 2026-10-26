import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

const useNativeDriver = Platform.OS !== 'web';

type GlowSpec = {
  color: string;
  size: number;
  x: number;
  y: number;
  duration: number;
  driftX: number;
  driftY: number;
};

const GLOWS: GlowSpec[] = [
  { color: '#9BB4E8', size: 0.95, x: -0.28, y: -0.48, duration: 8500, driftX: 36, driftY: 20 },
  { color: '#E0A8C8', size: 0.9, x: 0.42, y: -0.38, duration: 10000, driftX: -28, driftY: 24 },
  { color: '#A8D0BC', size: 0.85, x: 0.0, y: 0.2, duration: 9200, driftX: 24, driftY: -16 },
  { color: '#E8C898', size: 0.8, x: 0.52, y: 0.4, duration: 11000, driftX: -22, driftY: -14 },
  { color: '#B8A8E0', size: 0.75, x: 0.18, y: -0.1, duration: 7800, driftX: 26, driftY: 22 },
];

function GlowBlob({
  id,
  width,
  height,
  spec,
}: {
  id: string;
  width: number;
  height: number;
  spec: GlowSpec;
}) {
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const size = Math.max(width, height) * spec.size;
  const gradientId = `sheet-glow-${id}`;

  useEffect(() => {
    const driftLoop = Animated.loop(
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
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2200 + (spec.duration % 800),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2200 + (spec.duration % 800),
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      ]),
    );
    driftLoop.start();
    pulseLoop.start();
    return () => {
      driftLoop.stop();
      pulseLoop.stop();
    };
  }, [drift, pulse, spec.duration]);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size,
        height: size,
        left: width * spec.x,
        top: height * spec.y,
        opacity: pulse.interpolate({
          inputRange: [0, 1],
          outputRange: [0.8, 1],
        }),
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
            scale: pulse.interpolate({
              inputRange: [0, 1],
              outputRange: [0.96, 1.06],
            }),
          },
        ],
      }}
    >
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={gradientId} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={spec.color} stopOpacity="0.78" />
            <Stop offset="45%" stopColor={spec.color} stopOpacity="0.32" />
            <Stop offset="100%" stopColor={spec.color} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${gradientId})`} />
      </Svg>
    </Animated.View>
  );
}

type AmbientSheetGlowProps = {
  width: number;
  height: number;
  idPrefix?: string;
};

export default function AmbientSheetGlow({ width, height, idPrefix = 'glow' }: AmbientSheetGlowProps) {
  if (width <= 0 || height <= 0) return null;

  return (
    <View style={styles.root} pointerEvents="none">
      {GLOWS.map((glow, index) => (
        <GlowBlob
          key={index}
          id={`${idPrefix}-${index}`}
          width={width}
          height={height}
          spec={glow}
        />
      ))}
      <View style={styles.frost} />
      <View style={styles.sheen} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
  },
  frost: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 252, 248, 0.48)',
  },
  sheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
});
