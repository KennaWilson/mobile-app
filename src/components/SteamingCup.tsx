import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../theme/colors';

const SQUIGGLE = 'M6 26 C 0 20, 12 14, 6 8 C 2 4, 8 0, 6 0';

type SteamingCupProps = {
  /** Steam drifts while true and rests when false. */
  steaming: boolean;
};

export default function SteamingCup({ steaming }: SteamingCupProps) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!steaming) {
      drift.stopAnimation();
      drift.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: 2200,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [steaming, drift]);

  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [4, -6] });
  const opacity = drift.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0.35, 1, 1, 0.2] });

  return (
    <View style={styles.wrap} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Animated.View
        style={[styles.steam, steaming && { opacity, transform: [{ translateY }] }]}
      >
        {[0, 1, 2].map((index) => (
          <Svg key={index} width={12} height={28} viewBox="0 0 12 28">
            <Path d={SQUIGGLE} stroke={colors.textSecondary} strokeWidth={2} strokeLinecap="round" fill="none" />
          </Svg>
        ))}
      </Animated.View>
      <MaterialCommunityIcons name="coffee-outline" size={64} color={colors.textPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
  },
  steam: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: -2,
    marginRight: 10,
    opacity: 0.6,
  },
});
