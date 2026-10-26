import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

const useNativeDriver = Platform.OS !== 'web';

const WISPS = [
  { d: 'M8 34 C 3 26, 13 22, 7 14 C 4 9, 11 5, 8 0', duration: 2600, delay: 0, sway: 3 },
  { d: 'M6 34 C 12 25, 1 18, 8 11 C 12 7, 4 3, 7 0', duration: 3100, delay: 700, sway: -3.5 },
  { d: 'M7 34 C 2 23, 14 17, 6 9 C 3 5, 10 2, 7 0', duration: 2800, delay: 1400, sway: 2.5 },
];

function SteamWisp({
  d,
  duration,
  delay,
  sway,
  active,
}: {
  d: string;
  duration: number;
  delay: number;
  sway: number;
  active: boolean;
}) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    const start = setTimeout(() => {
      loop = Animated.loop(
        Animated.timing(drift, {
          toValue: 1,
          duration: active ? duration : duration + 900,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      );
      loop.start();
    }, delay);
    return () => {
      clearTimeout(start);
      loop?.stop();
      drift.setValue(0);
    };
  }, [active, delay, drift, duration]);

  const travel = active ? -18 : -10;

  return (
    <Animated.View
      style={{
        opacity: drift.interpolate({
          inputRange: [0, 0.15, 0.55, 1],
          outputRange: [0, active ? 0.85 : 0.45, active ? 0.7 : 0.35, 0],
        }),
        transform: [
          {
            translateY: drift.interpolate({
              inputRange: [0, 1],
              outputRange: [6, travel],
            }),
          },
          {
            translateX: drift.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, sway, 0],
            }),
          },
        ],
      }}
    >
      <Svg width={16} height={36} viewBox="0 0 16 36">
        <Path d={d} stroke="#A7ADC4" strokeWidth={1.6} strokeLinecap="round" fill="none" />
      </Svg>
    </Animated.View>
  );
}

type SteamingCupProps = {
  /** Steam drifts while true and rests when false. */
  steaming: boolean;
};

export default function SteamingCup({ steaming }: SteamingCupProps) {
  const bob = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: steaming ? 1400 : 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: steaming ? 1400 : 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [bob, steaming]);

  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={styles.steam}>
        {WISPS.map((wisp) => (
          <SteamWisp key={wisp.d} {...wisp} active={steaming} />
        ))}
      </View>
      <Animated.View
        style={{
          transform: [
            {
              translateY: bob.interpolate({
                inputRange: [0, 1],
                outputRange: [0, steaming ? -2 : -1],
              }),
            },
          ],
        }}
      >
        <MaterialCommunityIcons name="coffee-outline" size={64} color={colors.textPrimary} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  steam: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 36,
    gap: 2,
    marginBottom: -4,
    marginRight: 10,
  },
});
